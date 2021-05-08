import { MainScene } from "./scenes/main-scene";
import { StartScene } from "./scenes/start-scene";
import { TilesetScene } from "./scenes/tileset-scene";

export interface SceneConfig {
  rows: number;
  cols: number;
  tileWidth: number;
  tileHeight: number;
  debug: boolean;
}

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: "Webpack-Boilerplate",
  url: "https://github.com/digitsensitive/phaser3-typescript",
  version: "2.0",
  width: 1400,
  height: 800,
  backgroundColor: 0x3a404d,
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [StartScene],
};

export const MainSceneConfig: SceneConfig = {
  rows: 20,
  cols: 20,
  tileWidth: 62,
  tileHeight: 31,
  debug: true,
};
