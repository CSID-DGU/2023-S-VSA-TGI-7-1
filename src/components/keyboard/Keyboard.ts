import Phaser from "phaser";
import { Room } from "colyseus.js";


export class KeyboardComponent {
 
  private room: Room;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor(room: Room, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.room = room;
    this.cursorKeys = cursorKeys;
  
  }

  update() {
    if (!this.room) {
      return;
    }
    


    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
    


    this.room.send(0, this.inputPayload);
  }
}
