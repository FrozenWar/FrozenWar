function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (h && s === undefined && v === undefined) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255)
  };
}

function RGBtoString(rgb) {
  return '#'+((rgb.r<<16) | (rgb.g<<8) | (rgb.b)).toString(16);
}

var colors = {
  background: {
    s: 0.38,
    v: 1.00
  },
  border: {
    s: 0.76,
    v: 0.93
  },
  text: {
    s: 0.87,
    v: 0.81
  }
}

var HexagonMap = function(width, height) {
    //http://www.mattpalmerlee.com/2012/04/05/fun-with-hexagon-math-for-games/
    this.width = width|0;
    this.height = height|0;
    this.sideX = width/2;
    this.side = (height*2-Math.sqrt(height*height*4+12*(height*height+width*width)))/-6;
    this.sideY = Math.sqrt(this.side*this.side - this.sideX*this.sideX);
    this.sideX = this.sideX | 0;
    this.sideY = this.sideY | 0;
    this.side = this.side | 0;
}

var REGULAR_HEXAGON_RATIO = 2 / Math.sqrt(3);

var hexInf = new HexagonMap(80, REGULAR_HEXAGON_RATIO * 80);

function percentString(value) {
  var modifier = value - 1.00;
  modifier *= 100;
  return (modifier>0?'+':'')+Math.round(modifier)+'%';
}

function buffTree(logger, entity, component, name) {
  if(!entity) return '';
  if(!entity.get(component)) return '';
  if(!entity.get(component).bonus) return '';
  if(!entity.get(component).bonus[name]) return '';
  var bonus = entity.get(component).bonus[name];
  var diffs = false;
  if(bonus.attack != null && bonus.attack != 1) diffs = true;
  if(bonus.defense != null && bonus.defense != 1) diffs = true;
  if(bonus.other_attack != null && bonus.other_attack != 1) diffs = true;
  if(bonus.other_defense != null && bonus.other_defense != 1) diffs = true;
  if(diffs) {
    logger.log(_('buff_'+name), 'tree');
    if(bonus.attack != null && bonus.attack != 1) logger.tag(_('attack'), percentString(bonus.attack), 'subTree'+(bonus.attack>1?' good':(bonus.attack<1?' bad':'')));
    if(bonus.defense != null && bonus.defense != 1) logger.tag(_('defense'), percentString(bonus.defense), 'subTree'+(bonus.defense>1?' good':(bonus.defense<1?' bad':'')));
    if(bonus.other_attack != null && bonus.other_attack != 1) logger.tag(_('opponentAttack'), percentString(bonus.other_attack), 'subTree'+(bonus.other_attack>1?' bad':(bonus.other_attack<1?' good':'')));
    if(bonus.other_defense != null && bonus.other_defense != 1) logger.tag(_('opponentDefense'), percentString(bonus.other_defense), 'subTree'+(bonus.other_defense>1?' bad':(bonus.other_defense<1?' good':'')));
  }
}

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

function getName(component) {
  return _('unit_'+component.name);
}

function getColorIdent(hsv, session, entity) {
  return getColorIdentPlayer(hsv, session, entity.get('Cown') && entity.get('Cown').player);
}

function getColorIdentPlayer(hsv, session, player) {
  var h = 0;
  var s = hsv.s;
  var v = hsv.v;
  if(player) {
    h = player / session.players.length * (0.75);
    if(player == -1 || player == null) {
      h = 0;
      s = 0;
    }
  }
  return RGBtoString(HSVtoRGB(h,s,v));
}

function canvas_arrow(context, fromx, fromy, tox, toy){
  var headlen = 10;   // length of head in pixels
  var angle = Math.atan2(toy-fromy,tox-fromx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.moveTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
  context.lineTo(tox, toy);
  context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
}
