import { MapPosition, ScreenPoint } from "./gridlayer";

export class PaintBrush {
  private _brush: Phaser.GameObjects.Sprite;
  private _brushContainer: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    tileWidth: number,
    tileHeight: number,
    texture: string,
    frameName: string
  ) {
    this.createBrushContainer(
      new MapPosition(0, 0, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(1, 0, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(1, 1, tileWidth, tileHeight).getScreenPoint(),
      new MapPosition(0, 1, tileWidth, tileHeight).getScreenPoint()
    );

    this._brush = this.scene.add.sprite(0, 0, texture, frameName).setOrigin(0.5, 0).setDepth(0)
  }

  private createBrushContainer(
    top: ScreenPoint,
    right: ScreenPoint,
    bottom: ScreenPoint,
    left: ScreenPoint
  ) {
    this._brushContainer = this.scene.add.graphics();
    this._brushContainer.depth = 1;
    const color = Phaser.Display.Color.HexStringToColor("#00c0ff").color
    this._brushContainer.lineStyle(2, color, 1);
    this._brushContainer.beginPath();

    this._brushContainer.moveTo(top.x, top.y);
    this._brushContainer.lineTo(right.x, right.y);
    this._brushContainer.lineTo(bottom.x, bottom.y);
    this._brushContainer.lineTo(left.x, left.y);
    
    this._brushContainer.closePath();
    // this._brushContainer.fillStyle(color, 0.5);
    // this._brushContainer.fillPoints([new Phaser.Geom.Point(top.x, top.y), new Phaser.Geom.Point(right.x, right.y), new Phaser.Geom.Point(bottom.x, bottom.y), new Phaser.Geom.Point(left.x, left.y)])
  }

  public changeBrush( texture: string,  frameName: string) {
      this._brush.setVisible(true)
      this._brush.setTexture(texture, frameName)
  }

  public hide() {
    this._brush.setVisible(false)
    console.log(">>> brush: ", this._brush)
  }

  // real screen position
  public update(x: number, y: number) {
    this._brush.setPosition(x, y);
    this._brushContainer.setPosition(x, y);
  }
}
