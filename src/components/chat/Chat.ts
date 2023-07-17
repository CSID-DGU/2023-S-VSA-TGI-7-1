import { Room } from "colyseus.js";

export class ChatComponent {
  private room: Room;
  private chatMessages: string[] = [];
  private chatInput: string = "";
  private text: Phaser.GameObjects.Text;
  private chatMode: boolean;

  constructor(room: Room) {
    this.room = room;
  }

  initialize(scene: Phaser.Scene) {
    this.text = scene.add.text(0, 600 - 200, "", {
      color: "black",
      wordWrap: { width: 300 },
    });

    this.room.onMessage("chat", (message) => {
      this.chatMessages.push(`${message.id}: ${message.message}`);
      this.updateChatText();
      console.log(`${message.id}: ${message.message}`);
    });
    this.chatMode = false;
      scene.input.keyboard.on("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          let chatInput = document.getElementById(
            "chat-input"
          ) as HTMLInputElement;
          // Toggle chat input visibility
          if (chatInput.style.display === "none") {
            chatInput.style.display = "block";
            chatInput.focus();
          } else {
            this.room.send("chat", chatInput.value);
            chatInput.value = "";
            chatInput.style.display = "none";
          }
        }
      });
  }

  updateChatText() {
    this.text.setText([...this.chatMessages.slice(-10), "> " + this.chatInput].join("\n"));
  }
}
