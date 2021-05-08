import { MainSceneConfig } from "../config";
import { MainScene } from "./main-scene";
import { TilesetScene } from "./tileset-scene";

export class StartScene extends Phaser.Scene {
  create() {
    this.game.scene.add("MainScene", MainScene, true, MainSceneConfig);
    this.game.scene.add("TilesetScene", TilesetScene, true);
  }
}
