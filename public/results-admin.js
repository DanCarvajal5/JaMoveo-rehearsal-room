const socket = io();
//receiving song name and creating new element to show the song name and artist
const params = new URLSearchParams(window.location.search);
const songName = params.get("song");
const artist = params.get("artist");

if (songName && artist) {
  document.getElementById("result").innerText = `🎵 ${songName} by ${artist}`;
} else {
  document.getElementById("result").innerText = "❌ לא הועברו פרטים";
}

function goLive() {
  //שולח בקשה לשרת שיפנה את כולם לדף מסויים
  //admin tels everybudy to go /live.html
  // socket.emit("start-redirect", "/live.html"); 

  // socket.emit("send-message-to-live", "hey jude");
  const songToPlay = songName ; // או כל שיר שנבחר
  socket.emit("start-redirect", `/live.html?song=${encodeURIComponent(songToPlay)}`);
}
function endLive() {
  socket.emit("start-redirect", "/main-player.html");
}
