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
const port = process.env.PORT || 3000;
const session = require("express-session");

app.use(
  session({
    secret: "mySecretKeyMoveo",
    resave: false,
    saveUninitialized: true,
  })
);
//
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//socketIO!!!!!!!!!
io.on("connection", (socket) => {
  console.log("new user logged in");

  //event that the admin send
  socket.on("start-redirect", (url) => {
    io.emit("redirect-all", url); // redirect all
  });

  socket.on("set-auto-scroll", (value) => {
    io.emit("update-auto-scroll", value);
  });
});
//connect to mySQL DB
const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database.");
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});
//admin signup
app.post("/signup-admin", (req, res) => {
  const { username, password, instrument } = req.body;

  // only Admin can use this
  if (instrument !== "admin") {
    return res.status(400).send("Unauthorized instrument type");
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.redirect("/signup-admin.html?error=username_taken");
      }

      db.query(
        "INSERT INTO users (username, password, instrument) VALUES (?, ?, ?)",
        [username, password, instrument],
        (err) => {
          if (err) throw err;
          res.redirect("/login.html");
        }
      );
    }
  );
});

// regular user signup
app.post("/signup", (req, res) => {
  const { username, password, instrument } = req.body;
  //blocking regular user to intent signup as admin
  if (instrument === "admin") {
    return res.status(400).send("Invalid instrument selection");
  }

  // checking first if the user exist
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        //user already exist with this name
        return res.redirect("/signup.html?error=username_taken");
      }

      //user not exist make new one
      db.query(
        "INSERT INTO users (username, password, instrument) VALUES (?, ?, ?)",
        [username, password, instrument],
        (err) => {
           res.redirect("/login.html");
        }
      );
    }
  );
});
//login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const user = results[0];

        // save in session
        req.session.username = user.username;
        req.session.instrument = user.instrument;
        console.log(`im playing ${user.instrument}`)
        if (user.instrument === "admin") {
          res.redirect("/main-admin.html");
        } else {
          res.redirect("/main-player.html");
        }
      } else {
        res.redirect("/login.html?error=1");
      }
    }
  );
});

//getting specific user instrument
app.get("/whoami", (req, res) => {
  const instrument = req.session.instrument;
  const username = req.session.username;

  if (!instrument) {
    return res.send("instrument not found");
  }

  res.send(`${instrument}`);
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
        return res.status(500).json({ error: "server error" });
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
      if (err) return res.status(500).json({ error: "server error" });

      if (results.length > 0) {
        try {
          const parsed = JSON.parse(results[0].content);
          res.json({ content: parsed });
        } catch (e) {
          res.status(500).json({ error: "Invalid JSON content" });
        }
      } else {
        res.status(404).json({ error: "Song not found" });
      }
    }
  );
});

//adding songs hadrcoded to the table
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
      // if not exist add to table
      db.query(
        "INSERT INTO songs (name, artist, content) VALUES (?, ?, ?)",
        ["Hey Jude", "The Beatles", heyJudeContent],
        (err, result) => {
          if (err) throw err;
          console.log("Song added to table");
        }
      );
    } else {
      console.log("Song already exists in table");
    }
  }
);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
