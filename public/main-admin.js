let data = [];

const select = document.getElementById("song-select");
const showChordsCheckbox = document.getElementById("show-chords");

select.addEventListener("change", () => {
  loadSong(select.value, showChordsCheckbox.checked);
});

showChordsCheckbox.addEventListener("change", () => {
  renderLyrics(showChordsCheckbox.checked);
});

async function loadSong(fileName, showChords = true) {
  try {
    const response = await fetch(`songs/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}: ${response.statusText}`);
    }

    const json = await response.json();
    console.log("Loaded JSON:", json);

    data = json;
    renderLyrics(showChords);
  } catch (error) {
    console.error("Error loading song:", error);
  }
}

function renderLyrics(showChords) {
  const container = document.getElementById("lyrics-container");
  container.innerHTML = "";

  // line in song
  data.forEach((line) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";
    // lineDiv.classList.add( "line");

    //world in song
    line.forEach((word) => {
      const span = document.createElement("span"); //i chose to use span and not p becaus span is a inline element and p is block element

      if (showChords && word.chords) {
        span.innerHTML = `<span class="chord">[${word.chords}]</span>${word.lyrics} `;
      } else {
        span.textContent = word.lyrics + " ";
      }

      lineDiv.appendChild(span);
    });

    container.appendChild(lineDiv);
  });
  highlightLinesSequentially();
}
function highlightLinesSequentially() {
  const lines = document.querySelectorAll(".line");
  let current = 0;

  function highlightNext() {
    if (current > 0) {
      lines[current - 1].classList.remove("highlight"); // הסר הדגשה מהשורה הקודמת
    }

    if (current < lines.length) {
      lines[current].classList.add("highlight");

      setTimeout(() => {
        current++;
        highlightNext();
      }, 3000); // המתן 3 שניות לפני מעבר לשורה הבאה
    }
  }

  highlightNext();
}
// טען את השיר הראשון כברירת מחדל
loadSong(select.value);

///check if ther is song whit the same name and redairect to results-admin page -also sendin song name and artist name
async function checkIfSongExists() {
  const name = document.getElementById("songName").value;

  const res = await fetch("/check-song", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();

  const songNameSerch = document.getElementById("songNameSerch");
  songNameSerch.innerHTML = "";
  const foundedSongName = document.createElement("p");

  if (data.exists) {
    foundedSongName.innerText = `✅ ${name} נמצא`;
    
    // שליחה ל-results-admin.html עם גם song וגם artist
    const artist = encodeURIComponent(data.artist);
    const song = encodeURIComponent(name);
    window.location.href = `/results-admin.html?song=${song}&artist=${artist}`;
  } else {
    foundedSongName.innerText = "Song not found..";
  }

  songNameSerch.appendChild(foundedSongName);
}