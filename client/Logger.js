var Logger = function(dom) {
  this.dom = dom;
}

Logger.prototype.clear = function() {
  while(this.dom.firstChild)
    this.dom.removeChild(this.dom.firstChild);
}

Logger.prototype.log = function(message, classes) {
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(message));
  p.className = classes || '';
  this.dom.appendChild(p);
  this.dom.scrollTop = this.dom.scrollHeight;
  return p;
}

Logger.prototype.tag = function(name, message, classes) {
  var p = document.createElement('p');
  var nameTag = document.createElement('span');
  nameTag.className = 'nameTag';
  nameTag.appendChild(document.createTextNode(name));
  p.appendChild(nameTag);
  var dataTag = document.createElement('span');
  dataTag.className = 'dataTag';
  dataTag.appendChild(document.createTextNode(message));
  p.appendChild(dataTag);
  p.className = classes || '';
  this.dom.appendChild(p);
  this.dom.scrollTop = this.dom.scrollHeight;
  return p;
}