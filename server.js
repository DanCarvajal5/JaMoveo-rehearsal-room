const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

//

// socket
// const io = require('socket.io')(server); // אחרי יצירת השרת

// io.on('connection', (socket) => {
//   console.log("User connected");

//   socket.on('start-live', (songData) => {
//     // ברגע שאדמין לוחץ על שיר
//     io.emit('go-to-live', songData); // שולח לכולם לעבור לדף live.html
//   });

//   socket.on('stop-live', () => {
//     io.emit('end-live'); // שולח לכולם להפסיק שידור
//   });
// });

//

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
  const { username, password, instrument } = req.body;
  db.query(
    "INSERT INTO users (username, password,  instrument) VALUES (?, ?,  ?)",
    [username, password, instrument],
    (err) => {
      if (err) throw err;
      res.redirect("/login.html");
    }
  );
});

// דף התחברות
app.post("/login", (req, res) => {
  const { username, password, instrument } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password, instrument],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const user = results[0];
        if (user.instrument === "admin") {
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

//serch songs
app.post("/get-song", (req, res) => {
  const { name } = req.body;

  db.query(
    "SELECT content FROM songs WHERE name = ?",
    [name],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("❌ שגיאה בשרת");
      }

      if (results.length > 0) {
        const songContent = results[0].content;
        try {
          const parsedContent = JSON.parse(songContent);
          // res.json(parsedContent);
          res.redirect("/results-admin.html");
        } catch (parseErr) {
          res.status(500).send("❌ תוכן JSON לא תקין");
        }
      } else {
        res.status(404).send("❌ שיר לא נמצא");
      }
    }
  );
});

// קריאת תוכן הקבצים
const heyJudeContent = fs.readFileSync(
  path.join(__dirname, "songs", "hey_jude.json"),
  "utf8"
);
const veechSheloContent = fs.readFileSync(
  path.join(__dirname, "songs", "veech_shelo.json"),
  "utf8"
);
//check if songs already exist in DB if not add them
db.query(
  "SELECT * FROM songs WHERE name = ? AND artist = ?",
  ["Hey Jude", "The Beatles"],
  (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      // אם לא נמצא – תכניס את השיר
      db.query(
        "INSERT INTO songs (name, artist, content) VALUES (?, ?, ?)",
        ["Hey Jude", "The Beatles", heyJudeContent],
        (err, result) => {
          if (err) throw err;
          console.log("✅ Hey Jude נוסף לטבלה");
        }
      );
    } else {
      console.log("⚠️ השיר Hey Jude כבר קיים בטבלה");
    }
  }
);

app.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
});
