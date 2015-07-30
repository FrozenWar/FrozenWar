import PIXI from 'pixi.js';
import Layer from './layer.js';
import Tile from '../tile.js';

export default class PositionLayer extends Layer {
  constructor(tile) {
    super(tile);
  }
  shouldComponentUpdate() {
    return this.x !== this.tile.x || this.y !== this.tile.y;
  }
  createSprite() {
    return new PIXI.Text('', {
      font: '14px NanumGothic, 나눔고딕, 맑은 고딕, MalgunGothic, sans-serif'
    });
  }
  update() {
    this.x = this.tile.x;
    this.y = this.tile.y;
    this.sprite.text = this.x + ', ' + this.y;
    this.sprite.x = Tile.hexagon.width / 2 - this.sprite.width / 2 | 0;
    this.sprite.y = Tile.hexagon.height / 2 - this.sprite.height / 2 | 0;
  }
}
