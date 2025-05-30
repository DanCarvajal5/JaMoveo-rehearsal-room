let data=[];

//showwChords=tru if player instument forom user sql table is guitar or drums         
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