export interface MapSize {
  rows: number; // The width of the map (in tiles)
  cols: number; // The height of the map (in tiles)
  tileWidth: number;
  tileHeight: number;
}

export class ScreenPoint {
  // in pixels
  constructor(public x: number, public y: number) {}

  static CenterOfTwoPoints(point1: ScreenPoint, point2: ScreenPoint) {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };
  }
}

export class MapPosition {
  constructor(
    private tileX: number,
    private tileY: number,
    private tileWidth: number,
    private tileHeight: number
  ) {}

  private get TILE_WIDTH_HALF() {
    return this.tileWidth / 2;
  }

  private get TILE_HEIGHT_HALF() {
    return this.tileHeight / 2;
  }

  static WorldToTilePos(
    x: number,
    y: number,
    tileWidth: number,
    tileHeight: number
  ): { tileX: number; tileY: number } {
    const eventTileX = Math.floor(x % tileWidth);
    const eventTileY = Math.floor(y % tileHeight);

    const hitTest: any[] = [];
    if (hitTest[eventTileX + eventTileY * tileWidth] !== 255) {
      // On event tile
      return {
        tileX: Math.floor((x + tileWidth) / tileWidth) - 1,
        tileY: 2 * (Math.floor((y + tileHeight) / tileHeight) - 1),
      };
    } else {
      // On odd tile
      return {
        tileX: Math.floor((x + tileWidth / 2) / tileWidth) - 1,
        tileY: 2 * Math.floor((y + tileHeight / 2) / tileHeight) - 1,
      };
    }
  }


  getScreenPoint(): ScreenPoint {
    return new ScreenPoint(
      (this.tileX - this.tileY) * this.TILE_WIDTH_HALF,
      (this.tileX + this.tileY) * this.TILE_HEIGHT_HALF
    );
  }
}

export class GridLayer extends Phaser.GameObjects.Graphics {
  private graphics: Phaser.GameObjects.Graphics;
  private lineWidth = 1;
  private color = 0xffffff;

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public draw(mapSize: MapSize) {
    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(this.lineWidth, this.color);

    const { rows, cols, tileWidth, tileHeight } = mapSize;
    for (let tileX = 0; tileX <= rows; tileX++) {
      const mapFrom = new MapPosition(tileX, 0, tileWidth, tileHeight);
      const mapTo = new MapPosition(tileX, cols, tileWidth, tileHeight);
      this.drawLine(mapFrom.getScreenPoint(), mapTo.getScreenPoint());
    }

    for (let tileY = 0; tileY <= cols; tileY++) {
      const mapFrom = new MapPosition(0, tileY, tileWidth, tileHeight);
      const mapTo = new MapPosition(rows, tileY, tileWidth, tileHeight);
      this.drawLine(mapFrom.getScreenPoint(), mapTo.getScreenPoint());
    }
  }

  private drawLine(from: ScreenPoint, to: ScreenPoint) {
    this.graphics.lineBetween(from.x, from.y, to.x, to.y);
  }
}
