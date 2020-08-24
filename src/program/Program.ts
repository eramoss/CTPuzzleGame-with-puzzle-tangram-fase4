import { GameObjects } from 'phaser'
import Command from './Command'
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';

export default class Program {
  commands: Command[];
  scene: Phaser.Scene;
  dropZone: GameObjects.Zone;
  sounds: Sounds;
  grid: AlignGrid;

  constructor(scene: Phaser.Scene, sounds: Sounds, grid:AlignGrid) {
    this.sounds = sounds;
    this.scene = scene;
    this.grid = grid;
    this.commands = new Array();
  }

  addCommands(commands: string[], dropZone: Phaser.GameObjects.Zone) {
    commands.forEach(command => {
      const commandSprite = this.scene.add.sprite(0, 0, `arrow-${command}`)
      this.addCommand(commandSprite.setScale(0.5), dropZone)
    })
  }

  addCommand(sprite: GameObjects.Sprite, dropZone: Phaser.GameObjects.Zone) {
    this.dropZone = dropZone;
    const command = new Command(this.scene, sprite, 'x');
    this.commands.push(command);
    this.findBestPosition(command);
    command.onRemoveCommand = (command: Command) => {
      this.sounds.remove();
      this.removeCommand(command);
    }
  }

  findBestPosition(command: Command) {
    const spriteHeight = command.sprite.displayOriginY / 2;
    const spriteWidth = command.sprite.displayWidth / 2;
    const columns: integer = Math.floor(this.dropZone.width / spriteWidth);
    const index = this.commands.indexOf(command);
    let x = index % columns * spriteWidth + spriteWidth + this.dropZone.x;
    let y = Math.floor(index / columns) * spriteHeight + this.dropZone.y;
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
