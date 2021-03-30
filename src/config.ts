import { MainScene } from "./scenes/main-scene";

export interface ExtraGameConfig {
  rows: number;
  cols: number;
  tileWidth: number;
  tileHeight: number;
  debug: boolean;
}

export const GameConfig: Phaser.Types.Core.GameConfig & ExtraGameConfig = {
  title: "Webpack-Boilerplate",
  url: "https://github.com/digitsensitive/phaser3-typescript",
  version: "2.0",
  width: 800,
  height: 600,
  rows: 20,
  cols: 20,
  tileWidth: 62,
  tileHeight: 31,
  debug: false,
  backgroundColor: 0x3a404d,
  type: Phaser.AUTO,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [MainScene],
};
