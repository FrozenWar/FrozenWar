import PIXI from 'pixi.js';
import Hexagon from './hexagon.js';

let hexagon = new Hexagon(80);

/**
 * Represents a tile in the game.
 */
export default class Tile {
  constructor(x, y) {
    // TODO not sure this is necessary.
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
  getTexture(renderer) {
    return DebugTile.getTexture(renderer);
  }
  static getTexture(renderer) {
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
    let texture = graphics.generateTexture(renderer);
    DebugTile.TEXTURE = texture;
    return texture;
  }
}

export class UnitTile extends Tile {
  constructor(unitName) {
    super(0, 0);
    this.unitName = unitName;
  }
  getTexture(renderer) {
    if (this.TEXTURE) return this.TEXTURE;
    let graphics = new PIXI.Container();
    // Currently do nothing but spawn text.
    let font = new PIXI.Text(this.unitName, {
      font: '14pt NanumGothic, 나눔고딕, 맑은 고딕, MalgunGothic, sans-serif'
    });
    graphics.addChild(font);
    let texture = graphics.generateTexture(renderer);
    this.TEXTURE = texture;
    return texture;
  }
}
