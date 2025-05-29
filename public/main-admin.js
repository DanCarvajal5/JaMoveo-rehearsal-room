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

  data.forEach((line) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    line.forEach((word) => {
      const span = document.createElement("span");

      if (showChords && word.chords) {
        span.innerHTML = `<span class="chord">[${word.chords}]</span>${word.lyrics} `;
      } else {
        span.textContent = word.lyrics + " ";
      }

      lineDiv.appendChild(span);
    });

    container.appendChild(lineDiv);
  });
}

// טען את השיר הראשון כברירת מחדל
loadSong(select.value);
