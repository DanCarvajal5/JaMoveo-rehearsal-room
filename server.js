const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mysql = require("mysql2");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const port = 3000;

//
const session = require("express-session");

app.use(
  session({
    secret: "mySecretKey", // תחליף במשהו מאובטח בפרויקט אמיתי
    resave: false,
    saveUninitialized: true,
  })
);
//
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//socketIO!!!!!!!!!
//אני כאילו יוצר פה את הפונקציות של הסוקט
io.on("connection", (socket) => {
  console.log("🔌 משתמש התחבר");

  // אירוע שנשלח מהאדמין
  socket.on("start-redirect", (url) => {
    console.log("📢 שליחת redirect לכולם:", url);
    io.emit("redirect-all", url); // שולח לכולם
  });


  // 💬 שליחת הודעה חיה לדף live
  socket.on("send-message-to-live", (message) => {
    console.log("💬 שליחת הודעה ל-live:", message);
    io.emit("receive-live-message", message);
  });

});

//

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
// app.post("/login", (req, res) => {
//   const { username, password, instrument } = req.body;
//   db.query(
//     "SELECT * FROM users WHERE username = ? AND password = ?",
//     [username, password, instrument],
//     (err, results) => {
//       if (err) throw err;
//       if (results.length > 0) {
//         const user = results[0];
//         if (user.instrument === "admin") {
//           res.redirect("/main-admin.html");
//         } else {
//           res.redirect("/main-player.html");
//         }
//       } else {
//         res.send("❌ שם משתמש או סיסמה שגויים");
//       }
//     }
//   );
// });
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const user = results[0];

        // שמירה ב-session
        req.session.username = user.username;
        req.session.instrument = user.instrument;

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

//getting specific user instrument
app.get("/whoami", (req, res) => {
  const instrument = req.session.instrument;
  const username = req.session.username;

  if (!instrument) {
    return res.send("❌ לא מחובר");
  }

  res.send(`${instrument}`);
});
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
          res.json(parsedContent);
          res.redirect("/results-admin.html");
          sohowFundSong();
        } catch (parseErr) {
          res.status(500).send("❌ תוכן JSON לא תקין");
        }
      } else {
        res.status(404).send("❌ שיר לא נמצא");
      }
    }
  );
});

//check if song exist and sending it to see song name and artist
app.post("/check-song", (req, res) => {
  const { name } = req.body;

  db.query(
    "SELECT artist FROM songs WHERE name = ?",
    [name],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "שגיאה בשרת" });
      }

      if (results.length > 0) {
        res.json({
          exists: true,
          artist: results[0].artist,
        });
      } else {
        res.json({ exists: false });
      }
    }
  );
});

//
// geting the song lyrics+notation by song name
app.post("/get-song-by-name", (req, res) => {
  const { name } = req.body;

  db.query(
    "SELECT content FROM songs WHERE name = ?",
    [name],
    (err, results) => {
      if (err) return res.status(500).json({ error: "שגיאה בשרת" });

      if (results.length > 0) {
        try {
          const parsed = JSON.parse(results[0].content);
          res.json({ content: parsed });
        } catch (e) {
          res.status(500).json({ error: "תוכן JSON לא תקין" });
        }
      } else {
        res.status(404).json({ error: "שיר לא נמצא" });
      }
    }
  );
});

//

//adding songs hadrcoded to the table
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

server.listen(port, () => {
  console.log(`🌐 Server running at http://localhost:${port}`);
});
