domain.assign('EPegasusPonyBase', {
  'Cpos': {},
  'Cbuilding': {
    name: 'Base',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 700,
    defense: 30
  },
  'Cspawner': {
    spawnable: [
      'EPegasusLegionary', 
      'EPegasusAssaultLancer', 
      'EPegasusSliger', 
      'EPegasusWingsArcher', 
      'EPegasusBatteringRamb', 
      'EPegasusHurricaneSquad', 
      'EPegasusCloudEngineer'
    ],
    range: 3
  },
  'Cmove': {
    maxMove: 65535 // 디버그용
  }
});

domain.assign('EPegasusLegionary', {
  'Cpos': {},
  'Cunit': {
    name: 'Legionary',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 120,
    defense: 30
  },
  'Cattack': {
    attack: 80,
    range: 1
  },
  'Cspawn': {
    supply: 30,
    troops: 120
  },
  'Cmove': {
    maxMove: 3
  },
  'Cpower': {
    maxPower: 35,
    consume: 5,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusAssaultLancer', {
  'Cpos': {},
  'Cunit': {
    name: 'Assault Lancer',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20,
    bonus: {
      fly: {
        attack: 1.3
      }
    }
  },
  'Cattack': {
    attack: 80,
    range: 1
  },
  'Cspawn': {
    supply: 30,
    troops: 110
  },
  'Cmove': {
    maxMove: 4
  },
  'Cpower': {
    maxPower: 40,
    consume: 5,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusSliger', {
  'Cpos': {},
  'Cunit': {
    name: 'Sliger',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 80,
    defense: 20
  },
  'Cattack': {
    attack: 20,
    attackRandomness: 90-20,
    range: 3,
    bonus: {
      fly: {
        attack: 1.3
      }
    }
  },
  'Cspawn': {
    supply: 20,
    troops: 100
  },
  'Cmove': {
    maxMove: 3
  },
  'Cpower': {
    maxPower: 30,
    consume: 3,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusWingsArcher', {
  'Cpos': {},
  'Cunit': {
    name: 'Wings Archer',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20
  },
  'Cattack': {
    attack: 60,
    attackRandomness: 90-60,
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
    consume: 5,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusBatteringRamb', {
  'Cpos': {},
  'Cunit': {
    name: 'Battering Ramb',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 150,
    defense: 40
  },
  'Cattack': {
    attack: 70,
    range: 1,
    bonus: {
      fly: {
        attack: 1.5
      },
      building: {
        attack: 2
      },
      counter: {
        attack: 0.5
      },
    }
  },
  'Cspawn': {
    supply: 80,
    troops: 150
  },
  'Cmove': {
    maxMove: 2
  },
  'Cpower': {
    maxPower: 40,
    consume: 10,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusHurricaneSquad', {
  'Cpos': {},
  'Cunit': {
    name: 'Hurricane Squad',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 150,
    defense: 30
  },
  'Cattack': {
    attack: 150,
    range: 1,
    bonus: {
      counter: {
        attack: 0
      },
      self_non_fly: {
        attack: 0
      },
      always: {
        other_defense: 0.5
      }
    }
  },
  'Cspawn': {
    supply: 50,
    troops: 250
  },
  'Cmove': {
    maxMove: 4
  },
  'Cpower': {
    maxPower: 50,
    consume: 15,
    heal: 10
  },
  'Cfly': {
  }
});

domain.assign('EPegasusCloudEngineer', {
  'Cpos': {},
  'Cunit': {
    name: 'Cloud Engineer',
    team: 'pony_pegasus'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20
  },
  'Cattack': {
    attack: 0,
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
  },
  'Cfly': {
  }
});
