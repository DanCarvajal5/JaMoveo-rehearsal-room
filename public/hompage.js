const text = "JaMoveo";
const title = document.getElementById("title");

[...text].forEach((char, i) => {
  const span = document.createElement("span");
  span.textContent = char;
  span.className = "letter";
  span.style.animationDelay = `${i * 0.2}s`;
  title.appendChild(span);


});
