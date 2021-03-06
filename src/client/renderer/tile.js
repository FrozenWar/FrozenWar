import PIXI from 'pixi.js';
import Hexagon from './hexagon.js';
import GroundLayer from './layer/groundLayer.js';
import UnitLayer from './layer/unitLayer.js';

let hexagon = new Hexagon(80);

/**
 * Represents a tile in the game.
 */
export default class Tile {
  constructor(x, y, entities, state) {
    this.x = x;
    this.y = y;
    this.entities = entities;
    this.state = state;
    this.selected = false;
    this.hover = false;
    this.sprite = new PIXI.Container();
    this.layers = [];
    this.addLayer(new GroundLayer(this));
    this.addLayer(new UnitLayer(this));
  }
  addLayer(layer) {
    this.layers.push(layer);
    this.sprite.addChild(layer.getSprite());
  }
  shouldComponentUpdate() {
    return !this.layers.every((e) => !e.shouldComponentUpdate());
  }
  update(renderer) {
    this.layers.forEach((e) => {
      if (e.shouldComponentUpdate()) e.update(renderer);
    });
  }
  static get hexagon() {
    return hexagon;
  }
}
