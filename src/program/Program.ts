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

  constructor(scene: Phaser.Scene, sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.scene = scene;
    this.grid = grid;
    this.commands = new Array();
  }

  addCommands(commands: string[], dropZone: Phaser.GameObjects.Zone) {
    commands.forEach(command => {
      const commandSprite = this.scene.add.sprite(0, 0, `arrow-${command}`)
      this.addCommand(commandSprite, dropZone)
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
    const index = this.commands.indexOf(command);
    const spriteWidth = command.sprite.displayWidth * 0.6;
    const spriteHeight = command.sprite.displayHeight * 0.6;

    const cols: integer = Math.floor(this.dropZone.width / spriteWidth);
    const rows: integer = Math.floor(this.dropZone.height / spriteHeight);

    const tileWidth = spriteWidth + (this.dropZone.width - spriteWidth * cols) / cols
    const tileHeight = spriteHeight + (this.dropZone.height - spriteHeight * rows) / rows

    let x = this.dropZone.x + (index % cols * tileWidth) + spriteWidth * 0.5;
    let y = this.dropZone.y + Math.floor(index / cols) * tileHeight + spriteHeight * 0.5;
    command.setPosition(x, y);

    if(this.scene.game.config.physics.arcade?.debug){
      const g = this.scene.add.graphics();
      g.fillStyle(0xff0f0f);
      g.fillRect(this.dropZone.x, this.dropZone.y, spriteWidth, spriteHeight);
    }
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
