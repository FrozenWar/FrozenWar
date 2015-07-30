import PIXI from 'pixi.js';
import Layer from './layer.js';
import Tile from '../tile.js';

// No hoisting? alrighty..
let textureStore = {};
// Since only background colors are different,
// I'm using an object to store them.
let textureColors = {
  'normal': 0xF0F0F0,
  'hover': 0xD0D0FF,
  'selected': 0xFFFFFF
};

function fetchTexture(renderer, name) {
  // Just return if it exists.
  if (textureStore[name]) {
    return textureStore[name];
  }
  // Generate texture otherwise.
  let hexagon = Tile.hexagon;
  let graphics = new PIXI.Graphics();
  graphics.lineStyle(1, 0x999999, 1);
  graphics.beginFill(textureColors[name], 1);
  graphics.moveTo(hexagon.topX, hexagon.topY);
  graphics.lineTo(hexagon.leftTopX, hexagon.leftTopY);
  graphics.lineTo(hexagon.leftBottomX, hexagon.leftBottomY);
  graphics.lineTo(hexagon.bottomX, hexagon.bottomY);
  graphics.lineTo(hexagon.rightBottomX, hexagon.rightBottomY);
  graphics.lineTo(hexagon.rightTopX, hexagon.rightTopY);
  graphics.lineTo(hexagon.topX, hexagon.topY);
  graphics.endFill();
  let texture = graphics.generateTexture(renderer);
  textureStore[name] = texture;
  return texture;
}

export default class GroundLayer extends Layer {
  constructor(tile) {
    super(tile);
    this.state = null;
  }
  getRequiredState() {
    if (this.tile.selected) return 'selected';
    if (this.tile.hover) return 'hover';
    return 'normal';
  }
  shouldComponentUpdate() {
    return this.getRequiredState() !== this.state;
  }
  update(renderer) {
    // Set texture appropriately
    this.state = this.getRequiredState();
    this.sprite.texture = fetchTexture(renderer, this.state);
  }
}
