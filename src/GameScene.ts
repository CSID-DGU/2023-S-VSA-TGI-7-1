import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import png_machine from '../public/vendingmachine.png';
import png_adam from '../public/character/adam.png';
import json_adam from '../public/character/adam.json';
import { CharacterComponent } from './components/character/Character';
import { ChatComponent } from './components/chat/Chat';
import { KeyboardComponent } from './components/keyboard/Keyboard';
import { createAnimations } from './components/anims/anims';
import { MachineComponent } from './components/items/machine';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private client = new Client('ws://localhost:2567');
  private room: Room;
  private chatComponent: ChatComponent;
  private characterComponent: CharacterComponent;
  private keyboardComponent: KeyboardComponent;
  private machineComponent: MachineComponent;

  constructor() {
    super('game-scene');
  }

  preload() {
    this.load.atlas('character', png_adam, json_adam);
    this.load.spritesheet('machine', png_machine, {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  async create() {
    try {
      this.room = await this.client.joinOrCreate('my_room');
      console.log('Joined successfully!');

      createAnimations(this.anims);

      this.machineComponent = new MachineComponent(this.room);
      this.chatComponent = new ChatComponent(this.room);
      this.characterComponent = new CharacterComponent(
        this.room,
        this.input.keyboard.createCursorKeys()
      );
      this.keyboardComponent = new KeyboardComponent(
        this.room,
        this.input.keyboard.createCursorKeys()
      );

      this.chatComponent.initialize(this);
      this.characterComponent.initialize(this);
      this.machineComponent.initialize(this);
    } catch (e) {
      console.error(e);
    }
  }

  update(time: number, delta: number): void {
    if (this.keyboardComponent) {
      this.keyboardComponent.update();
    }

    if (this.characterComponent) {
      this.characterComponent.update();
    }
  }
}
