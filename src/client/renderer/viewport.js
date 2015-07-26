import PIXI from 'pixi.js';
// For debugging
import {DebugTile} from './tile.js';

export default class Viewport {
  constructor(tilemap, hexagon, width, height) {
    this.tilemap = tilemap;
    this.width = width;
    this.height = height;
    this.hexagon = hexagon;
    this.posX = 0;
    this.posY = 0;
    // We're using object to avoid making 'empty' reference
    this.renderMap = {};
    this.container = new PIXI.Container();
    this.setCamera(0, 0);
  }
  getRenderX(x, y) {
    return x * this.hexagon.width + (this.hexagon.width / 2 * (y & 1));
  }
  getRenderY(x, y) {
    return y * (this.hexagon.height - this.hexagon.sideY - 2);
  }
  getRenderWidth(width) {
    return Math.ceil((width - this.hexagon.sideX - 2) / this.hexagon.width);
  }
  getRenderHeight(height) {
    return Math.ceil((height - this.hexagon.sideY - 2) / (this.hexagon.height -
      this.hexagon.sideY - 2));
  }
  flooredModulo(x, y) {
    // http://javascript.about.com/od/problemsolving/a/modulobug.htm
    return ((x % y) + y) % y;
  }
  freeCamera(postX, postY) {
    let stepWidth = this.hexagon.width;
    let stepHeight = this.hexagon.height - this.hexagon.sideY - 2;
    let tileX = Math.floor(this.posX / stepWidth) - 1;
    let tileY = Math.floor(this.posY / stepHeight) - 1;
    let tileWidth = this.getRenderWidth(this.width) + 1;
    let tileHeight = this.getRenderHeight(this.height) + 1;
    let endX = Math.floor(postX / stepWidth) - 1;
    let endY = Math.floor(postY / stepHeight) - 1;
    for (let y = 0; y <= tileHeight; ++y) {
      let realY = tileY + y;
      if (this.renderMap[realY] == null) continue;
      let renderRow = this.renderMap[realY];
      for (let x = 0; x <= tileWidth; ++x) {
        let realX = tileX + x;
        if (realX >= endX && realX < endX + tileWidth &&
          realY >= endY && realY < endY + tileHeight) continue;
        if (renderRow[realX] != null) {
          let sprite = renderRow[realX];
          this.container.removeChild(sprite);
          delete renderRow[realX];
        }
      }
    }
  }
  moveCamera(deltaX, deltaY) {
    this.setCamera(this.posX + deltaX, this.posY + deltaY);
  }
  setCamera(posX, posY) {
    this.freeCamera(posX, posY);
    this.posX = posX;
    this.posY = posY;
    let stepWidth = this.hexagon.width;
    let stepHeight = this.hexagon.height - this.hexagon.sideY - 2;
    let tileX = Math.floor(this.posX / stepWidth) - 1;
    let tileY = Math.floor(this.posY / stepHeight) - 1;
    // Kinda tricky, it has to support negative numbers
    let initX = -(this.flooredModulo(this.posX, stepWidth)) - stepWidth;
    let initY = -(this.flooredModulo(this.posY, stepHeight)) - stepHeight;
    let tileWidth = this.getRenderWidth(this.width) + 1;
    let tileHeight = this.getRenderHeight(this.height) + 1;
    for (let y = 0; y <= tileHeight; ++y) {
      let realY = tileY + y;
      let renderY = initY + stepHeight * y;
      // Create empty object if undefined.
      if (this.renderMap[realY] == null) {
        this.renderMap[realY] = {};
      }
      let renderRow = this.renderMap[realY];
      for (let x = 0; x <= tileWidth; ++x) {
        let realX = tileX + x;
        let renderX = initX + this.getRenderX(x, y + tileY);
        // TODO validate
        if (renderRow[realX] == null) {
          // Create new sprite and add it to container.
          let sprite = new PIXI.Sprite(DebugTile.texture);
          this.container.addChild(sprite);
          sprite.position.x = renderX;
          sprite.position.y = renderY;
          renderRow[realX] = sprite;
        } else {
          // Update position only
          let sprite = renderRow[realX];
          sprite.position.x = renderX;
          sprite.position.y = renderY;
        }
      }
    }
  }
}
