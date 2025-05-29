const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // או הסיסמה שלך אם שינית
  database: "rehearsal-room", // ← זה חשוב שיהיה בדיוק כמו שקראת למסד!
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ MySQL Connected");
});

// דף הרשמה
app.post("/signup", (req, res) => {
  const { username, password, admin } = req.body;
  db.query(
    "INSERT INTO users (username, password, admin) VALUES (?, ?, ?)",
    [username, password, admin === "on" ? 1 : 0],
    (err) => {
      if (err) throw err;
      res.redirect("/login.html");
    }
  );
});

// דף התחברות
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const user = results[0];
        if (user.admin) {
          res.redirect("/main-admin.html");
        } else {
          res.redirect("/main-player.html");
        }
      } else {
        res.send("❌ שם משתמש או סיסמה שגויים");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
});
