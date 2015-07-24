export default class Hexagon {
  //http://www.mattpalmerlee.com/2012/04/05/fun-with-hexagon-math-for-games/
  constructor(width, height) {
    this.width = width | 0;
    this.height = height | 0;
    if (this.height === 0) {
      this.height = width * 2 / Math.sqrt(3) | 0;
    }
    this.sideX = this.width / 2 | 0;
    this.side = (this.height * 2 - Math.sqrt(this.height * this.height * 4 +
      12 * (this.height * this.height + this.width * this.width))) / -6 | 0;
    this.sideY = Math.sqrt(this.side * this.side -
      this.sideX * this.sideX) | 0;
  }
  get topX() {
    return this.sideX;
  }
  get topY() {
    return 0;
  }
  get rightTopX() {
    return this.width;
  }
  get rightTopY() {
    return this.sideY;
  }
  get rightBottomX() {
    return this.width;
  }
  get rightBottomY() {
    return this.sideY + this.side;
  }
  get bottomX() {
    return this.sideX;
  }
  get bottomY() {
    return this.sideY * 2 + this.side;
  }
  get leftBottomX() {
    return 0;
  }
  get leftBottomY() {
    return this.sideY + this.side;
  }
  get leftTopX() {
    return 0;
  }
  get leftTopY() {
    return this.sideY;
  }
}
