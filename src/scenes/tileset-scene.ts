export class TilesetScene extends Phaser.Scene {
  constructor() {
    super({ key: "TilesetScene" });
    console.log(">> tileset scene");
  }

  preload() {
    this.load.image("groundTileset", "../assets/ground.png");
  }

  create() {
    console.log("Tileset scene init");
    // this.add.image(200, 100, "groundTileset");

    const tileSelector = this.add.group();

    const tileSelectorBackground = this.add.graphics();

    tileSelector.add(tileSelectorBackground);

    const tileStrip = tileSelector.create(100, 100, "groundTileset")

    console.log(">> tileSelector: ", tileSelector.getChildren());

    this.input.setHitArea(tileSelector.getChildren()).on(
      "gameobjectdown",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        console.log(">> pointer: ", pointer, gameObject);
      }
    );
  }

  pickTile(sprite: any) {
    console.log(">> sprite: ", sprite);
  }
}
