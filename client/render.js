var HexagonMap = function(width, height) {
    //http://www.mattpalmerlee.com/2012/04/05/fun-with-hexagon-math-for-games/
    this.width = width;
    this.height = height;
    this.sideX = width/2;
    this.side = (height*2-Math.sqrt(height*height*4+12*(height*height+width*width)))/-6;
    this.sideY = Math.sqrt(this.side*this.side - this.sideX*this.sideX);
}

var REGULAR_HEXAGON_RATIO = 2 / Math.sqrt(3);

var hexMap = new HexagonMap(64, REGULAR_HEXAGON_RATIO * 64);
var cursorPos = {x:-1, y:-1};
function renderMap(session) {
    var canvas = document.getElementById('canvas');
    canvas.width = session.map.width * hexMap.width + hexMap.width / 2;
    canvas.height = session.map.height * (hexMap.height-hexMap.sideY) + hexMap.sideY;
    var cxt = canvas.getContext('2d');
    cxt.clearRect(0, 0, canvas.width, canvas.height);
    for(var y = 0; y < session.map.width; ++y) {
        var py = y * (hexMap.height-hexMap.sideY);
        for(var x = 0; x < session.map.height; ++x) {
            var px = x * hexMap.width + (hexMap.width / 2 * (y&1));
            var tile = session.map.getTileByOffset(new Point(x, y));
            var color = "#FFFFFF";
            var desc = 'blank';
            tile.children.forEach(function(obj) {
                if(obj.components['tileComp']) {
                    color = obj.components['tileComp'].color;
                    desc = obj.components['tileComp'].type;
                }
            });
            if(tile.position.x == cursorPos.x && tile.position.y == cursorPos.y) {
                color = '#FFFFFF';
            }
            cxt.beginPath();
            cxt.moveTo(px + hexMap.sideX, py);
            cxt.lineTo(px + hexMap.width, py + hexMap.sideY);
            cxt.lineTo(px + hexMap.width, py + hexMap.sideY + hexMap.side);
            cxt.lineTo(px + hexMap.sideX, py + hexMap.sideY*2 + hexMap.side);
            cxt.lineTo(px, py + hexMap.sideY + hexMap.side);
            cxt.lineTo(px, py + hexMap.sideY);
            //ctx.lineTo(px + hexMap.sideX, py);
            cxt.fillStyle = color;
            cxt.fill();
            cxt.strokeStyle = "#000000";
            cxt.lineWidth = 1;
            cxt.stroke();
            cxt.closePath();
            cxt.fillStyle = "#000000";
            cxt.font = '8pt NanumGothic';
            var txt = '('+tile.position.x+','+tile.position.y+')\n'+desc;
            cxt.fillText(txt, px + hexMap.width/2 - cxt.measureText(txt).width/2, py + hexMap.height/2);
            tile.children.forEach(function(obj) {
                if(obj.components['renderComp']) {
                    var unit = obj.components['renderComp'];
                    var txtt = unit.name;
                    cxt.beginPath();
                    cxt.rect(px + 4, py + hexMap.height / 2 - hexMap.side / 2, hexMap.width - 8 , hexMap.side);
                    cxt.strokeStyle = unit.color;
                    cxt.lineWidth = 4;
                    cxt.stroke();
                    cxt.fillStyle = unit.background;
                    cxt.fill();
                    cxt.closePath();
                    cxt.fillStyle = unit.color;
                    cxt.font = '8pt NanumGothic';
                    cxt.fillText(txtt, px + hexMap.width/2 - cxt.measureText(txtt).width/2, 
                        py + hexMap.height / 2 - hexMap.side / 2 + 18);
                }
            });
        }
    }
}

window.addEventListener('load', function() {
    document.getElementById('canvas').addEventListener('mousedown', function(e) {
        var pos   = $(this).offset();
        var elPos = { X:pos.left , Y:pos.top };
        var mPos  = { x:e.pageX-elPos.X, y:e.pageY-elPos.Y };
        var tilePos = {};
        tilePos.y = (mPos.y) / (hexMap.height-hexMap.sideY)|0;
        tilePos.x = (mPos.x) / (hexMap.width) - tilePos.y / 2 | 0;
        if(session && (cursorPos.x != tilePos.x || cursorPos.y != tilePos.y)) {
            cursorPos = tilePos;
            renderMap(session);
        }
    });
});
