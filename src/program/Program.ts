import { GameObjects } from 'phaser'
import Command from './Command'
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import SpriteDropZone from '../controls/SpriteDropZone';
import { createDropZone } from '../utils/Utils';

export default class Program {


  commands: Command[];
  scene: Phaser.Scene;
  dropZone: SpriteDropZone;
  sounds: Sounds;
  grid: AlignGrid;
  name: string;
  parent: Program;
  programNameImage: GameObjects.Image;
  animated: boolean;
  maxSupportedCommandsByRow: number;

  constructor(scene: Phaser.Scene, name: string, sounds: Sounds, grid: AlignGrid, x: number, y: number, width: number, height: number, sprite: string) {
    this.scene = scene;
    this.name = name;
    this.sounds = sounds;
    this.grid = grid;
    this.commands = new Array();
    this.dropZone = createDropZone(this.grid, x, y, width, height, sprite);
    this.programNameImage = this.grid.addImage(x - 1.75, y - 0.15, name, 2, 3);
    //this.crossOrganizer = new CrossOrganizer();
  }

  animate() {
    if (!this.animated) {
      this.programNameImage.scale += 0.1
      this.programNameImage.rotation += 0.05
      this.animated = true;
    }
  }

  disanimate() {
    if (this.animated) {
      this.programNameImage.scale -= 0.1
      this.programNameImage.rotation -= 0.05
      this.animated = false;
    }
  }

  addCommands(commands: string[]) {
    commands.forEach(texture => {
      let textures = texture.split(':');
      let conditionTexture = null;
      if (textures.length > 1) {
        texture = textures[0]
        conditionTexture = textures[1];
      }
      const commandSprite = this.scene.add.sprite(0, 0, texture).setScale(this.grid.scale);
      let command = new Command(this.scene, commandSprite);
      command.setProgram(this);
      if (conditionTexture) {
        let conditionSprite = this.scene.add.sprite(0, 0, conditionTexture).setScale(this.grid.scale);
        let conditionCommand = new Command(this.scene, conditionSprite);
        command.setCondition(conditionCommand);
      }
    })
  }

  disanimateCommands() {
    this.commands.forEach(c => c.disanimateSprite());
  }

  addCommand(command: Command, index: number = -1) {
    if (this.isFull()) {
      return;
    }
    console.log('ADD_REMOVE_COMMANDS [index]', index)
    command.programDropZone = this.dropZone;
    if (this.commands.indexOf(command) == -1) {
      if (!command.isIntent)
        this.sounds.drop();
      if (index == -1) {
        index = this.commands.length;
      }
      this.commands.splice(index, 0, command);
    } else {
      let previousIndex = command.index();
      this.commands.splice(previousIndex, 1, command);
    }
    let fit = this.organizeInProgramArea(command);
    if (!fit) {
      command.removeSelf();
    }
    if (fit) {
      if (!(command.isIntent || command.isConditional)) {
        command.createTileDropZone();
      }
    }
    this.distributeAllCommands();
  }

  organizeInProgramArea(command: Command) {
    const zone = this.dropZone.zone;
    const index = this.commands.indexOf(command);
    const spriteWidth = command.sprite.width * this.grid.scale;
    const spriteHeight = command.sprite.height * this.grid.scale * 1.4;

    console.log('COMMAND_ALLOCATE_AREA', spriteWidth, spriteHeight)

    this.maxSupportedCommandsByRow = Math.floor(zone.width / spriteWidth);
    let cols = this.maxSupportedCommandsByRow;
    const rows: integer = Math.floor(zone.height / spriteHeight);

    const tileWidth = spriteWidth + (zone.width - spriteWidth * cols) / cols
    const tileHeight = spriteHeight + (zone.height - spriteHeight * rows) / rows

    const row = Math.floor(index / cols) * tileHeight;
    let fitInFirstRow = row == 0;

    let x = zone.x + (index % cols * tileWidth) + spriteWidth * 0.5;
    let y = zone.y + row + spriteHeight * 0.5;

    //let y = zone.y + Math.floor(index / cols) * tileHeight + spriteHeight * 0.5;
    command.setPosition(x, y);
    //drawRect(this.scene, x - spriteWidth / 2, y - spriteHeight / 2, spriteWidth, spriteHeight);

    return fitInFirstRow;
  }

  removeCommandSprite(commandSprite: GameObjects.Sprite, playSound: boolean = true) {
    this.scene.children.remove(commandSprite);
    if (playSound)
      this.sounds.remove();
  }

  removeCommand(command: Command, removeSpriteFromScene: Boolean = false) {
    if (command.index() > -1) {
      this.commands.splice(command.index(), 1);
      command.program = null;
    }
    if (removeSpriteFromScene) {
      let playSound = !command.isIntent
      this.removeCommandSprite(command.sprite, playSound);
    }
    this.reorganize();
  }

  reorganize() {
    this.distributeAllCommands();
    this.updateCommandsDropZonesPositions();
  }

  updateCommandsDropZonesPositions() {
    this.commands.forEach(c => c.updateTileDropZonePosition())
  }

  distributeAllCommands() {
    this.commands.forEach(c => {
      let fit = this.organizeInProgramArea(c);
      if (!fit) {
        c.removeSelf();
      }
    })
  }

  highlightConditionalAreas(ifCommand: Command): void {
    this.commands.forEach(c => {
      if (c.condition == null || c.condition == ifCommand) {
        c.addHighlightConditionalImage();
      }
    })

  }

  unhighlightConditionalAreas() {
    this.commands.forEach(c => {
      c.removeHighlightConditionImage();
    })
  }

  clear() {
    let commands = this.commands.splice(0)
    commands.forEach(c => c.removeSelf());
    this.commands = []
  }

  isFull(): boolean {
    return this.commands.filter(c => !c.isIntent).length == this.maxSupportedCommandsByRow
  }

  getCommandsWithConditions(): Command[] {
    return this.commands.flatMap(c => [c, c.condition]).filter(c => c != undefined);
  }
}
