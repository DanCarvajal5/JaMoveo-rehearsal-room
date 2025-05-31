const params = new URLSearchParams(window.location.search);
const songName = params.get("song");
console.log("the name of the song is :" + songName);
let userInstument;
let data = [];//will store lyrics
let autoScroll = true;
let scrollIntervalId = null; // מזהה של הטיימר כדי שנוכל לעצור אותו
const socket = io();

//this is for the case that the admin will end the session
socket.on("redirect-all", (url) => {
  window.location.href = url;
});

socket.on("update-auto-scroll", (value) => {
  autoScroll = value;
  // stop the previous scroll timeout
  clearTimeout(scrollIntervalId);
  if (autoScroll) {
    highlightLinesSequentially(autoScroll); // הפעלה מחדש
  }
});

async function initPage() {
  await fetchUserInstrument(); 
  if (songName) {
    loadSongContent(songName);
  }
}

async function fetchUserInstrument() {
  try {
    const res = await fetch("/whoami");
    userInstument = await res.text();
    console.log(`user with ${userInstument} instrument joined to the band rehearsal ` );
  } catch (err) {
    console.error("cannot get user instrument:", err);
  }
}

initPage();
//getting song lyrics+notation by song name
async function loadSongContent(songName) {
  //if user intrument is guitar or drims the lyrics will be true
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

    renderLyrics(lyrics);
  } catch (err) {
    console.error("Error retrieving the song", err);
  }
}

//showwChords=true if player instument forom user sql table is guitar or drums
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
  highlightLinesSequentially(autoScroll);
}
function highlightLinesSequentially() {
  //cleaning all pre lines
  cleanAllLineHighlight();
  const lines = document.querySelectorAll(".line");
  let current = 0;

  function highlightNext() {
    if (!autoScroll || current >= lines.length) {
      cleanAllLineHighlight();
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
function cleanAllLineHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach((line) => {
    line.classList.remove("highlight");
  });
}
