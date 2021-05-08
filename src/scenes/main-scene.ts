import { MainSceneConfig, SceneConfig } from "../config";
import { Circle } from "../objects/circle";
import { GridLayer, MapPosition, ScreenPoint } from "../objects/gridlayer";
import { PaintBrush } from "../objects/paintbrush";
import { Redhat } from "../objects/redhat";

export class MainScene extends Phaser.Scene {
  protected sceneConfig: SceneConfig; // 场景配置
  private _map: Phaser.Tilemaps.Tilemap; // 初始化地图
  private _currentLayer: Phaser.Tilemaps.TilemapLayer; // 当前图层
  private _gridLayer: GridLayer; // 线框层
  private _paintBrush: PaintBrush; // 画笔
  private _controls: Phaser.Cameras.Controls.SmoothedKeyControl; // 键盘控制

  private frames: string[]; // texture frames
  private blankMapName = "blank-map";
  private tilesetName = "ground";
  private frameName = "ground1.png";
  private brushSprite: Phaser.GameObjects.Sprite; // 自定义画笔Sprite

  // private destinationMarker: Phaser.GameObjects.Graphics;

  private startTile: Phaser.Tilemaps.Tile;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.tilemapTiledJSON("blank-map", "../assets/blank-map.json");
    this.load.atlas("ground", "../assets/ground.png", "../assets/ground.json");
  }

  create(): void {
    console.log(">> main scene create");
    this.sceneConfig = <SceneConfig>this.scene.settings.data;
    // 禁用鼠标右键默认事件
    this.input.mouse.disableContextMenu();
    // 初始化地图
    this.initMapData();
    // 初始化线框层
    this.initGridLayer();
    // 将camera位置调整到map中心
    this.centerCamera();
    // 初始化 tileset 笔刷信息
    this.initFrames();
    // this.initTileSelector();
    // 初始化画笔工具
    this.initPaintBrush();
    // 绑定监听事件
    this.addListener();
    // 初始化键盘控制
    this.initKeyboardControl();

    this.scene.launch("TilesetScene");
  }

  update(time: number, delta: number) {
    this._controls.update(delta);
  }

  private initMapData() {
    this._map = this.add.tilemap(this.blankMapName);

    const ground = this._map.addTilesetImage("ground", "ground");
    this._currentLayer = this._map.createLayer("ground-layer", [ground]);
  }

  private initGridLayer() {
    this._gridLayer = new GridLayer(this);

    const { rows, cols, tileWidth, tileHeight } = this.sceneConfig;

    this._gridLayer.draw({
      rows,
      cols,
      tileWidth,
      tileHeight,
    });
  }

  private centerCamera() {
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    this.cameras.main.scrollX = -width / 2;
    this.cameras.main.scrollY =
      -(height - this.sceneConfig.tileHeight * this.sceneConfig.cols) / 2;
  }

  private initFrames() {
    const atlasTexture = this.textures.get("ground");

    const frames = atlasTexture.getFrameNames();
    this.frames = frames;
  }

  private initPaintBrush() {
    this._paintBrush = new PaintBrush(
      this,
      this.sceneConfig.tileWidth,
      this.sceneConfig.tileHeight,
      this.tilesetName,
      this.frameName
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

  // private initTileSelector() {
  //   const tileSelector = this.add.group();

  //   const tileSelectorBackground = this.add.graphics();

  //   tileSelector.add(tileSelectorBackground);

  //   const tileStrip = tileSelector.create(1, 1, "ground");
  //   tileStrip.inputEnabled = true;
  // }

  private addListener() {
    this.input.on("pointermove", this.onPointerMove, this);
    this.input.on("pointerdown", this.onPointerDown, this);
    this.input.on("pointerup", this.onPointerUp, this);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;

    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);

    if (tile === null) return;

    const pos = new MapPosition(
      tile.x,
      tile.y,
      this.sceneConfig.tileWidth,
      this.sceneConfig.tileHeight
    );

    this._paintBrush.update(pos.getScreenPoint().x, pos.getScreenPoint().y);

    if (pointer.leftButtonDown()) {
      if (this.frameName) {
        const index = this.frames.indexOf(this.frameName);

        if (index >= 0) {
          this._currentLayer.putTileAt(index + 1, tile.x, tile.y);
        }
      }

      if (this._paintBrush.spriteContainer.getAll().length > 0) {
        this.fillTiles(
          tile.x,
          tile.y,
          this._paintBrush.width,
          this._paintBrush.height
        );
      }
    }

    // 按住鼠标右键拖动，创建选择区域，更改brush container size
    if (pointer.rightButtonDown()) {
      this._paintBrush.toggleTakingBrush(true);
      this._paintBrush.updateBrushContainerSize(this.startTile, tile);
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;
    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);
    if (tile === null) return;

    if (
      this._paintBrush.spriteContainer.getAll().length > 0 &&
      pointer.leftButtonDown()
    ) {
      this.fillTiles(
        tile.x,
        tile.y,
        this._paintBrush.width,
        this._paintBrush.height
      );
    }

    if (pointer.rightButtonDown()) {
      // 开始创建选择区域，记录初始点
      this.startTile = tile;
      this._paintBrush.toggleTakingBrush(true);
      this._paintBrush.destroySpriteContainer();
      this._paintBrush.updateBrushContainerSize(tile, tile);

      if (tile.index < 0) {
        this.frameName = "";
        this._paintBrush.hide();
      } else {
        // 单机右键选中当前tile的画笔
        this.frameName = this.frames[tile.index - 1];
        this._paintBrush.changeBrush(
          this.tilesetName,
          this.frames[tile.index - 1]
        );
      }
    } else {
      const index = this.frames.indexOf(this.frameName);
      if (index >= 0) {
        this._currentLayer.putTileAt(index + 1, tile.x, tile.y);
      }
    }
  }

  private fillTiles(
    startTileX: number,
    startTileY: number,
    width: number,
    height: number
  ) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const mapTileX = startTileX + i;
        const mapTileY = startTileY + j;
        const idx = this._paintBrush.brushTilesArray[i][j];
        if (idx > 0) {
          this._currentLayer.putTileAt(idx, mapTileX, mapTileY);
        }
      }
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    const { worldX, worldY } = pointer;

    const tile = this._currentLayer.getTileAtWorldXY(worldX, worldY, true);

    if (tile === null) return;

    if (pointer.rightButtonReleased()) {
      this._paintBrush.toggleTakingBrush(false);

      const mapPos = new MapPosition(
        tile.x,
        tile.y,
        this.sceneConfig.tileWidth,
        this.sceneConfig.tileHeight
      );

      const positioins = mapPos.getPoint4Positions();

      // 标记鼠标释放时的tile坐标
      // new Circle(this).draw(positioins.top.x, positioins.top.y);

      this._paintBrush.update(positioins.top.x, positioins.top.y);

      // generate sprite from tilemap
      const tiles = this.getTiles(this.startTile, tile);
      const sprites = this.tileAreaToSprites(tiles, {}, this._currentLayer);
      // sprites.forEach((sprite, i) => {
      //   sprite.setOrigin(0, 0);
      // });
      this._paintBrush.setCustomBrush(sprites);

      // make sure sprite follow the brush

      // record the source tiles
      this._paintBrush.setBrushTilesArray(
        tiles,
        this._paintBrush.width,
        this._paintBrush.height
      );
    }
  }

  private getTiles(
    startTile: Phaser.Tilemaps.Tile,
    endTile: Phaser.Tilemaps.Tile
  ) {
    const startX = startTile.x;
    const startY = startTile.y;
    const endX = endTile.x;
    const endY = endTile.y;

    let tiles = [];

    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        tiles.push(this._currentLayer.getTileAt(i, j));
      }
    }

    return tiles;
  }

  private tileAreaToSprites(
    tiles: Phaser.Tilemaps.Tile[],
    spriteConfig: any = {},
    layer: Phaser.Tilemaps.TilemapLayer
  ) {
    if (this.brushSprite) {
      this.brushSprite.destroy();
    }
    let tilemapLayer = layer;
    let scene = tilemapLayer.scene;

    // const indexes = tiles.map((tile) => tile && tile.index);

    // return layer.createFromTiles(indexes, indexes, spriteConfig);

    let sprites = [];
    const offsetX = this.startTile.pixelX;
    const offsetY = this.startTile.pixelY;

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];

      if (tile && tile.index !== -1) {
        spriteConfig.x = tile.pixelX - offsetX;
        spriteConfig.y = tile.pixelY - offsetY + tile.height / 2;

        spriteConfig.key = this.tilesetName;
        spriteConfig.frame = this.frames[tile.index - 1];

        this.brushSprite = scene.make.sprite(spriteConfig);
        sprites.push(this.brushSprite);
      }
    }

    return sprites;
  }
}
