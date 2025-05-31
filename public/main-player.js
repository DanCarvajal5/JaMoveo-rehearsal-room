const socket = io();
//מקבל הודעה משהרת שמפנה את כולם לדף מסויים
socket.on("redirect-all", (url) => {
  console.log("📡 קיבלנו בקשה לעבור לעמוד:", url);
  window.location.href = url;
});

// socket.on("disconnect-all", () => {
//   console.log("📡 קיבלנו בקשה לעבור לעמוד:", url);
//   window.location.href = "/main-player.html";
// });
