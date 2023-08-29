import Phaser from 'phaser';

export class CharacterComponent {
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  public currentPlayer: Phaser.Physics.Arcade.Sprite;
  public cameraScene: Phaser.Scene;

  constructor(cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.cursorKeys = cursorKeys;
  }

  initialize(scene: Phaser.Scene) {
    const entity = scene.physics.add.sprite(
      100,
      100,
      'character',
      'Adam_idle_anim_21.png'
    );
    this.currentPlayer = entity;
    entity.setDepth(9);
    this.cameraScene = scene;

    //타일맵구현관련
  }

  update() {
    //update안의 내용은 매프레임마다 실행됨

    if (this.currentPlayer) {
      //내플레이어 조작 구현
      this.cameraScene.cameras.main.startFollow(this.currentPlayer, true);
      if (this.cursorKeys.up.isDown && this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityY(-100);
        this.currentPlayer.anims.play('idle_right', true);
      } else if (this.cursorKeys.down.isDown && this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityY(100);
        this.currentPlayer.anims.play('idle_right', true);
      } else if (this.cursorKeys.up.isDown && this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityY(-100);
        this.currentPlayer.anims.play('idle_left', true);
      } else if (this.cursorKeys.down.isDown && this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityY(100);
        this.currentPlayer.anims.play('idle_left', true);
      } else if (this.cursorKeys.up.isDown) {
        this.currentPlayer.setVelocityY(-200);
        this.currentPlayer.anims.play('idle_up', true);
      } else if (this.cursorKeys.down.isDown) {
        this.currentPlayer.setVelocityY(200);
        this.currentPlayer.anims.play('idle_down', true);
      } else {
        this.currentPlayer.setVelocityY(0);
      }
      if (this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityX(-200);
        this.currentPlayer.anims.play('idle_left', true);
      } else if (this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityX(200);
        this.currentPlayer.anims.play('idle_right', true);
      } else {
        this.currentPlayer.setVelocityX(0);
      }
    }
  }
}
