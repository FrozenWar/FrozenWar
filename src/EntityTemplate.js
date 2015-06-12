// TODO this should be stored in json, etc. 

module.exports = {
  "BaseEntity": {
    "owner": {},
    "info": {
      type: "unit",
      name: "Unknown"
    },
    "position": {}
  },
  "TestEntity": {
    "prototype": "BaseEntity",
    "info": {
      type: "unit",
      name: "테스트용 엔티티"
    },
    "move": {
      step: 2
    }
  }
};
