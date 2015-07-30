import PIXI from 'pixi.js';

export default class Layer {
  constructor(tile) {
    this.tile = tile;
    this.getSprite();
  }
  getSprite() {
    if (this.sprite == null) {
      this.sprite = this.createSprite();
    }
    return this.sprite;
  }
  createSprite() {
    return new PIXI.Sprite();
  }
  shouldComponentUpdate() {
    return true;
  }
  update() {
  }
}
