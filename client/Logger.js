function Logger() {
  // 아직 아무 것도 없음
}

Logger.prototype.log = function(text) {
  var pre = document.createElement('pre');
  pre.appendChild(document.createTextNode(text));
  document.body.appendChild(pre);
}