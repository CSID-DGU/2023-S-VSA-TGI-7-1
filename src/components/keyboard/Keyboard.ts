import Phaser from 'phaser';
import { Room } from 'colyseus.js';

export class KeyboardComponent {
  private room: Room;
  public cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
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

  //   // 대각선 움직임일 때 이동 중지
  //   const horizontalMovement = (this.cursorKeys.left.isDown ? -1 : 0) + (this.cursorKeys.right.isDown ? 1 : 0);
  // const verticalMovement = (this.cursorKeys.up.isDown ? -1 : 0) + (this.cursorKeys.down.isDown ? 1 : 0);

  // if (horizontalMovement !== 0 && verticalMovement !== 0) {
  //   this.inputPayload.left = false;
  //   this.inputPayload.right = false;
  //   this.inputPayload.up = false;
  //   this.inputPayload.down = false;
  // } else { // 대각선 움직임이 아닐 때 움직임 허용
    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
  // }

    this.room.send(0, this.inputPayload);
  }
}
