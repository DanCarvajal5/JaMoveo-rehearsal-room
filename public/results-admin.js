  //receiving song name and creating new element to show the song name and artist 
  const params = new URLSearchParams(window.location.search);
  const songName = params.get("song");

  if (songName) {
    document.getElementById("result").innerText = `🎵 ${songName}`;
  } else {
    document.getElementById("result").innerText = "❌ לא הועבר שם שיר";
  }
