import Phaser from 'phaser';

export class KeyboardComponent {
  public cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor(cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.cursorKeys = cursorKeys;
  }

  update() {
    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
  }
}
