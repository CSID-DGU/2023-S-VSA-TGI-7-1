import { Room } from 'colyseus.js';
import Phaser from 'phaser';

export class CharacterComponent {
  private room: Room;
  private playerEntities: { [sessionId: string]: any } = {};
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private object!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private currentPlayer: Phaser.Physics.Arcade.Sprite;
  public cameraScene: Phaser.Scene;

  constructor(room: Room, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.room = room;
    this.cursorKeys = cursorKeys;
  }

  initialize(scene: Phaser.Scene) {
    this.room.state.players.onAdd((player, sessionId) => {
      console.log('A player has joined! Their unique session id is', sessionId);

      var isCurrentPlayer = sessionId === this.room.sessionId;

      const entity = scene.physics.add.sprite(
        player.x,
        player.y,
        'character',
        'Adam_idle_anim_21.png'
      );
      this.playerEntities[sessionId] = entity;
      entity.anims.play('idle_down', true);
      player.animeState = 'idle_down';

      // sessionID 캐릭터 옆에 표시
      // const sessionIdText = scene.add
      //   .text(entity.x, entity.y - 30, `Session ID: ${sessionId}`, {
      //     backgroundColor: 'black',
      //     color: 'white',
      //     fontSize: '20px',
      //   })
      //   .setDepth(4);
      // entity.sessionIdText = sessionIdText;

      if (isCurrentPlayer) {
        //현재플레이어가 내플레이어일경우 currentplayer에 저장함
        this.currentPlayer = entity;
      }
      this.cameraScene = scene;

      this.object = scene.physics.add.staticGroup();
      const machine = this.object.create(200, 200, 'machine');
      machine.setSize(48, 64);

      const speechBubble = scene.add.sprite(0, 0, 'speechBubble');
      speechBubble.setVisible(false); // 일단 말풍선을 보이지 않게함
      speechBubble.setScale(90 / speechBubble.width, 90 / speechBubble.height);

      if (isCurrentPlayer) {
        scene.physics.add.collider(this.currentPlayer, objectlayer);
        scene.physics.add.collider(this.currentPlayer, tilelayer);
      }

      scene.physics.add.collider(entity, machine, () => {
        if (!entity.body.touching.none && !machine.body.touching.none) {
          // character와 machine이 접촉 중인 경우에만 실행
          speechBubble.setPosition(machine.x, machine.y - machine.height);
          speechBubble.setVisible(true); // character와 machine이 충돌할 때 말풍선 표시
          setTimeout(() => {
            speechBubble.setVisible(false);
          }, 1000);
        }
      });

      player.onChange(() => {
        //서버에서 player.x player.y등의 값이 변경될때마다 player.onChange가 호출됨

        if (sessionId !== this.room.sessionId) {
          //내플레이어가 아닌 다른플레이어들의 좌표만 업데이트함
          //내플레이어의 움직임은 update()부분에서 구현함
          entity.x = player.x;
          entity.y = player.y;
        }

        // 움직임이 없을 때 애니메이션 중지
        if (player.velX === 0 && player.velY === 0) {
          entity.anims.stop();
        } else {
          // 움직임이 있을 때만 애니메이션 실행
          entity.anims.play(player.animeState, true);
        }
      });
    });

    this.room.state.players.onRemove((player, sessionId) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    });

    //타일맵구현관련

    const map = scene.make.tilemap({ key: 'testmap' });
    const tileset1 = map.addTilesetImage('Interiors_free_32x32', 'if');
    const tileset2 = map.addTilesetImage('Room_Builder_free_32x32', 'rb');

    const tilelayer = map.createLayer('tile layer', tileset2, 0, 0);
    const objectlayer = map.createLayer('object layer', tileset1, 0, 0);

    tilelayer.setCollisionByProperty({ collides: true });
    objectlayer.setCollisionByProperty({ collides: true });
  }

  update() {
    //update안의 내용은 매프레임마다 실행됨

    if (this.currentPlayer) {
      //내플레이어 조작 구현
      this.cameraScene.cameras.main.startFollow(this.currentPlayer, true);
      if (this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityX(-200);
      } else if (this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityX(200);
      } else {
        this.currentPlayer.setVelocityX(0);
      }

      if (this.cursorKeys.up.isDown) {
        this.currentPlayer.setVelocityY(-200);
      } else if (this.cursorKeys.down.isDown) {
        this.currentPlayer.setVelocityY(200);
      } else {
        this.currentPlayer.setVelocityY(0);
      }

      // sessionID 캐릭터 옆에 표시
      // for (let sessionId in this.playerEntities) {
      //   let entity = this.playerEntities[sessionId];
      //   entity.sessionIdText.setPosition(entity.x, entity.y - 30);
      // }

      //내플레이어의 좌표정보를 서버로보냄
      this.room.send(1, { xc: this.currentPlayer.x, yc: this.currentPlayer.y });
    }
  }
}
