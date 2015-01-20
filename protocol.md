FrozenWar 프로토타입 프로토콜
============================

** 이 문서는 더 이상 유효하지 않습니다. **
** This document is obsolete. **

개요
----
  FrozenWar 프로토타입은 서버와 통신하기 위해 socket.io를 사용합니다.

객체
----
  여기에서는 프로토콜에서 사용되는 객체에 대해 다룹니다.
  직렬화된 객체에 포함되지 않는 변수들은 포함하지 않았습니다.
  
### Room
  Room(name)
  
  Room 객체는 방 정보를 담고 있는 객체입니다.
  
- name: String
  
  name은 방의 이름이 담긴 문자열입니다.
  
- clients: Array<Client>
  
  clients는 접속중인 클라이언트가 담긴 배열입니다.

### Client
  Client()
  
  Client 객체는 클라이언트 정보를 담고 있는 객체입니다.
  
- id: int
  
  id는 클라이언트의 번호입니다.
  
- nickname: String

  nickname은 클라이언트의 닉네임입니다.

### Session
  Session(domain, map)
  
  Session 객체는 게임 세션의 모든 데이터를 담고 있는 객체입니다.
  
- players: Array<Player>
  
  Player 객체를 담고 있는 배열입니다.
  **Client 객체와 헷갈릴 수 있으니 주의해 주세요.**
  
- turns: Array<Turn>
  
  Turn 객체를 담고 있는 배열입니다.
  
- map: Map
  
  게임의 Map 객체입니다.
  
- domain: Array<String>
  
  도메인 이름이 담긴 배열로 이 세션에서 활성화된 도메인 목록을 나타냅니다.
  
- systems: Array<String>
  
  시스템의 도메인 이름이 담긴 배열로 이 세션에서 활성화된 시스템 목록을 나타냅니다.
  클라이언트는 이 목록을 받아서 그 순서대로 시스템을 등록해야 합니다.
  
- turnId: int
  
  현재 진행중인 턴의 번호입니다.

### Player
  Player()
  
  Player 객체는 게임 안의 플레이어를 식별하는데 사용되는 객체입니다.
  **Client 객체와 헷갈릴 수 있으니 주의해 주세요.**
  현재 서버 구현에서는 Player.components.clientId가 Client의 번호를 담고 있습니다.
  
- id: int
  
  플레이어의 번호입니다. 0부터 순차적으로 부여됩니다.
  **Client의 번호와는 다릅니다.**
  
- name: String
  
  플레이어의 이름입니다. 일반적으로 Client.nickname과 같게 부여됩니다.
  
- components: Object<Object>
  
  플레이어의 변수들을 저장하는 객체입니다.

### Turn
  Turn(id)
  
  Turn 객체는 턴 하나하나를 식별하는데 사용되는 객체입니다.
  
- id: int
  
  턴 번호입니다. 이 객체가 session의 현재 턴인 경우 id와 session.turnId는 같습니다.
  
- order: int
  
  턴 안의 플레이어 순서입니다. -1부터 (플레이어 인원 - 1)의 범위를 가지고 있습니다.
  
  -1은 턴이 시작되기 전 System이 처리하는 순서를 의미합니다.
  
- actions: Array<Action>

  이 턴 안에서 실행된 Action들의 배열입니다.

### Map
  Map(width, height)
  
  Map 객체는 게임의 맵을 나타내는 객체입니다.
  직렬화 된 상태에선 1차원 배열이지만 내부적으로는 3차원 배열로 구현되어 있습니다.
  
- width: int
  
  맵의 가로 크기입니다.
  
- height: int

  맵의 세로 크기입니다.
  
- entities: Array<Entity>
  
  엔티티들의 배열입니다.
  
### Action
  Action(domain, player, entity, args)
  
  플레이어나 컴퓨터의 각 행동을 나타내는 객체입니다.
  게임 엔티티를 수정하는 **모든** 행동은 Action을 통해 처리되어야 합니다.
  그렇지 않으면 서버와 클라이언트간 desync가 발생할 수도 있습니다.
  
- domain: String
  
  이 Action을 처리할 객체의 도메인을 지정합니다.
  
- player: int
  
  이 Action을 발동한 Player의 번호입니다. 시스템이 발동한 경우 -1입니다.
  
- entity: int

  이 Action과 관계된 Entity의 번호입니다. 없는 경우 -1입니다.
  
- args: Object
  
  실행할 때 처리할 매개변수를 담는 객체입니다.
  
- result: Object
  
  실행 결과를 담는 객체입니다. 클라이언트가 Action을 실행할 때는 이 객체를
  참고하여 서버와 결과가 같도록 실행하게 됩니다.
  
### Entity
  Entity(id)
  
  게임 맵에 있는 엔티티들을 나타내는 객체입니다.
  
- id: int
  
  이 Entity의 번호입니다.
  
- domain: String
  
  이 Entity를 생성한 prototype 도메인을 나타냅니다.
  **디버깅 용이므로 사용하지 마세요.**
  
- components: Object<Object>
  
  엔티티의 변수들을 저장하는 객체입니다.

서버 -> 클라이언트
-----------------
  여기에서는 서버가 클라이언트로 전송하는 이벤트에 대해서 다룹니다.

### handshake
  handshake(domain, clientId)

  클라이언트가 접속하면 서버는 바로 이 이벤트를 전송합니다.
  
- domain: Array<String>
  
  domain은 도메인 이름이 담긴 배열로 클라이언트에서 자신이 가지고 있는
  도메인과 대조해서 일치하는지 확인해야 합니다. 만약 불일치하는 경우
  클라이언트에서 접속을 끊습니다.
  
- clientId: int
  
  clientId는 클라이언트 자신의 번호로 클라이언트를 식별하는데 쓰입니다.

### roomUpdate
  roomUpdate(room)
  
  방 정보가 갱신되면 서버는 이 이벤트를 전송합니다.
  
- room: Room

  업데이트된 Room 객체입니다. 

### err
  err(message)
  
  에러가 발생하면 서버는 이 이벤트를 전송합니다.
  
- message: String

  에러의 내용을 담고 있는 문자열입니다.
  
### chat
  chat(client, message)
  
  클라이언트가 채팅 메시지를 전송하면 서버가 이 이벤트를 전송합니다.
  
- client: Client

  메시지를 전송한 Client 객체입니다.
  
- message: String

  메시지의 내용입니다.
  
### startSession
  startSession(session, playerId)
  
  게임 세션이 시작될때 서버가 이 이벤트를 전송합니다.
  
- session: Session
  
  게임 세션 객체입니다. 
  클라이언트는 이 직렬화된 객체를 받아서 Session 객체를 만들어야 합니다.
  
- playerId: int
  
  클라이언트 자신의 Player의 번호를 나타냅니다.

### turnUpdate
  turnUpdate(turn)
  
  게임 턴이 갱신 되었을때 서버가 이 이벤트를 전송합니다.
  
- turn: Turn
  
  갱신된 현재의 Turn 객체입니다. 클라이언트는 이를 받아 새로 받은 Action들을 
  실행해야 합니다.

### turnOrder
  turnOrder(order, turnId)
  
  게임 턴 순서가 넘어갔을때 서버가 이 이벤트를 전송합니다.
  
- order: int
  
  현재 순서를 가지고 있는 Player의 번호입니다.
  이 order와 일치하는 Player만이 서버에 Action을 보낼 수 있습니다.
  
- turnId: int
  
  현재 턴의 번호입니다.
  
클라이언트 -> 서버
-----------------
  여기에서는 클라이언트가 서버로 전송할 수 있는 이벤트에 대해서 다룹니다.
  
### nickname
  nickname(nickname, callback())
  
  클라이언트가 서버에 접속한 뒤 자신의 닉네임을 설정하기 위해 보내는 이벤트입니다.
  
- nickname: String
  
  클라이언트의 닉네임입니다.
  
- callback: function()
  
  닉네임이 설정되면 발동될 callback입니다.
  
### roomConnect
  roomConnect(roomId, callback(room));
  
  클라이언트가 방에 접속하기 위해 보내는 이벤트입니다.
  지금 서버 구현에서는 방에 이미 게임이 시작되었으면 에러를 보내고 접속을 끊게 되어
  있습니다.
  
- roomId: String
  
  접속할 방의 이름입니다.

- callback.room: Room
  
  방 객체를 담고 있습니다.
  
### chat
  chat(message)
  
  같은 방에 있는 사람들에게 메시지를 보냅니다.
  
- message: String
  
  보낼 메시지입니다.
  
### startSession
  startSession()
  
  게임 세션을 시작하려면 보내는 이벤트입니다.
  이미 게임이 시작되었다면 서버는 아무 반응도 하지 않습니다.
  아니라면 서버는 게임 객체를 만들고 startSession 이벤트를 보내 
  게임 객체를 전송합니다.

### action(action, callback(action, error))
  action(action, callback(action, error))
  
  클라이언트가 자신의 턴일때 행동을 서버에 요청하기 위해 보내는 이벤트입니다.
  지금이 자신의 턴이 아니라면 서버는 에러를 보냅니다.
  
- action: Action
  
  요청할 Action 객체입니다.
  
- callback.action: Action
  
  반환된 Action 객체입니다.
  반환된 객체에서 result가 null이면 action이 처리되지 못했다는 것을 나타냅니다.
  
- callback.error: String
  
  실행 중 오류가 발생한 경우 같이 반환되는 문자열입니다.
  
### endTurn()
  endTurn()
  
  자신의 턴을 끝냅니다.
  지금이 자신의 턴이 아니라면 서버는 에러를 보냅니다.
