import { Room } from "colyseus.js";
import Phaser from "phaser";

export class CharacterComponent {
  private room: Room;
  private playerEntities: { [sessionId: string]: any } = {};
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private object!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private currentPlayer: Phaser.Physics.Arcade.Sprite;

  constructor(room: Room,cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys ) {
    this.room = room;
    this.cursorKeys= cursorKeys;
  }

  
  initialize(scene: Phaser.Scene) {
    this.room.state.players.onAdd((player, sessionId) => {
      console.log("A player has joined! Their unique session id is", sessionId);

      var isCurrentPlayer = sessionId === this.room.sessionId;

      const entity = scene.physics.add.sprite(player.x, player.y, "character",'Adam_idle_anim_21.png');
      this.playerEntities[sessionId] = entity;
      entity.anims.play('idle_down', true);
      player.animeState="idle_down";

      if(isCurrentPlayer){
        this.currentPlayer=entity;
      }

      this.object = scene.physics.add.staticGroup();
      const machine = this.object.create(200,200,'machine');
      machine.setSize(48,64);

      scene.physics.add.collider(entity,machine,()=>{
        
        
      });




      player.onChange(() => { //플레이어 이동좌표 애니메이션 갱신하는부분
        


        if(sessionId!==this.room.sessionId)
        {
          entity.x = player.x;
          entity.y = player.y;
        }

        // 움직임이 없을 때 애니메이션 중지
        if (player.velX === 0 && player.velY === 0) {
          entity.anims.stop();
        } else { // 움직임이 있을 때만 애니메이션 실행
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
    
    
    
  }

  
  update(){
   if(this.currentPlayer){
    if(this.cursorKeys.left.isDown){
      this.currentPlayer.setVelocityX(-200);
    }else if(this.cursorKeys.right.isDown){
      this.currentPlayer.setVelocityX(200);
    }else{
      this.currentPlayer.setVelocityX(0);
    }

    if(this.cursorKeys.up.isDown){
      this.currentPlayer.setVelocityY(-200);
    }else if(this.cursorKeys.down.isDown){
      this.currentPlayer.setVelocityY(200);
    }else{
      this.currentPlayer.setVelocityY(0);
    }
    
    this.room.send(1, { xc: this.currentPlayer.x, yc: this.currentPlayer.y });
   }
    
    

  }

}
