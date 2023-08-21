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

import png_Bench_Large from '../public/chairs/Bench_Large.png';
import png_Bench_Small from '../public/chairs/Bench_Small.png';
import png_Bench2 from '../public/chairs/Bench2.png';
import png_Bench3_Left from '../public/chairs/Bench3_Left.png';
import png_Bench3_Right from '../public/chairs/Bench3_Right.png';
import png_Sunbed from '../public/chairs/Sunbed.png';

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
  public chair: Phaser.Tilemaps.TilemapLayer;
  public userId: string;
  public chairsgroup;
  private sittinganims = {
    Camping_Bench1: false,
    Camping_Bench3: false,
    City_Bench2: false,
    City_Bench3_left: false,
    City_Bench3_right: false,
    Sunbed: false,
    sitCount: 0,
    OutofChair: false,
  };
  public chair_index;
  private previousPlayerPosition = { x: 0, y: 0 };

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
    this.load.spritesheet('Camping_Bench1', png_Bench_Small, {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('Camping_Bench3', png_Bench_Large, {
      frameWidth: 144,
      frameHeight: 96,
    });
    this.load.spritesheet('City_Bench2', png_Bench2, {
      frameWidth: 144,
      frameHeight: 96,
    });
    this.load.spritesheet('City_Bench3_left', png_Bench3_Left, {
      frameWidth: 96,
      frameHeight: 48,
    });
    this.load.spritesheet('City_Bench3_right', png_Bench3_Right, {
      frameWidth: 96,
      frameHeight: 48,
    });
    this.load.spritesheet('Sunbed', png_Sunbed, {
      frameWidth: 96,
      frameHeight: 96,
    });
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

      this.cameras.main.zoom = 1.5;

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

      //Object layers
      const Camping_Bench1 = map.getObjectLayer('Camping_Bench1');
      const Camping_Bench3 = map.getObjectLayer('Camping_Bench3');
      const City_Bench2 = map.getObjectLayer('City_Bench2');
      const City_Bench3_left = map.getObjectLayer('City_Bench3_left');
      const City_Bench3_right = map.getObjectLayer('City_Bench3_right');
      const Sunbed = map.getObjectLayer('Sunbed');

      this.chairsgroup = this.physics.add.group({
        immovable: true,
        allowGravity: false,
      });

      const benchConfigs = [
        { key: 'Camping_Bench1', objects: Camping_Bench1.objects },
        { key: 'Camping_Bench3', objects: Camping_Bench3.objects },
        { key: 'City_Bench2', objects: City_Bench2.objects },
        { key: 'City_Bench3_left', objects: City_Bench3_left.objects },
        { key: 'City_Bench3_right', objects: City_Bench3_right.objects },
        { key: 'Sunbed', objects: Sunbed.objects }
      ];
      
      benchConfigs.forEach(config => {
        config.objects.forEach(object => {
          const obj = this.chairsgroup.create(object.x, object.y, config.key);
          obj.name = config.key;
          obj.setDepth(7);
        });
      });
      
      const layers = [
        path_bg,
        path_fg,
        ground,
        obstacles_not_collide,
        this.obstacles_collide_bg,
        this.obstacles_collide,
        this.chair,
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
          obstacles_not_collide: 21,
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

    if (this.characterComponent && this.characterComponent.currentPlayer) {
      const currentPlayer = this.characterComponent.currentPlayer;
      const chairsgroup = this.chairsgroup.children.entries;
      const keyinput = this.keyboardComponent.cursorKeys;
      const checkSittingKey = (key) =>
        this.input.keyboard?.checkDown(this.input.keyboard.addKey(key), 99999);

      this.physics.add.collider(currentPlayer, this.obstacles_collide);
      this.physics.add.collider(currentPlayer, this.obstacles_collide_bg);
      this.physics.add.collider(currentPlayer, this.chair);

      for (let i = 0; i < chairsgroup.length; i++) {
        this.physics.add.collider(
          currentPlayer,
          chairsgroup[i],
          () => this.CollisionWithChair(i),
          null,
          this
        );
      }
      if (this.sittinganims.OutofChair) {
        currentPlayer.anims.play('idle_down', true);
        this.room.send(0, 'outofchair');
        if (
          keyinput.down.isDown ||
          keyinput.up.isDown ||
          keyinput.left.isDown ||
          keyinput.right.isDown
        ) {
          this.sittinganims.OutofChair = false;
        }
      }

      if (this.sittinganims.sitCount % 2 === 1) {
        this.DisableCursorKeys();
        if (checkSittingKey('E')) {
          this.sittinganims.sitCount += 1;
          this.EnableCursorKeys();
          this.EscapeChair();
          this.DisableSittingAnims();
        }
      } else if (this.sittinganims.Camping_Bench1 && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          chairsgroup[this.chair_index].x + 30,
          currentPlayer.y
        );
        this.sitOnChair(currentPlayer, 'sit_left', 'left');
      } else if (this.sittinganims.Camping_Bench3 && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          currentPlayer.x,
          chairsgroup[this.chair_index].y + 15
        );
        this.sitOnChair(currentPlayer, 'sit_up', 'up');
      } else if (this.sittinganims.City_Bench2 && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          currentPlayer.x,
          chairsgroup[this.chair_index].y + 15
        );
        this.sitOnChair(currentPlayer, 'sit_down', 'down');
      } else if (this.sittinganims.City_Bench3_left && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          chairsgroup[this.chair_index].x - 5,
          chairsgroup[this.chair_index].y + 10
        );
        this.sitOnChair(currentPlayer, 'sit_left', 'left');
      } else if (this.sittinganims.City_Bench3_right && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          chairsgroup[this.chair_index].x + 5,
          chairsgroup[this.chair_index].y + 10
        );
        this.sitOnChair(currentPlayer, 'sit_right', 'right');
      } else if (this.sittinganims.Sunbed && checkSittingKey('E')) {
        this.PrevPosition();
        currentPlayer.setPosition(
          chairsgroup[this.chair_index].x,
          chairsgroup[this.chair_index].y
        );
        this.sitOnChair(currentPlayer, 'sit_left', 'left');
      }

      this.characterComponent.update();
    }
  }

  sitOnChair(player, animName, roomDirection) {
    player.anims.play(animName, true);
    this.room.send(0, roomDirection);
    this.sittinganims.sitCount += 1;
  }
  CollisionWithChair(i) {
    const chair = this.chairsgroup.children.entries[i].name;
    (this.sittinganims.Camping_Bench1 = false),
      (this.sittinganims.Camping_Bench3 = false),
      (this.sittinganims.City_Bench2 = false),
      (this.sittinganims.City_Bench3_left = false),
      (this.sittinganims.City_Bench3_right = false),
      (this.sittinganims.Sunbed = false),
      (this.sittinganims[chair] = true);
    this.chair_index = i;
  }

  DisableCursorKeys() {
    this.keyboardComponent.cursorKeys.up.enabled = false;
    this.keyboardComponent.cursorKeys.down.enabled = false;
    this.keyboardComponent.cursorKeys.left.enabled = false;
    this.keyboardComponent.cursorKeys.right.enabled = false;
  }
  DisableSittingAnims() {
    this.sittinganims.Camping_Bench1 = false;
    this.sittinganims.Camping_Bench3 = false;
    this.sittinganims.City_Bench2 = false;
    this.sittinganims.City_Bench3_left = false;
    this.sittinganims.City_Bench3_right = false;
    this.sittinganims.Sunbed = false;
  }
  EnableCursorKeys() {
    this.keyboardComponent.cursorKeys.up.enabled = true;
    this.keyboardComponent.cursorKeys.down.enabled = true;
    this.keyboardComponent.cursorKeys.left.enabled = true;
    this.keyboardComponent.cursorKeys.right.enabled = true;
  }
  PrevPosition() {
    this.previousPlayerPosition = {
      x: this.characterComponent.currentPlayer.x,
      y: this.characterComponent.currentPlayer.y,
    };
  }
  EscapeChair() {
    this.characterComponent.currentPlayer.setPosition(
      this.previousPlayerPosition.x,
      this.previousPlayerPosition.y
    );
    this.sittinganims.OutofChair = true;
  }
}
