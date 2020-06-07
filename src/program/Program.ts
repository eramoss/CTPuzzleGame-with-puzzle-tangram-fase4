import { GameObjects } from 'phaser'
import Command from './Command'

export default class Program {
  commands: Command[];
  scene: Phaser.Scene;
  dropZone: GameObjects.Zone;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.commands = new Array();
  }

  addCommand(sprite: GameObjects.Sprite, dropZone: Phaser.GameObjects.Zone) {
    sprite.setScale(1);
    this.dropZone = dropZone;
    const command = new Command(this.scene, sprite, 'x');
    this.commands.push(command);
    this.findBestPosition(command);
    command.onRemoveCommand = (command: Command) => {
      this.removeCommand(command);
    }
  }

  findBestPosition(command: Command) {
    const spriteHeight = command.sprite.height / 2;
    const spriteWidth = command.sprite.width / 2;
    const columns: integer = Math.floor(this.dropZone.width / spriteWidth);
    const rows: integer = Math.floor(this.dropZone.height / spriteHeight);
    const diff = (this.dropZone.height - (spriteHeight * rows)) / rows;
    const index = this.commands.indexOf(command);
    let x = index % columns * spriteWidth + spriteWidth / 2 + this.dropZone.x - this.dropZone.width / 2;
    let y = (Math.floor(index / columns) * (spriteHeight + diff) + this.dropZone.y - this.dropZone.height / 2 + spriteHeight / 2) + diff;
    command.setPosition(x, y);
  }

  removeCommand(command: Command) {
    command.removeSelf();
    let index = this.commands.indexOf(command);
    this.commands.splice(index, 1);
    this.commands.forEach((command: Command) => {
      this.findBestPosition(command);
    })
  }
}
