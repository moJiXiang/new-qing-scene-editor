import { GameConfig } from "../config";
import { GridLayer, MapPosition, ScreenPoint } from "../objects/gridlayer";
import { PaintBrush } from "../objects/paintbrush";
import { Redhat } from "../objects/redhat";

export class MainScene extends Phaser.Scene {
  private _map: Phaser.Tilemaps.Tilemap;
  private _currentLayer: Phaser.Tilemaps.TilemapLayer;
  private _gridLayer: GridLayer;
  private _paintBrush: PaintBrush;
  private _controls: Phaser.Cameras.Controls.SmoothedKeyControl;

  private frames: string[];
  private texture = "grounds"
  private frameName = "ground1.png";
  private sourceTileX = 0;
  private sourceTileY = 0;

  private sourceWorldX = 0;
  private sourceWorldY = 0;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.tilemapTiledJSON("blank-map", "../assets/blank-map.json");
    this.load.tilemapTiledJSON("common-map", "../assets/common-map.json");
    this.load.image("ground", "../assets/ground.png");
    this.load.atlas("grounds", "../assets/ground.png", "../assets/ground.json");

    this.load.image("ground2", "../assets/ground2.png");

    this.load.json("map1", "../assets/isometric-grass-and-water.json");
    this.load.spritesheet("tiles", "../assets/isometric-grass-and-water.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.tilemapTiledJSON(
      "map2",
      "../assets/isometric-grass-and-water.json"
    );
    this.load.image("grass-tiles", "../assets/isometric-grass-and-water.png");
  }

  create(): void {
    this.input.mouse.disableContextMenu();
    this.initMap();
    this.initGridLayer();
    this.initFrames();
    this.initPaintBrush();
    this.addListener();
    this.initKeyboardControl();
    // this.createTileSelector()
  }

  update(time: number, delta: number) {
    this._controls.update(delta);
  }

  private initMap() {
    this._map = this.add.tilemap("blank-map");
    const ground = this._map.addTilesetImage("ground", "ground");
    this._currentLayer = this._map.createLayer("ground-layer", [ground]);
    // this._map = this.add.tilemap("map2");
    // const grass_and_water = this._map.addTilesetImage(
    //   "isometric_grass_and_water",
    //   "grass-tiles"
    // );
    // this._currentLayer = this._map.createLayer("Tile Layer 1", [
    //   grass_and_water,
    // ]);

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

    const data = this.cache.json.get("map1");
    console.log("data: ", data);

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

    const tile = this.add.image(0, 0 + offsetY, "tiles", 23);
    tile.setOrigin(0.5, 0.5);

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
    this._gridLayer = new GridLayer(this);

    const { rows, cols, tileWidth, tileHeight } = GameConfig;
    console.log(
      "🚀 ~ file: main-scene.ts ~ line 161 ~ MainScene ~ initGridLayer ~ rows, cols,",
      rows,
      cols
    );

    this._gridLayer.draw({
      rows,
      cols,
      tileWidth,
      tileHeight,
    });
  }

  private initFrames() {
    const atlasTexture = this.textures.get("grounds");
    console.log(
      "🚀 ~ file: main-scene.ts ~ line 230 ~ MainScene ~ onPointerDown ~ atlasTexture",
      atlasTexture
    );

    const frames = atlasTexture.getFrameNames();
    this.frames = frames;
  }

  private initPaintBrush() {
    this._paintBrush = new PaintBrush(
      this,
      GameConfig.tileWidth,
      GameConfig.tileHeight,
      "grounds",
      this.frameName
    );

    // show sprite width frameKey
  }

  // private changePaintBrush(frameKey: string) {
  //   this._paintBrush.setBrush("grounds", frameKey);
  // }

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

  private createTileSelector() {
    const tileSelector = this.add.group();

    const tileSelectorBackground = this.add.graphics();

    tileSelector.add(tileSelectorBackground);

    const tileStrip = tileSelector.create(1, 1, "ground");
    tileStrip.inputEnabled = true;
  }

  private addListener() {
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointerup", this.onPointerUp, this);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;

    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);

    if (tile === null) return;

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

    if (pointer.leftButtonDown()) {
      const index = this.frames.indexOf(this.frameName);

      if (index >= 0) {
        this._currentLayer.putTileAt(index + 1, tile.x, tile.y);
      }
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;
    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);

    if (tile === null) return;

    // 绘制矩形框，选择包含的tiles
    this.sourceTileX = tile.x;
    this.sourceTileY = tile.y;

    if (pointer.rightButtonDown()) {
      if (tile.index < 0) {
        // this._paintBrush.changeBrush(this.texture, "")
        this.frameName = "";
        this._paintBrush.hide()
        return
      }
      // 单机右键选中当前tile的画笔
      this.frameName = this.frames[tile.index - 1];
      this._paintBrush.changeBrush(this.texture, this.frames[tile.index - 1]);

      const worldPoint = new MapPosition(
        tile.x,
        tile.y,
        GameConfig.tileWidth,
        GameConfig.tileHeight
      ).getScreenPoint();

      this.sourceWorldX = worldPoint.x;
      this.sourceWorldY = worldPoint.y;
    } else {
      const index = this.frames.indexOf(this.frameName);
      if (index >= 0) {
        this._currentLayer.putTileAt(index + 1, tile.x, tile.y);
      }
      // this._currentLayer.putTilesAt([
      //   [1, 1],
      //   [1, 1]
      // ], tile.x, tile.y)
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;

    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);

    if (tile === null) return;

    const destWorldPoint = new MapPosition(
      tile.x,
      tile.y,
      GameConfig.tileWidth,
      GameConfig.tileHeight
    ).getScreenPoint();

    // create destination marker
    const destinationMarker = this.add.graphics({
      lineStyle: { width: 5, color: 0x000000, alpha: 1 },
    });
    // destinationMarker.strokeRect(this.sourceWorldX, this.sourceWorldY, )

    const width = tile.x - this.sourceTileX;
    const height = tile.y - this.sourceTileY;
    // this._currentLayer.copy(
    //   this.sourceTileX,
    //   this.sourceTileY,
    //   width,
    //   height,
    //   tile.x,
    //   tile.y
    // );

    // 右键拖拽创建自定义地块画笔
    // if (pointer.rightButtonReleased()) {
    //   this.drawQuad()
    // }
  }

  private markTiles() {}

  private drawQuad(
    p1: ScreenPoint,
    p2: ScreenPoint,
    p3: ScreenPoint,
    p4: ScreenPoint
  ) {
    const quad = this.add.graphics();

    quad.lineStyle(1, 0x000000);
    quad.moveTo(p1.x, p1.y);
    quad.lineTo(p2.x, p2.y);
    quad.lineTo(p3.x, p3.y);
    quad.lineTo(p4.x, p4.y);
  }
}
