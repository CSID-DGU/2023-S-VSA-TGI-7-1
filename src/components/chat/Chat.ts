import { Room } from 'colyseus.js';

export class ChatComponent {
  private room: Room;
  private chatMessages: string[] = [];
  private chatInput: string = '';
  private text: Phaser.GameObjects.Text;
  private chatMode: boolean;
  private scene: Phaser.Scene;

  constructor(room: Room) {
    this.room = room;
  }

  initialize(scene: Phaser.Scene) {
    this.scene = scene;
    const viewportWidth = this.scene.cameras.main.width;
    const desiredWidth = viewportWidth * 0.4;

    this.text = this.scene.add
      .text(0, 0, '', {
        color: 'black',
        backgroundColor: 'white',
        fixedWidth: desiredWidth,
        fixedHeight: '100',
        wordWrap: { width: desiredWidth },
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
      this.chatMessages.push(`${message.id}: ${message.message}`);
      this.updateChatText();
      console.log(`${message.id}: ${message.message}`);
    });

    this.chatMode = false;

    scene.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        let chatInput = document.getElementById(
          'chat-input'
        ) as HTMLInputElement;
        // Toggle chat input visibility
        if (chatInput.style.display === 'none') {
          chatInput.style.display = 'block';
          chatInput.focus();
        } else {
          if (chatInput.value.trim() !== '') {
            this.room.send('chat', chatInput.value);
          }
          chatInput.value = '';
          chatInput.style.display = 'none';
          this.chatInput = '';
        }
      } else if (event.key === ' ') {
        let chatInput = document.getElementById(
          'chat-input'
        ) as HTMLInputElement;
        chatInput.value += ' ';
        this.chatInput = chatInput.value;
        this.updateChatText();
      } else {
        let chatInput = document.getElementById(
          'chat-input'
        ) as HTMLInputElement;
        this.chatInput = chatInput.value;
        this.updateChatText();
      }
    });

    let chatInput = document.getElementById('chat-input') as HTMLInputElement;
    chatInput.style.display = 'none';

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
    this.text.setOrigin(0.5, 1);

    this.text.setText(
      [...this.chatMessages.slice(-5), this.chatInput].join('\n')
    );
  }
}
