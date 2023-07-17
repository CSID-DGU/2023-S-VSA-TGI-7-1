import { Room } from "colyseus.js";
import Phaser from "phaser";

export class CharacterComponent {
  private room: Room;
  private playerEntities: { [sessionId: string]: any } = {};
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private object!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;

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

      this.object = scene.physics.add.staticGroup();
      const machine = this.object.create(200,200,'machine');
      machine.setSize(48,64);

      scene.physics.add.collider(entity,machine,()=>{
        console.log("working");
        
      });


      player.onChange(() => { //플레이어 이동좌표 애니메이션 갱신하는부분
        
        
        entity.x = player.x;
        entity.y = player.y;

        
        entity.anims.play(player.animeState,true);
        console.log(sessionId)
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
   


  }

}
