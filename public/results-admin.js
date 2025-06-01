const socket = io();
//receiving song name and creating new element to show the song name and artist
const params = new URLSearchParams(window.location.search);
const songName = params.get("song");
const artist = params.get("artist");
let autoScrollEnabled = true;
const result = document.getElementById("result");

if (songName && artist) {
  document.getElementById(
    "result"
  ).innerText = `Song name: ${songName} by ${artist} /br Go live`;
} else {
  document.getElementById("result").innerText = "cant get the song file";
}

function goLive() {
  //admin tels server to tell everybody to go /live.html
  const songToPlay = songName;
  socket.emit(
    "start-redirect",
    `/live.html?song=${encodeURIComponent(songToPlay)}`
  );
  result.classList.add("hide");
}
function endLive() {
  socket.emit("start-redirect", "/main-player.html");
}
function toggleAutoScroll() {
  autoScrollEnabled = !autoScrollEnabled; //value change every click
  socket.emit("set-auto-scroll", autoScrollEnabled);
}
function backToSearch() {
  endLive(); //ending live befor going back
  window.location.href = "/main-admin.html";
}
