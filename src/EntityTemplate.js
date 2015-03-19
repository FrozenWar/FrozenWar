var EntityTemplate = {};

// 원래 json파일을 써야하는데
// 귀찮아서 js파일로 임베드;
// 따라서 json형식으로 쓰지 않으면 나중에 힘들지도

EntityTemplate = {
  "BaseEntity": {
    "OwnerComponent": {},
    "InfoComponent": {
      type: "unit",
      name: "Unknown"
    },
    "PositionComponent": {}
  },
  "TestEntity": {
    "prototype": "BaseEntity",
    "InfoComponent": {
      type: "unit",
      name: "테스트용 엔티티"
    },
    "MoveComponent": {
      step: 2
    }
  }
}



Package.EntityTemplate = EntityTemplate;
