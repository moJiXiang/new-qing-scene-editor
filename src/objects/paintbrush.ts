import { MapPosition, ScreenPoint } from "./gridlayer";

export class PaintBrush {
  private _sprite: Phaser.GameObjects.Sprite;
  private _brushContainer: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    tileWidth: number,
    tileHeight: number
  ) {
    this.createBrushContainer(
      new MapPosition(0, 0, tileWidth, tileHeight).getOffsetPoint(),
      new MapPosition(1, 0, tileWidth, tileHeight).getOffsetPoint(),
      new MapPosition(1, 1, tileWidth, tileHeight).getOffsetPoint(),
      new MapPosition(0, 1, tileWidth, tileHeight).getOffsetPoint()
    );
  }

  private createBrushContainer(
    top: ScreenPoint,
    right: ScreenPoint,
    bottom: ScreenPoint,
    left: ScreenPoint
  ) {
    this._brushContainer = this.scene.add.graphics();
    this._brushContainer.lineStyle(2, 0x000000, 1);
    this._brushContainer.beginPath();

    this._brushContainer.moveTo(top.x, top.y);
    this._brushContainer.lineTo(right.x, right.y);
    this._brushContainer.lineTo(bottom.x, bottom.y);
    this._brushContainer.lineTo(left.x, left.y);

    this._brushContainer.closePath();
    this._brushContainer.strokePath();
  }

  public setSprite(name: string) {
    this._sprite = this.scene.add.sprite(0, 0, name);
  }

  // real screen position
  public update(x: number, y: number) {
    // this._sprite.setPosition(x, y);
    this._brushContainer.setPosition(x, y);
  }
}
