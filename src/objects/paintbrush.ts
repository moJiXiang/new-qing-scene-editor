import Utils from "../utils";
import { MapPosition, ScreenPoint } from "./gridlayer";

export class PaintBrush {
  public width: number = 1; // in tiles
  public height: number = 1; // in tiles
  private _brush: Phaser.GameObjects.Sprite; // 笔刷
  private _top: ScreenPoint;
  private _right: ScreenPoint;
  private _bottom: ScreenPoint;
  private _left: ScreenPoint;
  private _brushContainer: Phaser.GameObjects.Graphics; // 笔刷容器，包括框选形成的笔刷矩形
  private _color = Phaser.Display.Color.HexStringToColor("#00c0ff").color;
  private _startTile: Phaser.Tilemaps.Tile;
  private _endTile: Phaser.Tilemaps.Tile;
  private _isTakingBrush: boolean = false;
  public brushTilesArray: number[][] = [[]];
  public spriteContainer: Phaser.GameObjects.Container;

  public get top() {
    return this._top;
  }

  public setCustomBrush(sprites: Phaser.GameObjects.Sprite[]) {
    // this._brush.destroy();
    this.spriteContainer.destroy();
    this.spriteContainer = this.scene.add.container(this._top.x, this._top.y);

    this.spriteContainer.removeAll();
    this.spriteContainer.add(sprites);
  }
  public destroySpriteContainer() {
    this.spriteContainer.destroy();
  }

  public setBrushTilesArray(
    tiles: Phaser.Tilemaps.Tile[],
    width: number,
    height: number
  ) {
    this.brushTilesArray = Utils.Get2dArr(width, height);

    let brushTiles = new Array();

    let times = tiles.length / height;

    while (times > 0) {
      brushTiles.push(tiles.splice(0, height));
      times--;
    }

    for (let i = 0; i < brushTiles.length; i++) {
      for (let j = 0; j < brushTiles[i].length; j++) {
        const tile = brushTiles[i][j];
        if (tile) {
          this.brushTilesArray[i][j] = tile.index;
        } else {
          this.brushTilesArray[i][j] = 0;
        }
      }
    }
  }

  constructor(
    private scene: Phaser.Scene,
    private tileWidth: number,
    private tileHeight: number,
    texture: string,
    frameName: string
  ) {
    this.createBrushContainer(
      new MapPosition(0, 0, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(1, 0, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(1, 1, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(0, 1, tileWidth, tileHeight).getScreenPoint()
    );
    this._brush = this.scene.add
      .sprite(0, 0, texture, frameName)
      .setOrigin(0.5, 0)
      .setDepth(0);
  }

  private createBrushContainer(
    top: ScreenPoint,
    right: ScreenPoint,
    bottom: ScreenPoint,
    left: ScreenPoint
  ) {
    this._brushContainer = this.scene.add.graphics();
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;
    this._brushContainer.depth = 1;

    this._brushContainer
      .lineStyle(2, this._color, 1)
      .beginPath()
      .moveTo(top.x, top.y)
      .lineTo(right.x, right.y)
      .lineTo(bottom.x, bottom.y)
      .lineTo(left.x, left.y)
      .closePath()
      .strokePath();

    this._brushContainer.fillStyle(this._color, 0.2);
    this._brushContainer.fillPoints([
      new Phaser.Geom.Point(top.x, top.y),
      new Phaser.Geom.Point(right.x, right.y),
      new Phaser.Geom.Point(bottom.x, bottom.y),
      new Phaser.Geom.Point(left.x, left.y),
    ]);

    // container show brush sprite
    this.spriteContainer = this.scene.add.container(top.x, top.y);
  }

  public get container() {
    return this._brushContainer;
  }

  public changeBrush(texture: string, frameName: string) {
    this._brush.setVisible(true);
    this._brush.setTexture(texture, frameName);
  }

  public toggleTakingBrush(value: boolean) {
    this._isTakingBrush = value;
  }

  public hide() {
    this._brush.setVisible(false);
  }

  public updateBrushContainerSize(
    startTile: Phaser.Tilemaps.Tile,
    endTile: Phaser.Tilemaps.Tile
  ) {
    // startTile change endTile change
    if (
      this._startTile &&
      this._endTile &&
      startTile.x === this._startTile.x &&
      startTile.y === this._startTile.x &&
      endTile.x === this._endTile.y &&
      endTile.y === this._endTile.y
    ) {
      return;
    }

    this._startTile = startTile;
    this._endTile = endTile;

    this.width = endTile.x - startTile.x + 1;
    this.height = endTile.y - startTile.y + 1;

    const top = new MapPosition(
      startTile.x,
      startTile.y,
      this.tileWidth,
      this.tileHeight
    ).getPoint4Positions().top;

    const right = new MapPosition(
      endTile.x,
      startTile.y,
      this.tileWidth,
      this.tileHeight
    ).getPoint4Positions().right;

    const bottom = new MapPosition(
      endTile.x,
      endTile.y,
      this.tileWidth,
      this.tileHeight
    ).getPoint4Positions().bottom;

    const left = new MapPosition(
      startTile.x,
      endTile.y,
      this.tileWidth,
      this.tileHeight
    ).getPoint4Positions().left;

    this._brushContainer.clear();
    this._brushContainer = this.scene.add.graphics();

    this._brushContainer
      .lineStyle(2, this._color, 1)
      .beginPath()
      .moveTo(top.x, top.y)
      .lineTo(right.x, right.y)
      .lineTo(bottom.x, bottom.y)
      .lineTo(left.x, left.y)
      .closePath()
      .strokePath();

    this._brushContainer.fillStyle(this._color, 0.2);
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;

    this._brushContainer.fillPoints([
      new Phaser.Geom.Point(top.x, top.y),
      new Phaser.Geom.Point(right.x, right.y),
      new Phaser.Geom.Point(bottom.x, bottom.y),
      new Phaser.Geom.Point(left.x, left.y),
    ]);
  }

  private updateBrushContainerPosition(x: number, y: number) {
    const offsetX = x - this._top.x;
    const offsetY = y - this._top.y;

    const top = new ScreenPoint(x, y);
    const right = new ScreenPoint(
      this._right.x + offsetX,
      this._right.y + offsetY
    );
    const bottom = new ScreenPoint(
      this._bottom.x + offsetX,
      this._bottom.y + offsetY
    );
    const left = new ScreenPoint(
      this._left.x + offsetX,
      this._left.y + offsetY
    );

    this._brushContainer.clear();
    this._brushContainer = this.scene.add.graphics();

    this._brushContainer
      .lineStyle(2, this._color, 1)
      .beginPath()
      .moveTo(top.x, top.y)
      .lineTo(right.x, right.y)
      .lineTo(bottom.x, bottom.y)
      .lineTo(left.x, left.y)
      .closePath()
      .strokePath();

    this._brushContainer.fillStyle(this._color, 0.2);
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;

    this._brushContainer.fillPoints([
      new Phaser.Geom.Point(top.x, top.y),
      new Phaser.Geom.Point(right.x, right.y),
      new Phaser.Geom.Point(bottom.x, bottom.y),
      new Phaser.Geom.Point(left.x, left.y),
    ]);
    this.spriteContainer.setPosition(top.x, top.y);
  }

  // real screen position
  public update(x: number, y: number) {
    if (!this._isTakingBrush) {
      this._brush.setPosition(x, y);

      this.updateBrushContainerPosition(x, y);
      //   this._brushContainer.setPosition(x, y);
    }
  }
}
