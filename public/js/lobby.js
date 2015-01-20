var playerList;
var playerNodeOrigin;
$(document).ready(function() {
  playerList = document.getElementById('playerList');
  playerNodeOrigin = playerList.querySelector('.player').cloneNode(true);
  // Clear playerList
  while (playerList.firstChild) {
    playerList.removeChild(playerList.firstChild);
  }
});
