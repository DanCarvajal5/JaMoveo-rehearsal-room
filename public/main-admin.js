const loadeE = document.querySelector(".loader");
loadeE.classList.add("hide");//make sure that it hidden in the beginig- if user will click back the  wont see this element 

///check if ther is song whit the same name and redairect to results-admin page -also sendin song name and artist name
async function checkIfSongExists() {
  const name = document.getElementById("songName").value;

  loadeE.classList.remove("hide");
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
    foundedSongName.innerText = ` ${name} found`;

    // שליחה ל-results-admin.html עם גם song וגם artist
    const artist = encodeURIComponent(data.artist);
    const song = encodeURIComponent(name);
    // const songContent=encodeURIComponent(JSON.stringify(data.content));
    window.location.href = `/results-admin.html?song=${song}&artist=${artist}`;
  } else {
    loadeE.classList.add("hide");
    foundedSongName.innerText = "Song not found..";
  }

  songNameSerch.appendChild(foundedSongName);
}
