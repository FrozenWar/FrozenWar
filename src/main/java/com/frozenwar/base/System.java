package com.frozenwar.base;

public interface System extends GameObject {
  public String[] getAffactedComponents();
  public void run(Component e);
}
