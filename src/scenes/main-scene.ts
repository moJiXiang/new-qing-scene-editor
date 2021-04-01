import { GameConfig } from "../config";
import { GridLayer, MapPosition } from "../objects/gridlayer";
import { PaintBrush } from "../objects/paintbrush";
import { Redhat } from "../objects/redhat";

export class MainScene extends Phaser.Scene {
  private _map: Phaser.Tilemaps.Tilemap;
  private _currentLayer: Phaser.Tilemaps.TilemapLayer;
  private _gridLayer: GridLayer;
  private _paintBrush: PaintBrush;
  private _controls: Phaser.Cameras.Controls.SmoothedKeyControl;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.tilemapTiledJSON("blank-map", "../assets/blank-map.json");
    this.load.tilemapTiledJSON("common-map", "../assets/common-map.json");
    this.load.image("ground", "../assets/ground.png");
    this.load.image("ground2", "../assets/ground2.png");

    this.load.json("map1","../assets/isometric-grass-and-water.json")
    this.load.spritesheet("tiles", "../assets/isometric-grass-and-water.png", {frameWidth: 64, frameHeight: 64})

    this.load.tilemapTiledJSON("map2", "../assets/isometric-grass-and-water.json")
    this.load.image("grass-tiles", "../assets/isometric-grass-and-water.png")
  }

  create(): void {
    this.initMap();
    this.initGridLayer();
    this.initPaintBrush();
    this.addListener();
    this.initKeyboardControl();
  }

  update(time: number, delta: number) {
    this._controls.update(delta);
  }

  private initMap() {
    // this._map = this.add.tilemap("blank-map");
    // const ground = this._map.addTilesetImage("ground", "ground");
    // this._currentLayer = this._map.createLayer("ground-layer", [ground]);
    this._map = this.add.tilemap("map2");
    const grass_and_water = this._map.addTilesetImage("isometric_grass_and_water", "grass-tiles");
    this._currentLayer = this._map.createLayer("Tile Layer 1", [grass_and_water]);


    // const show = this.add.graphics();
    // this._currentLayer.renderDebug(show);
  }

  private initMap1() {
    // this._map = this.add.tilemap("blank-map");
    // const ground = this._map.addTilesetImage("ground", "ground");
    // this._currentLayer = this._map.createLayer("ground-layer", [ground]);

    // this._map = this.add.tilemap("map1");
    // const grass_and_water = this._map.addTilesetImage("isometric_grass_and_water", "grass-and-water");
    // this._currentLayer = this._map.createLayer("Tile Layer 1", [grass_and_water]);

    const data = this.cache.json.get('map1');
    console.log('data: ', data);

    const tilewidth = data.tilewidth;
    const tileheight = data.tileheight;

    const tileWidthHalf = tilewidth / 2;
    const tileHeightHalf = tileheight / 2;

    const layer = data.layers[0].data;

    const mapwidth = data.layers[0].width;
    const mapheight = data.layers[0].height;

    // const offsetX = mapwidth * tileWidthHalf;
    const offsetX = 0;
    const offsetY = 16;

    let i = 0;

    const tile = this.add.image(0, 0 + offsetY, 'tiles', 23)
    tile.setOrigin(0.5, 0.5)

    // for (let y = 0; y < mapheight; y++)
    // {
    //     for (let x = 0; x < mapwidth; x++)
    //     {
    //         const id = layer[i] - 1;

    //         const tx = (x - y) * tileWidthHalf;
    //         const ty = (x + y) * tileHeightHalf;

    //         console.log("tx, ty: ", tx, ty)

    //         const tile = this.add.image(tx, ty, 'tiles', id);
    //         // const tile = this.add.image(centerX + tx, centerY + ty, 'tiles', id);

    //         // tile.depth = centerY + ty;

    //         i++;
    //     }
    // }

    if (GameConfig.debug) {
      // const show = this.add.graphics();
      // this._currentLayer.renderDebug(show);

      const graphics = this.add.graphics({
        x: 0,
        y: 0,
      });

      graphics.lineStyle(2, 0xffffff);

      graphics.beginPath();
      graphics.arc(
        0,
        0,
        2,
        Phaser.Math.DegToRad(0),
        Phaser.Math.DegToRad(360),
        false,
        0.02
      );
      graphics.strokePath();
      graphics.closePath();
    }
  }

  private initGridLayer() {

    const data = this.cache.json.get('map1');
    console.log('data: ', data);

    // const tilewidth = data.tilewidth;
    // const tileheight = data.tileheight;
    // const rows = data.width;
    // const cols = data.heigth

    this._gridLayer = new GridLayer(this);

    const { rows, cols, tileWidth, tileHeight } = GameConfig;

    this._gridLayer.draw({
      rows,
      cols,
      tileWidth,
      tileHeight,
    });
  }

  private initPaintBrush() {
    this._paintBrush = new PaintBrush(
      this,
      GameConfig.tileWidth,
      GameConfig.tileHeight
    );
  }

  private initKeyboardControl() {
    const cursors = this.input.keyboard.createCursorKeys();

    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      acceleration: 0.04,
      drag: 0.0005,
      maxSpeed: 0.7,
    };

    this._controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig
    );
  }

  private addListener() {
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerdown", this.onPointerDown, this);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;

    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY);

    const mapPos = new MapPosition(
      tile.x,
      tile.y,
      GameConfig.tileWidth,
      GameConfig.tileHeight
    );

    this._paintBrush.update(
      mapPos.getScreenPoint().x,
      mapPos.getScreenPoint().y
    );
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;
    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY);
    console.log(
      "🚀 ~ file: main-scene.ts ~ line 131 ~ MainScene ~ onPointerDown ~ tile",
      tile
    );
    this._currentLayer.putTileAt(1, tile.x, tile.y);
  }
}
