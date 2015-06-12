// 게임이 시작되면 여러 객체들을 스폰하는 역할을 함
var InitSystem = {
  priority: 0,
  add: function(engine) {
    this.engine = engine;
  },
  turn: function(turn) {
    var y = Math.random()*10|0;
    var x = (Math.random()*10|0) - (y/2|0);
    this.engine.aa('spawn', null, null,
      {type: "TestEntity", x: x, y: y});
  }
};

module.exports = function(engine) {
  engine.s('init', InitSystem);
}
