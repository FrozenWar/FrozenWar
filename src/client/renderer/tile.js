import PIXI from 'pixi.js';
import Hexagon from './hexagon.js';

let hexagon = new Hexagon(80);

/**
 * Represents a tile in the game.
 */
export default class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get texture() {
    // Return nothing by default.
  }
  static get hexagon() {
    return hexagon;
  }
}

export class DebugTile extends Tile {
  get texture() {
    return DebugTile.texture;
  }
  static get texture() {
    if (DebugTile.TEXTURE) return DebugTile.TEXTURE;
    let graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0x999999, 1);
    graphics.beginFill(0xF0F0F0, 1);
    graphics.moveTo(hexagon.topX, hexagon.topY);
    graphics.lineTo(hexagon.leftTopX, hexagon.leftTopY);
    graphics.lineTo(hexagon.leftBottomX, hexagon.leftBottomY);
    graphics.lineTo(hexagon.bottomX, hexagon.bottomY);
    graphics.lineTo(hexagon.rightBottomX, hexagon.rightBottomY);
    graphics.lineTo(hexagon.rightTopX, hexagon.rightTopY);
    graphics.lineTo(hexagon.topX, hexagon.topY);
    graphics.endFill();
    let texture = graphics.generateTexture();
    DebugTile.TEXTURE = texture;
    return texture;
  }
}
