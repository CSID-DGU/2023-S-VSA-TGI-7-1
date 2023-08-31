import { Room } from "colyseus.js";


export class MachineComponent{
    private room: Room;
    private object!: Phaser.Physics.Arcade.StaticGroup;
  

    constructor(room: Room) {
        this.room = room;
        
      }

    initialize(scene: Phaser.Scene) {
        this.object = scene.physics.add.staticGroup();
    }

    getObjectGroup(): Phaser.Physics.Arcade.StaticGroup {
        return this.object;
      }


}