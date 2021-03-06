import PIXI from 'pixi.js';
// For debugging
import Tile from './tile.js';

export default class Viewport {
  constructor(engine, renderer, hexagon, width, height) {
    this.engine = engine;
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.hexagon = hexagon;
    this.posX = 0;
    this.posY = 0;
    // We're using object to avoid making 'empty' reference
    this.renderMap = {};
    this.container = new PIXI.Container();
    this.invalidated = true;
    this.selectedTile = null;
    this.mouseMoveTile = null;
    this.setCamera(0, 0);
  }
  shouldComponentUpdate() {
    return this.invalidated;
  }
  update() {
    this.invalidated = false;
  }
  getRenderX(x, y) {
    return x * this.hexagon.width + (this.hexagon.width / 2 * (y & 1));
  }
  getRenderY(x, y) {
    return y * (this.hexagon.height - this.hexagon.sideY);
  }
  getRenderWidth(width) {
    return Math.ceil((width - this.hexagon.sideX) / this.hexagon.width);
  }
  getRenderHeight(height) {
    return Math.ceil((height - this.hexagon.sideY) / (this.hexagon.height -
      this.hexagon.sideY - 2));
  }
  flooredModulo(x, y) {
    // http://javascript.about.com/od/problemsolving/a/modulobug.htm
    return ((x % y) + y) % y;
  }
  freeCamera(postX, postY) {
    let stepWidth = this.hexagon.width;
    let stepHeight = this.hexagon.stepHeight;
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
        if (realX >= endX && realX <= endX + tileWidth &&
          realY >= endY && realY <= endY + tileHeight) continue;
        if (renderRow[realX] != null) {
          let tile = renderRow[realX];
          this.container.removeChild(tile.sprite);
          delete renderRow[realX];
        }
      }
    }
  }
  moveCamera(deltaX, deltaY) {
    this.setCamera(this.posX + deltaX, this.posY + deltaY);
  }
  setCamera(posX, posY) {
    let tileWidth = this.getRenderWidth(this.width) + 1;
    let tileHeight = this.getRenderHeight(this.height) + 1;
    // temporary placeholder
    let tilemap = {
      width: 20, height: 20
    };
    let state = this.engine.getState();
    let posIndex = state.posIndex;
    // Determine the size of the tile map.
    let mapWidth = this.hexagon.width * tilemap.width +
      this.hexagon.sideX;
    let mapHeight = (this.hexagon.stepHeight) *
      tilemap.height + this.hexagon.sideY;
    // Set min/max value of position.
    posX = Math.min(mapWidth - this.width, posX);
    posY = Math.min(mapHeight - this.height, posY);
    posX = Math.max(0, posX);
    posY = Math.max(0, posY);
    this.freeCamera(posX, posY);
    this.posX = posX;
    this.posY = posY;
    let invalidated = false;
    let stepWidth = this.hexagon.width;
    let stepHeight = this.hexagon.stepHeight;
    let tileX = Math.floor(this.posX / stepWidth) - 1;
    let tileY = Math.floor(this.posY / stepHeight) - 1;
    if (tileX !== this.tileX || tileY !== this.tileY) {
      this.tileX = tileX;
      this.tileY = tileY;
      invalidated = true;
    }
    // Kinda tricky, it has to support negative numbers
    let initX = -stepWidth;
    let initY = -stepHeight;
    this.container.position.x = -(this.flooredModulo(this.posX, stepWidth));
    this.container.position.y = -(this.flooredModulo(this.posY, stepHeight));
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
          // Doing this to use axial coordinates
          let entities = [];
          if (posIndex[realY]) {
            entities = posIndex[realX - (realY / 2 | 0)] || [];
          }
          if (entities == null) continue;
          // Create new sprite and add it to container.
          let tile = new Tile(realX - (realY / 2 | 0), realY, entities, state);
          this.container.addChild(tile.sprite);
          tile.sprite.position.x = renderX;
          tile.sprite.position.y = renderY;
          tile.update(this.renderer);
          // Additionally, iterate through tile array
          /*tile.forEach(entity => {
            let unitTile = new UnitTile(entity.c('info').name);
            let entitySprite = new PIXI.Sprite(unitTile.getTexture(
              this.renderer));
            entitySprite.position.x = this.hexagon.width / 2 -
              entitySprite.width / 2 | 0;
            entitySprite.position.y = this.hexagon.height / 2 -
              entitySprite.height / 2 | 0;
            sprite.addChild(entitySprite);
          });*/
          renderRow[realX] = tile;
        } else if (invalidated) {
          // Update position only
          let tile = renderRow[realX];
          tile.update(this.renderer);
          let sprite = tile.sprite;
          sprite.position.x = renderX;
          sprite.position.y = renderY;
        }
      }
      this.invalidated = true;
    }
  }
  updateTile(tile) {
    if (tile.shouldComponentUpdate()) {
      tile.update();
      this.invalidated = true;
    }
  }
  getTile(x, y) {
    let renderRow = this.renderMap[y];
    if (!renderRow) return null;
    let tile = renderRow[x];
    if (!tile) return null;
    return tile;
  }
  handleMouseClick(x, y) {
    let oldTile = null;
    if (this.selectedTile) {
      oldTile = this.selectedTile;
      oldTile.selected = false;
    }
    let selected = this.getMousePos(x, y);
    let tile = this.getTile(selected.x, selected.y);
    this.selectedTile = tile;
    if (tile) {
      tile.selected = true;
      this.updateTile(tile);
    }
    if (oldTile) this.updateTile(oldTile);
  }
  handleMouseMove(x, y) {
    let oldTile = null;
    if (this.mouseMoveTile) {
      oldTile = this.mouseMoveTile;
      oldTile.hover = false;
    }
    let selected = this.getMousePos(x, y);
    let tile = this.getTile(selected.x, selected.y);
    this.mouseMoveTile = tile;
    if (tile) {
      tile.hover = true;
      this.updateTile(tile);
    }
    if (oldTile) this.updateTile(oldTile);
  }
  getMousePos(x, y) {
    // Directly copied from old code
    // Translate x, y
    let mPosX = x + this.posX;
    let mPosY = y + this.posY;
    let hexagon = this.hexagon;
    let posX = mPosX / hexagon.width | 0;
    let posY = mPosY / hexagon.stepHeight | 0;
    let pixelX = mPosX % hexagon.width;
    let pixelY = mPosY % hexagon.stepHeight;
    let tilePosX = 0;
    let tilePosY = 0;
    if ((posY & 1) === 0) {
      tilePosY = posY;
      tilePosX = posX;
      if (pixelX < (hexagon.sideX - (hexagon.sideX / hexagon.sideY * pixelY))) {
        tilePosY -= 1;
        tilePosX -= 1;
      }
      if (pixelX > (hexagon.sideX + (hexagon.sideX / hexagon.sideY * pixelY))) {
        tilePosY -= 1;
      }
    } else {
      tilePosY = posY;
      tilePosX = posX;
      if (pixelX < hexagon.sideX) {
        if (pixelX > (hexagon.sideX / hexagon.sideY * pixelY)) {
          tilePosY -= 1;
        } else {
          tilePosX -= 1;
        }
      } else {
        if (pixelX < (hexagon.width - hexagon.sideX / hexagon.sideY * pixelY)) {
          tilePosY -= 1;
        }
      }
    }
    return {
      x: tilePosX,
      y: tilePosY
    };
  }
}
