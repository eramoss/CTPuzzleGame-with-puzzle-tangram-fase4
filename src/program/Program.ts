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
    let command = this.findCommandBySprite(sprite);
    if (!command) {
      command = new Command(this.scene, sprite);
      this.commands.push(command);
    }
    console.log('ADD_REMOVE_COMMANDS', this.commands)
    this.allocateInProgramArea(command);
  }

  private findCommandBySprite(sprite: GameObjects.Sprite): Command {
    const commands = this.commands.filter(c => c.sprite === sprite);
    let command: Command;
    if (commands.length > 0) {
      command = commands[0]
    }
    return command;
  }

  allocateInProgramArea(command: Command) {
    const index = this.commands.indexOf(command);
    const spriteWidth = command.sprite.width * this.grid.scale * 0.6;
    const spriteHeight = command.sprite.height * this.grid.scale * 0.6;

    console.log('COMMAND_ALLOCATE_AREA', spriteWidth, spriteHeight)

    const cols: integer = Math.floor(this.dropZone.width / spriteWidth);
    const rows: integer = Math.floor(this.dropZone.height / spriteHeight);

    const tileWidth = spriteWidth + (this.dropZone.width - spriteWidth * cols) / cols
    const tileHeight = spriteHeight + (this.dropZone.height - spriteHeight * rows) / rows

    let x = this.dropZone.x + (index % cols * tileWidth) + spriteWidth * 0.5;
    let y = this.dropZone.y + Math.floor(index / cols) * tileHeight + spriteHeight * 0.5;
    command.setPosition(x, y);

    if (this.scene.game.config.physics.arcade?.debug) {
      const g = this.scene.add.graphics();
      g.fillStyle(0xff0f0f);
      g.fillRect(this.dropZone.x, this.dropZone.y, spriteWidth, spriteHeight);
    }
  }

  removeCommandBySprite(commandSprite: GameObjects.Sprite) {
    let command = this.findCommandBySprite(commandSprite);
    if (command) {
      this.removeCommand(command);
    }
  }

  removeCommand(command: Command) {
    this.scene.children.remove(command.sprite);
    this.sounds.remove();
    let index = this.commands.indexOf(command);
    this.commands.splice(index, 1);
    console.log('ADD_REMOVE_COMMANDS', this.commands)
    this.commands.forEach((command: Command) => {
      this.allocateInProgramArea(command);
    })
  }
}
