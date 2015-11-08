import PIXI from 'pixi.js';
import Layer from './layer.js';
import Tile from '../tile.js';

export default class PositionLayer extends Layer {
  constructor(tile) {
    super(tile);
  }
  shouldComponentUpdate() {
    return this.cache !== this.tile.entities.length ||
      this.selected !== this.tile.selected;
  }
  createSprite() {
    return new PIXI.Container();
  }
  update() {
    this.selected = this.tile.selected;
    this.cache = this.tile.entities.length;
    let drawX = 0;
    let drawY = 0;
    let hexagon = Tile.hexagon;
    this.sprite.removeChildren();
    // TODO caching /w textures?
    this.tile.entities.forEach((entity) => {
      let graphics = new PIXI.Graphics();
      graphics.lineStyle(2, 0x999999, 1);
      let fillColor = 0xCCCCCC;
      if (this.selected) fillColor = 0xFFFFFF;
      graphics.beginFill(fillColor, 1);
      graphics.drawRect(0, 0, hexagon.width - 8, hexagon.side);
      graphics.endFill();
      graphics.position.x = drawX + 4;
      graphics.position.y = drawY + hexagon.height / 2 -
        hexagon.side / 2;
      console.log(entity, this.tile.state);
      let text = new PIXI.Text(this.tile.state.info[entity].name, {
        font: '12px NanumGothic, 나눔고딕, 맑은 고딕, MalgunGothic, sans-serif',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: graphics.height
      });
      text.x = graphics.width / 2 - text.width / 2 | 0;
      text.y = graphics.height / 2 - text.height / 2 | 0;
      graphics.addChild(text);
      this.sprite.addChild(graphics);
      drawX -= 4;
      drawY -= 4;
    });
  }
}
