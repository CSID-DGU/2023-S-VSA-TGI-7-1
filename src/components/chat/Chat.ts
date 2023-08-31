import { Room } from 'colyseus.js';
import { CharacterComponent } from '../character/Character';

export class ChatComponent {
  private room: Room;
  private chatMessages: string[] = [];
  private chatInput: string = '';
  private chatMode: boolean;
  private sessionIDArray: string[] = [];
  // 미사용 색상 목록
  private availableColors = [
    '#0079FF',
    '#0079FF',
    '#F6FA70',
    '#FF0060',
    '#FFB84C',
    '#F266AB',
    '#F266AB',
    '#F266AB',
    // 추가 색상을 필요한 만큼 더 정의할 수 있습니다.
  ];
  // 아이디와 색상을 매핑하는 객체
  private idColorMap = {};

  getColorForId(id) {
    if (!this.idColorMap[id]) {
      // 새로운 사용자 아이디에 대해 정의된 팔레트에서 겹치지 않는 색상을 선택합니다.
      if (id === 'yourUserId') {
        // 자신의 아이디일 경우 미사용 색상 중에서 랜덤하게 선택합니다.
        const availableColors = this.availableColors.filter(color => !Object.values(this.idColorMap).includes(color));
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        this.idColorMap[id] = availableColors[randomIndex];
      } else {
        // 다른 사용자의 아이디일 경우 미사용 색상 중에서 랜덤하게 선택합니다.
        const availableColors = this.availableColors.filter(color => !Object.values(this.idColorMap).includes(color));
        if (availableColors.length === 0) {
          // 더 이상 사용 가능한 색상이 없을 경우, 기존 색상 중 하나를 재사용합니다.
          const existingColors = Object.values(this.idColorMap);
          const randomIndex = Math.floor(Math.random() * existingColors.length);
          this.idColorMap[id] = existingColors[randomIndex];
        } else {
          const randomIndex = Math.floor(Math.random() * availableColors.length);
          this.idColorMap[id] = availableColors[randomIndex];
        }
      }
    }
    return this.idColorMap[id];
  }

  scene: Phaser.Scene = CharacterComponent.cameraScene;

  constructor(room: Room) {
    this.room = room;
  }

  Scene = (Phaser.Scene = CharacterComponent);

  initialize(scene: Phaser.Scene) {
    this.scene = scene;
    const chatContainer = document.getElementById('chat-messages'); // Get the chat container element
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;

    this.scene.scale.on(
      'resize',
      (gameSize, baseSize, displaySize, resolution) => {
        // Adjust chat container size based on the new viewport size
        // You can also adjust other styles here
      }
    );

    this.room.onMessage('chat', (message) => {
      this.chatMessages.push(`${message.id} : ${message.message}`);
      this.updateChatText(chatContainer);
      console.log(`${message.id}: ${message.message}`);
      // 채팅 메시지가 추가될 때마다 자동으로 스크롤을 아래로 내립니다.
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    this.room.onMessage('joined', (message) => {
      this.chatMessages.push(`server : ${message.joined}`);
      this.updateChatText(chatContainer);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });

       
    this.room.onMessage('left', (message) => {
      this.chatMessages.push(`server : ${message.left}`);
      this.updateChatText(chatContainer);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    this.chatMode = false;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (!chatInput.value) {
          // If the input field is empty
          chatInput.focus(); // Focus on the input field
        } else {
          if (chatInput.value.trim() !== '') {
            this.room.send('chat', chatInput.value);
          }
          chatInput.value = '';
          chatInput.blur(); // Remove focus from the input field
        }
      } else if (event.key === ' ') {
        chatInput.value += ' ';
        this.updateChatText(chatContainer);
      } else {
        this.updateChatText(chatContainer);
      }
    });

    chatInput.style.display = 'block';

    this.updateChatText(chatContainer);
  }

  updateChatText(chatContainer: HTMLElement) {
    chatContainer.innerHTML = ''; // Clear the chat container

    for (const message of this.chatMessages.slice(-20)) {
      const messageElement = document.createElement('div');
      const spanElement = document.createElement('span');
      const [id, msg] = message.split(': ');

      spanElement.textContent = id;
      spanElement.style.color = this.getColorForId(id); // 아이디에 대한 색상을 설정합니다.

      messageElement.appendChild(spanElement);

      const messageText = document.createTextNode(`: ${msg}`);
      messageElement.appendChild(messageText);

      chatContainer.appendChild(messageElement);
    }
  }
}
