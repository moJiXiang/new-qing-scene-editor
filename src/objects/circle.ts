export class Circle extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public draw(x: number, y: number) {
    const circle = new Phaser.Geom.Circle(x, y, 5);
    var graphics = this.scene.add.graphics({ fillStyle: { color: 0xff0000 } });
    graphics.fillCircleShape(circle);
  }
}
