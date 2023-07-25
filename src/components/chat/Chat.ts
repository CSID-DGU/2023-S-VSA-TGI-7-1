import { Room } from 'colyseus.js';
import { CharacterComponent } from '../character/Character';

export class ChatComponent {
  private room: Room;
  private chatMessages: string[] = [];
  private chatInput: string = '';
  private text: Phaser.GameObjects.Text;
  private chatMode: boolean;
  private sessionIDArray: string[] = [];

  scene: Phaser.Scene = CharacterComponent.cameraScene;

  constructor(room: Room) {
    this.room = room;
  }

  Scene = (Phaser.Scene = CharacterComponent);

  initialize(scene: Phaser.Scene) {
    this.scene = scene;
    const viewportWidth = this.scene.cameras.main.width;
    const desiredWidth = viewportWidth * 0.4;

    this.text = this.scene.add
      .text(0, 0, '', {
        color: 'white',
        fixedWidth: desiredWidth,
        fixedHeight: '110',
        wordWrap: { width: desiredWidth },
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        lineSpacing: '1.4',
        fontSize: '15px',
      })
      .setScrollFactor(0)
      .setDepth(2);

    this.scene.scale.on(
      'resize',
      (gameSize, baseSize, displaySize, resolution) => {
        this.updateChatText();
      }
    );

    this.room.onMessage('chat', (message) => {
      this.chatMessages.push(` ${message.id}: ${message.message}`);
      this.updateChatText();

      if (!this.sessionIDArray.includes(message.id)) {
        this.sessionIDArray.push(message.id);
      }

      console.log(`${message.id}: ${message.message}`);
    });

    this.chatMode = false;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      let chatInput = document.getElementById('chat-input') as HTMLInputElement;
      if (event.key === 'Enter') {
        if (!chatInput.value) {
          // If the input field is empty
          chatInput.focus(); // Focus on the input field
        } else {
          if (chatInput.value.trim() !== '') {
            this.room.send('chat', chatInput.value);
          }
          chatInput.value = '';
          this.chatInput = '';
          chatInput.blur(); // Remove focus from the input field
        }
      } else if (event.key === ' ') {
        chatInput.value += ' ';
        this.chatInput = chatInput.value;
        this.updateChatText();
      } else {
        this.chatInput = chatInput.value;
        this.updateChatText();
      }
    });

    let chatInput = document.getElementById('chat-input') as HTMLInputElement;
    chatInput.style.display = 'block';

    this.updateChatText();
  }

  updateChatText() {
    const viewportWidth = this.scene.cameras.main.width;
    const viewportHeight = this.scene.cameras.main.height;
    const desiredWidth = viewportWidth * 0.4;

    // Update fixedWidth based on the new viewport width
    this.text.setStyle({
      ...this.text.style,
      fixedWidth: desiredWidth,
    });

    const textX = viewportWidth / 2;
    const textHeight = parseFloat(this.text.style.fixedHeight);
    const textY = viewportHeight - textHeight;

    this.text.setPosition(textX, textY);
    this.text.setOrigin(0.5, 1.4);

    this.text.setText([...this.chatMessages.slice(-5)].join('\n'));
  }
}
