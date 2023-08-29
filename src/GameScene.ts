import Phaser from 'phaser';
import png_adam from '../public/character/adam.png';
import json_adam from '../public/character/adam.json';
import { CharacterComponent } from './components/character/Character';
import { KeyboardComponent } from './components/keyboard/Keyboard';
import { createAnimations } from './components/anims/anims';

import png_park from '../public/tiles/Modern_Exteriors_Complete_Tileset_48x48.png';
import bench from '/public/chairs/Bench2.png';
import json_testmap from '/public/tiles/remap.json';

import hidden_coupon from '/public/HiddenEvent/coupon.html';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private characterComponent: CharacterComponent;
  private keyboardComponent: KeyboardComponent;
  public obstacles_collide_bg: Phaser.Tilemaps.TilemapLayer;
  public gd_object_layer: Phaser.Tilemaps.TilemapLayer;
  public coupon;
  public potal;
  constructor() {
    super('game-scene');
  }

  preload() {
    this.load.atlas('character', png_adam, json_adam);
    this.load.image('park', png_park);
    this.load.tilemapTiledJSON('testmap', json_testmap);
    this.load.image('bench',bench);
    this.load.html('coupon',hidden_coupon);
  }

  async create() {
    try {
      createAnimations(this.anims);
      this.characterComponent = new CharacterComponent(
        this.input.keyboard.createCursorKeys()
      );
      this.keyboardComponent = new KeyboardComponent(
        null,
        this.input.keyboard.createCursorKeys()
      );
      this.characterComponent.initialize(this);

      this.cameras.main.zoom = 1.5;

      const map = this.make.tilemap({ key: 'testmap' });
      const park = map.addTilesetImage(
        'Modern_Exteriors_Complete_Tileset_48x48',
        'park'
      );

      
      this.coupon = [
        this.physics.add.sprite(-100,-100,'bench'),
        this.physics.add.sprite(-250,-100,'bench')
      ]

      this.potal = [
        
      ]

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

      this.obstacles_collide.setCollisionByProperty({ collides: true });
      this.obstacles_collide_bg.setCollisionByProperty({ collides: true });
    } catch (e) {
      console.error(e);
    }
  }

  update(time: number, delta: number): void {
    const currentPlayer = this.characterComponent.currentPlayer;
    const checkDownKey = (key) =>
        this.input.keyboard?.checkDown(this.input.keyboard.addKey(key), 99999);

    this.physics.add.collider(currentPlayer, this.obstacles_collide);
    this.physics.add.collider(currentPlayer, this.obstacles_collide_bg);
    // 히든 쿠폰 이벤트
    this.physics.add.overlap(currentPlayer,this.coupon,()=>{
      if(checkDownKey('E')){
        // currentPlayer.setPosition(200,200);
        const element1 = this.add
        .dom(currentPlayer.x + 50,currentPlayer.y + 50)
        .createFromCache('coupon');
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '30px';
        deleteButton.style.right = '10px';
        deleteButton.style.fontSize = '20px';
        deleteButton.style.cursor = 'pointer';
        element1.node.appendChild(deleteButton)
        deleteButton.addEventListener('click',()=>{
          element1.destroy();
        })
      }
    });
    this.characterComponent.update();


  }
}
