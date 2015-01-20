domain.assign('EEarthPonyBase', {
  'Cpos': {},
  'Cbuilding': {
    name: 'Base',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 700,
    defense: 30
  },
  'Cspawner': {
    spawnable: [
      'EEarthLightHooves',
      'EEarthHeavyHooves',
      'EEarthHoovesArcher',
      'EEarthWarChariot',
      'EEarthBallista',
      'EEarthTrebuchet',
      'EEarthHoovesSapper'
    ],
    range: 3
  },
  'Cmove': {
    maxMove: 65535 // 디버그용
  }
});

domain.assign('EEarthLightHooves', {
  'Cpos': {},
  'Cunit': {
    name: 'Light Hooves',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 90,
    defense: 20
  },
  'Cattack': {
    attack: 70,
    range: 1,
    bonus: {
      other_non_fortify: {
        attack: 1.3
      },
      ranged: {
        attack: 1.3
      }
    }
  },
  'Cspawn': {
    supply: 10,
    troops: 100
  },
  'Cmove': {
    maxMove: 4
  },
  'Cpower': {
    maxPower: 30,
    consume: 5,
    heal: 10
  }
  //방어태새가 아닌 유닛 또는 원거리 유닛과 전투시 50%추가 전투력 보너스
});

domain.assign('EEarthHeavyHooves', {
  'Cpos': {},
  'Cunit': {
    name: 'Heavy Hooves',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 150,
    defense: 40
  },
  'Cattack': {
    attack: 90,
    range: 1,
    bonus: {
      first: {
        defense: 2
      }
    }
  },
  'Cspawn': {
    supply: 50,
    troops: 150
  },
  'Cmove': {
    maxMove: 2
  },
  'Cpower': {
    maxPower: 40,
    consume: 10,
    heal: 10
  }
  //공격시 방어력 2배
});

domain.assign('EEarthHoovesArcher', {
  'Cpos': {},
  'Cunit': {
    name: 'Hooves Archer',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20
  },
  'Cattack': {
    attack: 50,
    attackRandomness: 50, // 전투력 50~100이 뭔지..
    range: 3
  },
  'Cspawn': {
    supply: 30,
    troops: 100
  },
  'Cmove': {
    maxMove: 2
  },
  'Cpower': {
    maxPower: 30,
    consume: 7,
    heal: 10
  }
  // 특성 없음
});

domain.assign('EEarthWarChariot', {
  'Cpos': {},
  'Cunit': {
    name: 'War Chariot',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 120,
    defense: 20,
    bonus: {
      fortify: {
        defense: 1
      }
    }
  },
  'Cattack': {
    attack: 50,
    attackRandomness: 50, // 전투력 50~100이 뭔지..
    range: 2
  },
  'Cspawn': {
    supply: 100,
    troops: 120
  },
  'Cmove': {
    maxMove: 4
  },
  'Cpower': {
    maxPower: 40,
    consume: 6,
    heal: 10
  }
  // 방어태새시 방어력 증가 없음
});

domain.assign('EEarthBallista', {
  'Cpos': {},
  'Cunit': {
    name: 'Ballista',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 120,
    defense: 20
  },
  'Cattack': {
    attack: 40,
    attackRandomness: 170-40, // 전투력 40~170이 뭔지..
    range: 4,
    bonus: {
      counter: {
        attack: 0
      }
    }
  },
  'Cspawn': {
    supply: 150,
    troops: 120
  },
  'Cmove': {
    maxMove: 1
  },
  'Cpower': {
    maxPower: 30,
    consume: 10,
    heal: 10
  }
  // 반격불가
});

domain.assign('EEarthTrebuchet', {
  'Cpos': {},
  'Cunit': {
    name: 'Trebuchet',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 140,
    defense: 20
  },
  'Cattack': {
    attack: 40,
    attackRandomness: 200-40, // 전투력 40~200이 뭔지..
    range: 5,
    bonus: {
      counter: {
        attack: 0
      },
      building: {
        attack: 1.5
      }
    }
  },
  'Cspawn': {
    supply: 200,
    troops: 120
  },
  'Cmove': {
    maxMove: 1
  },
  'Cpower': {
    maxPower: 30,
    consume: 15,
    heal: 10
  }
  // 반격 불가, 시설에 대한 공격력 50% 상승
});

domain.assign('EEarthHoovesSapper', {
  'Cpos': {},
  'Cunit': {
    name: 'Hooves Sapper',
    team: 'pony_earth'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 80,
    defense: 20
  },
  'Cattack': {
    attack: 50,
    range: -1
  },
  'Cspawn': {
    supply: 50,
    troops: 100
  },
  'Cmove': {
    maxMove: 3
  },
  'Cpower': {
    maxPower: 50,
    consume: 5,
    heal: 10
  }
  // 공격 불가, 특수 능력(문서 참조)
});
