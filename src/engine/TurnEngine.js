var BitSet = require('./BitSet.js');
var EventEmitter = require('./EventEmitter.js');
var Engine = require('./Engine.js');
var Turn = require('./Turn.js');
var PlayerComponent = require('./PlayerComponent.js');
var ComponentGroup = require('./ComponentGroup.js');

/**
 * 턴 기반 멀티플레이어 게임 엔진
 * Player, Action으로 정보 저장 및 교환함
 * Player 객체도 Entity로써 저장됨.
 * 플레이어 컴포넌트를 등록시 같이 지정함
 */
 
/**
 * 게임의 모든 플레이어가 한 턴씩 가질때를 '시퀀스'라고 부름.
 *
 * 턴
 * player - 해당 턴의 플레이어 객체
 * id - 턴 ID
 * seqId - 시퀀스 ID
 */
 
/**
 * turnNext
 * gameInit
 * sequenceNext
 */
function TurnEngine(isServer, playerComponent) {
  Engine.call(this);
  this.isServer = isServer || false;
  this.turns = [];
  this.players = this.getEntitiesFor(ComponentGroup.createBuilder(this)
    .contain(playerComponent || PlayerComponent).build());
}

TurnEngine.prototype = Object.create(Engine.prototype);
TurnEngine.prototype.constructor = TurnEngine;

TurnEngine.prototype.getTurn = function() {
  if(this.turns.length == 0) {
    return this.nextTurn();
  }
  return this.turns[this.turns.length-1];
}

TurnEngine.prototype.nextTurn = function() {
  this.sortSystems();
  if(this.turns.length == 0) {
    if(this.players[0] == null) {
      throw new Error('게임에 적어도 1명 이상의 플레이어가 등록되어 있어야 합니다');
    }
    var turn = new Turn(0, 0, 0, this.players[0]);
    this.turns.push(turn);
    this.emit('gameInit', turn);
    this.emit('sequenceNext', turn);
    this.emit('turnNext', turn);
    this.systems.forEach(function(system) {
      if(system.onInit) {
        system.onInit(turn);
      }
    });
    this.systems.forEach(function(system) {
      if(system.onSequence) {
        system.onSequence(turn);
      }
    });
    this.systems.forEach(function(system) {
      if(system.onTurn) {
        system.onTurn(turn);
      }
    });
    return turn;
  }
  // 원래 있던 턴 객체의 플레이어 인덱스 + 1
  var prevTurn = this.getTurn();
  var seqId = prevTurn.seqId;
  var id = prevTurn.id;
  var order = this.players.indexOf(prevTurn.player) + 1;
  if(order >= this.players.length) {
    seqId ++;
    order = 0;
  }
  var turn = new Turn(id + 1, order, seqId, this.players[order]);
  this.turns.push(turn);
  if(order == 0) {
    this.emit('sequenceNext', turn);
    this.systems.forEach(function(system) {
      if(system.onSequence) {
        system.onSequence(turn);
      }
    });
  }
  this.emit('turnNext', turn);
  this.systems.forEach(function(system) {
    if(system.onTurn) {
      system.onTurn(turn);
    }
  });
  return turn;
}

TurnEngine.prototype.runAction = function(action) {
  // TODO action을 안만듬;
  if(this.isServer) {
    if(action.result) {
      throw new Error('Action이 이미 실행되었습니다');
    }
  } else {
    if(!action.result) {
      throw new Error('Action을 서버측에서 실행하지 않았습니다');
    }
  }
  this.getTurn().addAction(action);
  action.run(engine);
  this.emit('action', turn);
  this.systems.forEach(function(system) {
    if(system.onAction) {
      system.onAction(turn, action);
    }
  });
  return action.result;
}

if(typeof module != 'undefined') {
  module.exports = TurnEngine;
}
