import Phaser from "phaser";
import { GameScene } from "./src/GameScene";
// game config
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  backgroundColor: "#b6d53c",
  parent: "phaser-example",
  physics: { default: "arcade" },
  pixelArt: true,
  scene: [GameScene],
};

// instantiate the game
const game = new Phaser.Game(config);
