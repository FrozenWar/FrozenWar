// 게임이 시작되면 여러 객체들을 스폰하는 역할을 함
function InitSystem() {
  this.engine = null;
  this.priority = 0;
}

InitSystem.prototype.onAddedToEngine = function(engine) {
  this.engine = engine;
}

InitSystem.prototype.onTurn = function(turn) {
  var y = Math.random()*10|0;
  var x = (Math.random()*10|0) - (y/2|0);
  this.engine.runAction(new Package.actions.SpawnAction(this.engine, null, null,
    {type: "TestEntity", x: x, y: y}));
}

Package.systems.InitSystem = InitSystem;
