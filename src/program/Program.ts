import { GameObjects } from 'phaser'
import Command from './Command'
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import DropZone from '../controls/DropZone';
import drawRect, { createDropZone } from '../utils/Utils';

export default class Program {
  commands: Command[];
  scene: Phaser.Scene;
  dropZone: DropZone;
  sounds: Sounds;
  grid: AlignGrid;

  constructor(scene: Phaser.Scene, sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.scene = scene;
    this.grid = grid;
    this.commands = new Array();
    this.dropZone = createDropZone(this.grid, 0.5, 17.5, 25, 4, 'drop-zone');
  }

  addCommands(commands: string[]) {
    commands.forEach(command => {
      const commandSprite = this.scene.add.sprite(0, 0, `arrow-${command}`)
      this.addCommand(commandSprite)
    })
  }

  addCommand(sprite: GameObjects.Sprite) {
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
    const zone = this.dropZone.zone;
    const index = this.commands.indexOf(command);
    const spriteWidth = command.sprite.width * this.grid.scale;
    const spriteHeight = command.sprite.height * this.grid.scale * 1.4;

    console.log('COMMAND_ALLOCATE_AREA', spriteWidth, spriteHeight)

    const cols: integer = Math.floor(zone.width / spriteWidth);
    const rows: integer = Math.floor(zone.height / spriteHeight);

    const tileWidth = spriteWidth + (zone.width - spriteWidth * cols) / cols
    const tileHeight = spriteHeight + (zone.height - spriteHeight * rows) / rows

    let x = zone.x + (index % cols * tileWidth) + spriteWidth * 0.5;
    let y = zone.y + Math.floor(index / cols) * tileHeight + spriteHeight * 0.5;
    command.setPosition(x, y);
    drawRect(this.scene, zone.x, zone.y, spriteWidth, spriteHeight)
  }

  removeCommandBySprite(commandSprite: GameObjects.Sprite) {
    this.scene.children.remove(commandSprite);
    this.sounds.remove();
    let command = this.findCommandBySprite(commandSprite);
    if (command) {
      this.removeCommand(command);
    }
  }

  removeCommand(command: Command) {
    let index = this.commands.indexOf(command);
    this.commands.splice(index, 1);
    console.log('ADD_REMOVE_COMMANDS', this.commands)
    this.commands.forEach((command: Command) => {
      this.allocateInProgramArea(command);
    })
  }
}
