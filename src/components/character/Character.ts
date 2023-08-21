import { Room } from 'colyseus.js';
import Phaser from 'phaser';

export class CharacterComponent {
  private room: Room;
  private playerEntities: { [sessionId: string]: any } = {};
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private object!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  public currentPlayer: Phaser.Physics.Arcade.Sprite;
  public cameraScene: Phaser.Scene;
  public containerBody: Phaser.Physics.Arcade.Body;
  public userId: String;

  constructor(room: Room, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys, userId: String) {
    this.room = room;
    this.cursorKeys = cursorKeys;
    this.userId = userId;
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

      if (isCurrentPlayer) {
        //현재플레이어가 내플레이어일경우 currentplayer에 저장함
        this.currentPlayer = entity;
      }
      this.cameraScene = scene;

      console.log("현재이름"+player.name);
      // sessionID 캐릭터 옆에 표시
      if (sessionId !== this.room.sessionId) {
        const sessionIdText = scene.add
          .text(entity.x - 60, entity.y - 60, `${player.name} `, {
            color: '#3F2305',
            fontSize: '17px',
            fontFamily: 'Tektur',
            backgroundColor: '#F2EAD3',
          })
          .setDepth(4);
          sessionIdText.setOrigin(0.5,0);

        if(sessionIdText.text==="null"){
          setTimeout(()=>{
            sessionIdText.text=player.name;
          },1000)
        }
        entity.sessionIdText = sessionIdText;
        
      } else {
        const currentText = scene.add.container(entity.x , entity.y - 60);
        const sessionIdText = scene.add
          .text(0, 0, `${this.userId} `, {
            backgroundColor: 'transparent',
            fontFamily: 'Tektur',
            color: '#F7E987',
            fontSize: '20px',
            padding: { y: 2 },
            stroke: '#000', // 테두리 색상
            strokeThickness: 6, // 테두리 두께
          })
          .setDepth(4);
          sessionIdText.setOrigin(0.5,0);
        this.currentPlayer.sessionIdText = sessionIdText;
        currentText.add(sessionIdText);
        scene.physics.world.enable(currentText);
        this.containerBody = currentText.body as Phaser.Physics.Arcade.Body;
      }

      console.log("현재이름"+player.name);
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
        const sessionIdText = entity.sessionIdText;
        if (sessionIdText) {
          sessionIdText.destroy(); // 아이디 텍스트도 제거
        }
      }
    });

    //타일맵구현관련
  }

  update() {
    //update안의 내용은 매프레임마다 실행됨

    if (this.currentPlayer) {
      //내플레이어 조작 구현
      this.cameraScene.cameras.main.startFollow(this.currentPlayer, true);
      if (this.cursorKeys.left.isDown) {
        this.currentPlayer.setVelocityX(-200);
        this.containerBody.setVelocityX(-200);
      } else if (this.cursorKeys.right.isDown) {
        this.currentPlayer.setVelocityX(200);
        this.containerBody.setVelocityX(200);
      } else {
        this.currentPlayer.setVelocityX(0);
        this.containerBody.setVelocityX(0);
      }

      if (this.cursorKeys.up.isDown) {
        this.currentPlayer.setVelocityY(-200);
        this.containerBody.setVelocityY(-200);
      } else if (this.cursorKeys.down.isDown) {
        this.currentPlayer.setVelocityY(200);
        this.containerBody.setVelocityY(200);
      } else {
        this.currentPlayer.setVelocityY(0);
        this.containerBody.setVelocityY(0);
      }
      // containerBody의 위치를 현재 플레이어의 위치로 업데이트
      this.containerBody.x = this.currentPlayer.x;
      this.containerBody.y = this.currentPlayer.y-60;

      // sessionID 캐릭터 옆에 표시

      for (let sessionId in this.playerEntities) {
        if (sessionId !== this.room.sessionId) {
          let entity = this.playerEntities[sessionId];
          entity.sessionIdText.setPosition(entity.x, entity.y - 50);
        }
      }

      //내플레이어의 좌표정보를 서버로보냄
      this.room.send(1, { xc: this.currentPlayer.x, yc: this.currentPlayer.y });
    }
  }
}
