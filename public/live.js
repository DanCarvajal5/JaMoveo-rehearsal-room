const params = new URLSearchParams(window.location.search);
const songName = params.get("song");
console.log("the name of the song is :" + songName);
let userInstument;

let data = [];
let autoScroll = true;
let scrollIntervalId = null; // מזהה של הטיימר כדי שנוכל לעצור אותו

const socket = io();
//this is for the case that the admin will end the season
socket.on("redirect-all", (url) => {
  console.log("📡 קיבלנו בקשה לעבור לעמוד:", url);
  window.location.href = url;
});

socket.on("update-auto-scroll", (value) => {
  console.log("📥 קיבלנו ערך autoScroll:", value);
  autoScroll = value;

  // עצירה של כל גלילה קודמת
  clearTimeout(scrollIntervalId);

  if (autoScroll) {
    highlightLinesSequentially(); // הפעלה מחדש
  }
});

async function fetchUserInstrument() {
  try {
    const res = await fetch("/whoami");
    userInstument = await res.text();
    console.log("🎤 מידע על המשתמש:", userInstument);
  } catch (err) {
    console.error("❌ שגיאה בשליפת המשתמש:", err);
  }
}

async function initPage() {
  await fetchUserInstrument(); // מחכה לסיום

  console.log("ani menagen be: " + userInstument);

  if (songName) {
    console.log("🎵 שיר שהועבר ב-URL:", songName);
    loadSongContent(songName);
  }
}

initPage();
//getting song lyrics+notation by song name
async function loadSongContent(songName) {
  let lyrics;
  if (userInstument === "guitar" || userInstument === "drums") {
    lyrics = true;
  } else {
    lyrics = false;
  }
  try {
    console.log("lyrics=" + lyrics);
    console.log(songName);
    const res = await fetch("/get-song-by-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: songName }),
    });

    if (!res.ok) {
      throw new Error("שגיאה מהשרת");
    }

    const json = await res.json();
    data = json.content;

    console.log("✅ תוכן השיר הוזן לתוך data:", data);
    renderLyrics(lyrics);
  } catch (err) {
    console.error("❌ שגיאה בשליפת השיר:", err);
  }
}

//

//showwChords=tru if player instument forom user sql table is guitar or drums
function renderLyrics(showChords) {
  const container = document.getElementById("lyrics-container");
  container.innerHTML = "";

  // line in song
  data.forEach((line) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    //world in song
    line.forEach((word) => {
      const span = document.createElement("span"); //i chose to use span and not p becaus span is a inline element and p is block element

      if (showChords == true && word.chords) {
        span.innerHTML = `<span class="chord">[${word.chords}]</span>${word.lyrics} `;
      } else {
        span.textContent = word.lyrics + " ";
      }

      lineDiv.appendChild(span);
    });

    container.appendChild(lineDiv);
  });
  console.log("auto scroll?:" + autoScroll);
  highlightLinesSequentially(autoScroll);
}
function highlightLinesSequentially() {
  const lines = document.querySelectorAll(".line");
  let current = 0;

  function highlightNext() {
    if (!autoScroll || current >= lines.length) {
      if (current > 0 && current <= lines.length) {
        lines[current - 1].classList.remove("highlight"); // remove highlight from last line only if we have 1 pre line
      }
      console.log("auto scroll stoped");
      return;
    }

    if (current > 0) {
      lines[current - 1].classList.remove("highlight");
    }

    lines[current].classList.add("highlight");
    current++;

    scrollIntervalId = setTimeout(highlightNext, 3000);
  }

  highlightNext(); 
}
