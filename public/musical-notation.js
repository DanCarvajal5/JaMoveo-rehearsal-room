document.addEventListener("DOMContentLoaded", () => {
  const notes = ["🎵", "🎶", "𝄞", "♩", "♪", "♬"];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const note = document.createElement("span");
    note.className = "note";
    note.textContent = notes[Math.floor(Math.random() * notes.length)];

    note.style.left = `${Math.random() * 100}vw`;
    note.style.top = `${Math.random() * 100}vh`;

    const dx = `${(Math.random() - 0.5) * 200}px`;
    const dy = `${(Math.random() - 0.5) * 200}px`;
    note.style.setProperty("--dx", dx);
    note.style.setProperty("--dy", dy);

    note.style.animationDuration = `${5 + Math.random() * 5}s`;

    document.body.appendChild(note);
  }
});
