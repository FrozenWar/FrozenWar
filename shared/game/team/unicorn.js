domain.assign('EUnicornPonyBase', {
  'Cpos': {},
  'Cbuilding': {
    name: 'Base',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 700,
    defense: 30
  },
  'Cspawner': {
    spawnable: [
      'EUnicornSpearmare',
      'EUnicornFencer',
      'EUnicornRoyalNight',
      'EUnicornLongbowArcher',
      'EUnicornSharpShooter',
      'EUnicornHeavyShooter',
      'EUnicornEliteCombatUnicorn',
      'EUnicornAlchemistUnicorn'
    ],
    range: 3
  },
  'Cmove': {
    maxMove: 65535 // 디버그용
  }
});

domain.assign('EUnicornSpearmare', {
  'Cpos': {},
  'Cunit': {
    name: 'Spearmare',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 90,
    defense: 30
  },
  'Cattack': {
    attack: 80,
    range: 1,
    bonus: {
      counter: {
        attack: 1.2
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
    consume: 5,
    heal: 10
  },
  'Cmagic': {
  }
});

domain.assign('EUnicornFencer', {
  'Cpos': {},
  'Cunit': {
    name: 'Fencer',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 110,
    defense: 30
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
    maxMove: 3
  },
  'Cpower': {
    maxPower: 30,
    consume: 5,
    heal: 10
  },
  'Cmagic': {
  }
});

domain.assign('EUnicornRoyalNight', {
  'Cpos': {},
  'Cunit': {
    name: 'Royal Night',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 150,
    defense: 50
  },
  'Cattack': {
    attack: 90,
    range: 1
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
  'Cmagic': {
  }
});

domain.assign('EUnicornLongbowArcher', {
  'Cpos': {},
  'Cunit': {
    name: 'Longbow Archer',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 90,
    defense: 20
  },
  'Cattack': {
    attack: 65,
    attackRandomness: 95-65,
    range: 3
  },
  'Cspawn': {
    supply: 50,
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
  'Cmagic': {
  }
});

domain.assign('EUnicornSharpShooter', {
  'Cpos': {},
  'Cunit': {
    name: 'Sharp Shooter',
    team: 'pony_unicorn'
  },
  'Cown': {
    sight: 4
  },
  'Cdamage': {
    maxHealth: 80,
    defense: 10
  },
  'Cattack': {
    attack: 80,
    attackRandomness: 100-80,
    range: 3
  },
  'Cspawn': {
    supply: 50,
    troops: 120
  },
  'Cmove': {
    maxMove: 2
  },
  'Cpower': {
    maxPower: 30,
    consume: 10,
    heal: 10
  },
  'Cmagic': {
  }
});

domain.assign('EUnicornHeavyShooter', {
  'Cpos': {},
  'Cunit': {
    name: 'Heavy Shooter',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20
  },
  'Cattack': {
    attack: 60,
    attackRandomness: 150-60,
    range: 4
  },
  'Cspawn': {
    supply: 80,
    troops: 120
  },
  'Cmove': {
    maxMove: 1
  },
  'Cpower': {
    maxPower: 40,
    consume: 10,
    heal: 10
  },
  'Cmagic': {
  }
});

domain.assign('EUnicornEliteCombatUnicorn', {
  'Cpos': {},
  'Cunit': {
    name: 'Elite Combat Unicorn',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 60
  },
  'Cattack': {
    attack: 90,
    range: 1 // 일반 공격 불가
  },
  'Cspawn': {
    supply: 50,
    troops: 500
  },
  'Cmove': {
    maxMove: 2
  },
  'Cpower': {
    maxPower: 100,
    consume: 20,
    heal: 10
  },
  'Cmagic': {
  }
});

domain.assign('EUnicornAlchemistUnicorn', {
  'Cpos': {},
  'Cunit': {
    name: 'Alchemist Unicorn',
    team: 'pony_unicorn'
  },
  'Cown': {},
  'Cdamage': {
    maxHealth: 100,
    defense: 20
  },
  'Cattack': {
    attack: 0,
    range: -1 // 전투 불가
  },
  'Cspawn': {
    supply: 50,
    troops: 150
  },
  'Cmove': {
    maxMove: 3
  },
  'Cpower': {
    maxPower: 70,
    consume: 5,
    heal: 10
  },
  'Cmagic': {
  }
});
