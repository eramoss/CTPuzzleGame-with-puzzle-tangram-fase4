import { Scene } from "phaser";
import Button from "../controls/Button";
import AlignGrid from "../geom/AlignGrid";
import { globalSounds } from "../scenes/PreGame";
import drawRect, { writeText } from "../utils/Utils";

export default class MessageBox {
  grid: AlignGrid;
  graphicsBackShadow: Phaser.GameObjects.Graphics;
  messageBoxImage: Phaser.GameObjects.Image;
  scene: Scene;
  phrase: Phaser.GameObjects.Text;
  messages: string[]
  currentMessageIndex: number;
  okButton: Button;
  closeButton: Button;
  onFinishTalk: () => void = () => { };

  constructor(scene: Scene, grid: AlignGrid) {
    this.scene = scene;
    this.grid = grid;
    this.createBackShadow();
    this.createMessageBox();
    this.createText()
    this.createOkButton()
    this.createCloseButton()
    this.close();
  }

  setMessages(messages: string[]) {
    if (!messages || !messages.length) {
      this.close();
      return;
    }
    this.currentMessageIndex = 0;
    this.messages = messages;
    this.showCurrentMessage();
  }

  createOkButton() {
    let cell = this.grid.getCell(15, 17)
    let btn = new Button(this.scene, globalSounds, cell.x, cell.y, 'btn-ok', () => { this.showNextMessage() });
    btn.setScale(this.grid.scale);
    btn.setDepth(302);
    this.okButton = btn;
  }

  createCloseButton() {
    let cell = this.grid.getCell(22.3, 4.2)
    let btn = new Button(this.scene, globalSounds, cell.x, cell.y, 'btn-close-message', () => { this.close() });
    btn.setScale(this.grid.scale);
    btn.setDepth(304);
    this.closeButton = btn;
  }

  showCurrentMessage() {
    let message = this.messages[this.currentMessageIndex];
    if (message) {
      this.setText(message);
    }
    if (!message) {
      this.close();
      this.onFinishTalk();
    }
  }

  close() {
    this.setVisible(false);
  }

  setVisible(visible: boolean) {
    this.phrase?.setVisible(visible);
    this.okButton?.setVisible(visible);
    this.closeButton?.setVisible(visible);
    this.graphicsBackShadow?.setVisible(visible);
    this.messageBoxImage?.setVisible(visible);
  }

  showNextMessage() {
    this.currentMessageIndex = this.currentMessageIndex + 1;
    this.showCurrentMessage();
  }

  createText() {
    let point = this.grid.getCell(8.5, 6)
    this.phrase = this.scene.add.text(point.x, point.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setScale(this.grid.scale)
      .setFontStyle('bold')
      .setAlign('center')
      .setDepth(303)
      .setFontSize(40)
      .setTint(0xffffff);
  }

  setText(text: string) {
    this.setVisible(true);
    writeText(text, '', this.phrase, () => { })
  }

  private createBackShadow() {
    this.graphicsBackShadow = this.scene.add.graphics();
    this.graphicsBackShadow.depth = 300;
    this.graphicsBackShadow.fillStyle(0xb97a51);
    this.graphicsBackShadow.alpha = 0.6;
    this.graphicsBackShadow.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  createMessageBox() {
    this.messageBoxImage = this.grid.addImage(3, 3, 'message_box', 20);
    this.messageBoxImage.setDepth(301);
  }

}
