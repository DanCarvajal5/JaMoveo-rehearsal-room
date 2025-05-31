const socket = io();
//end of the session
socket.on("redirect-all", (url) => {
  window.location.href = url;
});


