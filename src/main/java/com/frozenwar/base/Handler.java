package com.frozenwar.base;

import com.frozenwar.base.world.World;

public interface Handler extends GameObject {
  
  public void handle(World world, Action action);
}
