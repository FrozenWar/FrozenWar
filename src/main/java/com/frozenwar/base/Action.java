package com.frozenwar.base;

public interface Action extends GameObject {
  public void run();
  public boolean undo();
}
