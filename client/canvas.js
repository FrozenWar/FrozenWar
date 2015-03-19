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

function getRenderX(point) {
  return point.x * hexInf.width + (hexInf.width / 2 * (point.y&1)) + 2;
}

function getRenderY(point) {
  return point.y * (hexInf.height-hexInf.sideY) + 2;
}

function updateTileMap() {
  var canvas = document.getElementById('tileCanvas');
    canvas.width = 20 * hexInf.width + hexInf.width / 2 + 4;
    canvas.height = 20 * (hexInf.height-hexInf.sideY) + hexInf.sideY + 4;
  var context = canvas.getContext('2d');
  // context.clearRect(0, 0, canvas.width, canvas.height);
  for(var y = 0; y < 20; ++y) {
    for(var x = 0; x < 20; ++x) {
      var offsetPos = {x: x, y: y};
      var drawX = getRenderX(offsetPos);
      var drawY = getRenderY(offsetPos);
      // tile
      context.beginPath();
      context.moveTo(drawX + hexInf.sideX, drawY);
      context.lineTo(drawX + hexInf.width, drawY + hexInf.sideY);
      context.lineTo(drawX + hexInf.width, drawY + hexInf.sideY + hexInf.side);
      context.lineTo(drawX + hexInf.sideX, drawY + hexInf.sideY*2 + hexInf.side);
      context.lineTo(drawX, drawY + hexInf.sideY + hexInf.side);
      context.lineTo(drawX, drawY + hexInf.sideY);
      context.closePath();
      // fill
      context.fillStyle = '#F0F0F0';
      context.fill();
      // border
      context.strokeStyle = "#999";
      context.lineWidth = 1;
      context.stroke();
      // pos
      context.fillStyle = '#000000';
      context.font = '14px NanumGothic';
      context.textBaseline = "middle";
      var name = offsetPos.x + ',' +offsetPos.y;
      context.fillText(name, drawX + hexInf.width/2 - context.measureText(name).width/2, 
          drawY + hexInf.height / 2);
    }
  }
}
