import { GameObjects } from 'phaser'
import Command from './Command'
import Sounds from '../sounds/Sounds';

export default class Program {
  addCommands(commands: string[], dropZone: Phaser.GameObjects.Zone) {
    commands.forEach(command => {
      const commandSprite = this.scene.add.sprite(0, 0, `arrow-${command}`)
      this.addCommand(commandSprite.setScale(0.5), dropZone)
    })
  }
  commands: Command[];
  scene: Phaser.Scene;
  dropZone: GameObjects.Zone;
  sounds: Sounds;

  constructor(scene: Phaser.Scene, sounds: Sounds) {
    this.sounds = sounds;
    this.scene = scene;
    this.commands = new Array();
  }

  addCommand(sprite: GameObjects.Sprite, dropZone: Phaser.GameObjects.Zone) {
    if (dropZone) {
      this.dropZone = dropZone;
    }
    const command = new Command(this.scene, sprite, 'x');
    this.commands.push(command);
    this.findBestPosition(command);
    command.onRemoveCommand = (command: Command) => {
      this.sounds.remove();
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
