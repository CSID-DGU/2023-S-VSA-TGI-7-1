import { Room } from "colyseus.js";
import Phaser from "phaser";


export const createAnimations = (anims: Phaser.Animations.AnimationManager) => {
    const frameRate = 10;

    // 아래로 걷는 모션
    anims.create({
      key: 'idle_down',
      frames: anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 19,
        end: 24,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 왼쪽으로 걷는 모션
    anims.create({
      key: 'idle_left',
      frames: anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 13,
        end: 18,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });

    // 오른쪽으로 걷는 모션
    anims.create({
      key: 'idle_right',
      frames: anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 1,
        end: 6,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });
    
    // 위로 걷는 모션
    anims.create({
      key: 'idle_up',
      frames: anims.generateFrameNames('character', {
        prefix: 'Adam_idle_anim_',
        start: 7,
        end: 12,
        zeroPad: 0,
        suffix: '.png',
      }),
      frameRate,
      repeat: -1,
    });













}