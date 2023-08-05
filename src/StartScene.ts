// StartScene.ts
import Phaser from 'phaser';
import cloud_day from '/public/background/cloud_day.png';
import backdrop_day from '/public/background/backdrop_day.png';
import cloud_night from '/public/background/cloud_night.png';
import backdrop_night from '/public/background/backdrop_night.png';
import sun_moon from '/public/background/sun_moon.png';
import sun from '/public/background/sun.png';
import toggle_icon from '/public/background/toggle_icon.png';
import start_button from '/public/background/start_button.png';

export class StartScene extends Phaser.Scene {
  private cloud!: Phaser.Physics.Arcade.Group;
  private cloudKey!: string;
  private backdropKey!: string;
  private sun!: Phaser.Physics.Arcade.Group;
  constructor() {
    super('start-scene');
  }
  preload() {
    this.cloudKey = 'cloud_night'; // or 'cloud_night' depending on the scenario
    this.backdropKey = 'backdrop_night'; // or 'backdrop_night' depending on the scenario

    // Load the cloud asset (adjust the cloudKey according to your asset)
    this.load.image('cloud_day', cloud_day);
    this.load.image('backdrop_day', backdrop_day);
    this.load.image('sun_moon', sun_moon);
    this.load.image('cloud_night', cloud_night);
    this.load.image('backdrop_night', backdrop_night);
    this.load.image('sun', sun);
    this.load.image('toggle_icon', toggle_icon);
    this.load.image('start_button', start_button);
  }
  create() {
    // Get the initial background mode from the userSlice
    const sceneHeight = this.cameras.main.height;
    const sceneWidth = this.cameras.main.width;
    // Add backdrop image
    const backdropImage = this.add.image(
      sceneWidth / 2,
      sceneHeight / 2,
      this.backdropKey
    );
    const scale = Math.max(
      sceneWidth / backdropImage.width,
      sceneHeight / backdropImage.height
    );
    backdropImage.setScale(scale).setScrollFactor(0);

    // Add sun or moon image
    const sunMoonImage = this.add.image(
      sceneWidth / 2,
      sceneHeight / 2,
      'sun_moon'
    );
    const scale2 = Math.max(
      sceneWidth / sunMoonImage.width,
      sceneHeight / sunMoonImage.height
    );
    sunMoonImage.setScale(scale2).setScrollFactor(0);

    // Add 24 clouds at random positions and with random speeds
    const frames = this.textures.get(this.cloudKey).getFrameNames();
    this.cloud = this.physics.add.group();
    for (let i = 0; i < 24; i++) {
      const x = Phaser.Math.RND.between(-sceneWidth * 0.5, sceneWidth * 1.5);
      const y = Phaser.Math.RND.between(sceneHeight * 0.2, sceneHeight * 0.8);
      const velocity = Phaser.Math.RND.between(15, 30);

      this.cloud
        .get(x, y, this.cloudKey, frames[i % 6])
        .setScale(3)
        .setVelocity(velocity, 0);
    }
    // Add a title text
    const titleText = this.add
      .text(this.cameras.main.centerX, 100, 'Welcome to Our Platform', {
        fontSize: '54px',
        fill: '#ffffff',
        fontFamily: 'Tektur',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 6); // 검정 테두리 추가
    // Center the title text horizontally
    titleText.setX(this.cameras.main.centerX);

    // Move the title text up
    titleText.setY(220);
    // Add other decorative text or images if needed
    const descriptionText = this.add
      .text(this.cameras.main.centerX, 200, 'Join the adventure!', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Tektur',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 4); // 검정 테두리 추가
    // Center the description text horizontally
    descriptionText.setX(this.cameras.main.centerX);

    // Move the description text down
    descriptionText.setY(300);

    // Toggle button for changing background
    const toggleBackdropButton = this.add
      .image(this.cameras.main.width - 50, 50, 'toggle_icon') // 토글 아이콘 이미지를 사용
      .setScrollFactor(0)
      .setInteractive();


      
    toggleBackdropButton.on('pointerdown', () => {
      if (this.backdropKey === 'backdrop_day') {
        this.backdropKey = 'backdrop_night';
        this.cloudKey = 'cloud_night';
      } else {
        this.backdropKey = 'backdrop_day';
        this.cloudKey = 'cloud_day';
      }
      this.changeBackground();
      this.changeClouds();

      // 요소들을 앞으로 가져오기
      this.children.bringToTop(titleText);
      this.children.bringToTop(descriptionText);
      this.children.bringToTop(startButton);
     /*  this.children.bringToTop(loginButton); */
      this.children.bringToTop(toggleBackdropButton);
    });
    // 토글 버튼에 마우스 호버 효과 추가
    toggleBackdropButton.on('pointerover', () => {
      toggleBackdropButton.setScale(1.2); // 버튼 크기를 확대
      this.input.setDefaultCursor('pointer');
    });

    toggleBackdropButton.on('pointerout', () => {
      toggleBackdropButton.setScale(1); // 원래 크기로 복원
      this.input.setDefaultCursor('auto');
    });

    // 이미지로 대체된 startButton
const startButton = this.add
.image(this.cameras.main.centerX, 450, 'start_button') // 이미지 이름을 사용
.setOrigin(0.5)
.setInteractive()
.setDepth(1) // 이미지가 클라우드보다 위에 표시되도록 설정


// 호버 효과
startButton.on('pointerover', () => {
startButton.setScale(1.1);
startButton.setTint(0xffaa00); // 틴트(색상 변화) 효과 추가
this.input.setDefaultCursor('pointer');
});

startButton.on('pointerout', () => {
startButton.setScale(1);
startButton.setTint(0xffffff); // 원래 틴트 복원
this.input.setDefaultCursor('auto');
});

startButton.on('pointerdown', () => {
this.scene.start('game-scene');
});

// 애니메이션 효과
this.tweens.add({
targets: startButton,
scaleX: 1.1,
scaleY: 1.1,
duration: 1000,
yoyo: true,
repeat: -1,
});

    // 로그인 버튼 추가시 주석 해제

    /* const loginButton = this.add
      .text(this.cameras.main.centerX, 400, 'Login', {
        fontSize: '32px',
        fontFamily: 'Tektur',
        fill: '#ffffff',
        backgroundColor: '#27ae60',
        padding: {
          left: 20,
          right: 20,
          top: 10,
          bottom: 10,
        },
        borderRadius: 10,
      })
      .setOrigin(0.5)
      .setInteractive()
      .setStroke('#000000', 2); // 검정 테두리 추가
    // Center the login button horizontally
    loginButton.setX(this.cameras.main.centerX);

    // Move the login button down
    loginButton.setY(520);
    // Add hover effect
    // 그림자 효과 추가
    loginButton.setShadow(3, 3, '#000000', 5, true, true);

    // 호버 효과 개선
    loginButton.on('pointerover', () => {
      loginButton.setScale(1.1); // 버튼 크기를 1.1배로 확대
      loginButton.setBackgroundColor('#2ecc71');
      loginButton.setColor('#ffffff'); // 텍스트 색상 변경
      loginButton.setStroke('#ffffff', 2); // 텍스트 테두리 추가
      // 호버 시 커서 모양 바꾸기
      this.input.setDefaultCursor('pointer');
    });

    loginButton.on('pointerout', () => {
      loginButton.setScale(1); // 원래 크기로 복원
      loginButton.setBackgroundColor('#27ae60');
      loginButton.setColor('#ffffff');
      loginButton.setStroke('#ffffff', 0); // 텍스트 테두리 제거
      // 커서 모양 원래대로 복원
      this.input.setDefaultCursor('auto');
    });

    // Add click animation
    loginButton.on('pointerdown', () => {
      // Transition to the login page scene.
      // You would need to create a new scene for the login page and change the scene key accordingly.
      this.scene.start('login-page');
    });
    this.tweens.add({
      targets: loginButton,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
    }); */
    // Bring the elements to the front so they appear above the cloud image
    this.add.existing(titleText);
    this.children.bringToTop(titleText);
    this.add.existing(descriptionText);
    this.children.bringToTop(descriptionText);
    this.add.existing(startButton);
    this.children.bringToTop(startButton);
    /* this.add.existing(loginButton);
    this.children.bringToTop(loginButton); */
  }
  update(t: number, dt: number) {
    this.physics.world.wrap(this.cloud, 500);
  }

  private changeBackground() {
    const sceneHeight = this.cameras.main.height;
    const sceneWidth = this.cameras.main.width;

    // Remove the existing backdrop image
    const existingBackdropImage = this.children.getByName('backdropImage');
    if (existingBackdropImage) {
      existingBackdropImage.destroy();
    }

    // Add the new backdrop image
    const newBackdropImage = this.add
      .image(sceneWidth / 2, sceneHeight / 2, this.backdropKey)
      .setName('backdropImage'); // Assign a name to the image for identification
    newBackdropImage
      .setOrigin(0.5)
      .setDisplaySize(sceneWidth, sceneHeight)
      .setScrollFactor(0);

    // Remove or hide sun image when changing to night backdrop
    const existingSunImage = this.children.getByName('sunImage');
    if (this.backdropKey === 'backdrop_night') {
      if (existingSunImage) {
        existingSunImage.destroy();
      }
    } else {
      // Add sun image when changing to day backdrop
      if (!existingSunImage) {
        const sunImage = this.add
          .image(sceneWidth / 2, sceneHeight / 2, 'sun')
          .setName('sunImage');
        const scale1 = Math.max(
          sceneWidth / sunImage.width,
          sceneHeight / sunImage.height
        );
        sunImage.setScale(scale1).setScrollFactor(0);
      }
    }
  }

  private changeClouds() {
    // Clear existing clouds
    this.cloud.clear(true, true);

    const sceneHeight = this.cameras.main.height;
    const sceneWidth = this.cameras.main.width;

    const frames = this.textures.get(this.cloudKey).getFrameNames();
    for (let i = 0; i < 24; i++) {
      const x = Phaser.Math.RND.between(-sceneWidth * 0.5, sceneWidth * 1.5);
      const y = Phaser.Math.RND.between(sceneHeight * 0.2, sceneHeight * 0.8);
      const velocity = Phaser.Math.RND.between(15, 30);

      this.cloud
        .create(x, y, this.cloudKey, frames[i % 6])
        .setScale(3)
        .setVelocity(velocity, 0);
    }
  }
}
