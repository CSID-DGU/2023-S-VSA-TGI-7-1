// DEPENDENCIES
import Phaser from "phaser";
// RUN MAIN
import { GameScene } from "./src/GameScene";
// RUN START
import { StartScene } from "./src/StartScene";

// game config
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  backgroundColor: "#343a40",
  parent: "phaser-example",
  physics: { default: "arcade" },
  pixelArt: true,
  dom: {
    createContainer: true
},
  scene: [StartScene, GameScene],
};

// instantiate the game
const game = new Phaser.Game(config);
