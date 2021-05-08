import "Phaser";
import { GameConfig, MainSceneConfig } from "./config";
import { MainScene } from "./scenes/main-scene";

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  const game = new Game(GameConfig);
});
