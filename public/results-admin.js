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
  
}
