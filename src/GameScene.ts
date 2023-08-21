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
import png_bubble from '/public/speechBubble.png';

import png_park from '../public/tiles/Modern_Exteriors_Complete_Tileset_48x48.png';

import json_testmap from '/public/tiles/remap.json';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private client = new Client('ws://localhost:2567');
  private room: Room;
  private chatComponent: ChatComponent;
  private characterComponent: CharacterComponent;
  private keyboardComponent: KeyboardComponent;
  private machineComponent: MachineComponent;
  public obstacles_collide_bg: Phaser.Tilemaps.TilemapLayer;
  public gd_object_layer: Phaser.Tilemaps.TilemapLayer;
  public userId: string;

  init(data) {
    this.userId = data.userInput;
  }

  constructor() {
    super('game-scene');
  }

  preload() {
    this.load.atlas('character', png_adam, json_adam);
    this.load.spritesheet('machine', png_machine, {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image('speechBubble', png_bubble);
    this.load.image('park', png_park);
    this.load.tilemapTiledJSON('testmap', json_testmap);
  }

  async create() {
    // 채팅 컨테이너를 보이게 하는 코드를 추가합니다.
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.style.display = 'block';
    }
    try {
      this.room = await this.client.joinOrCreate('my_room');
      this.room.send(2, { name: this.userId });
      console.log('Joined successfully!');
      createAnimations(this.anims);

      this.machineComponent = new MachineComponent(this.room);
      this.chatComponent = new ChatComponent(this.room);
      this.characterComponent = new CharacterComponent(
        this.room,
        this.input.keyboard.createCursorKeys(),
        this.userId
      );
      this.keyboardComponent = new KeyboardComponent(
        this.room,
        this.input.keyboard.createCursorKeys()
      );

      this.chatComponent.initialize(this);
      this.characterComponent.initialize(this);
      this.machineComponent.initialize(this);

      this.cameras.main.zoom = 1.2;

      const map = this.make.tilemap({ key: 'testmap' });
      const park = map.addTilesetImage(
        'Modern_Exteriors_Complete_Tileset_48x48',
        'park'
      );

      const ground = map.createLayer('ground', park, 0, 0);
      const obstacles_not_collide = map.createLayer(
        'obstacles_not_collide',
        park,
        0,
        0
      );
      const path_fg = map.createLayer('path_fg', park, 0, 0);
      const path_bg = map.createLayer('path_bg', park, 0, 0);
      this.obstacles_collide = map.createLayer('obstacles_collide', park, 0, 0);
      this.obstacles_collide_bg = map.createLayer(
        'obstacles_collide_bg',
        park,
        0,
        0
      );
      this.chair = map.createLayer('chair', park, 0, 0);

      this.obstacles_collide.setCollisionByProperty({ collides: true });
      this.obstacles_collide_bg.setCollisionByProperty({ collides: true });
      this.chair.setCollisionByProperty({ collides: true });
      this.chair.setDepth(7);

      const layers = [
        path_bg,
        path_fg,
        ground,
        obstacles_not_collide,
        this.obstacles_collide_bg,
        this.obstacles_collide,
      ];

      layers.forEach((layer) => {
        const layerDepth = getLayerDepth(layer);
        layer.setDepth(layerDepth);
        console.log(`Layer '${layer.layer.name}' depth: ${layerDepth}`);
      });

      function getLayerDepth(layer) {
        const layerDepthMap = {
          ground: 1,
          path_fg: 3,
          path_bg: 2,
          obstacles_collide_bg: 4,
          obstacles_collide: 5,
          obstacles_not_collide: 6,
          chair: 7,
        };

        return layerDepthMap[layer.layer.name] || 0;
      }
    } catch (e) {
      console.error(e);
    }
  }

  update(time: number, delta: number): void {
    if (this.keyboardComponent) {
      this.keyboardComponent.update();
    }

    if (this.characterComponent) {
      if (this.characterComponent.currentPlayer) {
        this.physics.add.collider(
          this.characterComponent.currentPlayer,
          this.obstacles_collide
        );
        this.physics.add.collider(
          this.characterComponent.currentPlayer,
          this.obstacles_collide_bg
        );
        this.physics.add.collider(
          this.characterComponent.currentPlayer,
          this.chair
        );
      }
      this.characterComponent.update();
    }
  }
}
