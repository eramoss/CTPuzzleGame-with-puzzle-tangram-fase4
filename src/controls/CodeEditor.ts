import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import DropZone from './DropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import Command from '../program/Command';

export default class CodeEditor {

  scene: Scene;
  program: Program;
  dropZone: DropZone
  fnOnClickRun: () => void;
  fnOnClickStop: () => void;
  sounds: Sounds;
  controlsX: number = 857;
  controlsY: number = 177;
  controlsScale: number;
  grid: AlignGrid;
  cellBaseX = 19
  cellBaseY = 14
  timeBefore = new Date().getTime()

  constructor(scene: Scene, program: Program, sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.program = program;
    this.scene = scene;
    this.grid = grid;
    this.grid.addImage(this.cellBaseX, this.cellBaseY, 'controls', 6, 6);
    this.createGlobalDragLogic();
    this.createDraggableProgramCommands()
    this.createDropZone();
    this.createStartStopButtons();
  }

  private createGlobalDragLogic() {
    this.scene.input.on('dragstart', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      this.scene.children.bringToTop(gameObject);
    });
    this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dragX: integer, dragY: integer) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.scene.input.on('dragend', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dropped: boolean) => {
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  private getByTextureName(commands: Phaser.GameObjects.Sprite[], textureName: string): Phaser.GameObjects.Sprite {
    return commands.filter(c => c.texture.key === textureName)[0]
  }

  private createDraggableProgramCommands(commandName:string = null) {
    const commandGroup = this.scene.add.group();
    let commandNames = ['arrow-left', 'arrow-up', 'arrow-down', 'arrow-right']
    if (commandName) {
      commandNames = commandNames.filter(c=>c == commandName)
    }
    const commands: Phaser.GameObjects.Sprite[] = commandNames.map(commandName => commandGroup.get(0, 0, commandName))

    console.log('COMMAND_NAMES', commandNames);

    let positions = {
      'arrow-left': {x: this.cellBaseX, y: this.cellBaseY},
      'arrow-up': {x: this.cellBaseX+3, y: this.cellBaseY},
      'arrow-down': {x: this.cellBaseX, y: this.cellBaseY+3*0.85},
      'arrow-right': {x: this.cellBaseX+3, y: this.cellBaseY+3*0.85},
    }
    Object.getOwnPropertyNames(positions).forEach(key => {
      let position = positions[key]
      this.grid.placeAt(position.x, position.y, this.getByTextureName(commands, key), 3);  
    });
    
    commands.forEach((command: Phaser.GameObjects.Sprite) => {
      this.scene.input.setDraggable(command.setInteractive({ cursor: 'grab' }));
      command.on('pointerdown', _ => {
        this.timeBefore = new Date().getTime()
        this.dropZone.highlight()
      });
      command.on('pointerup', _ => {
        if(new Date().getTime() - this.timeBefore < 100){
          // Simulate click
          this.addCommandToProgram(command, this.dropZone);
        }
        this.dropZone.highlight(false)
      });
      command.on('pointerover', _ => {
        this.sounds.hover();
        command.setScale(this.grid.scale);
      });
      command.on('pointerout', _ => {
        command.setScale(this.grid.scale * 0.85);
      });
      command.on('dragstart', _ => {
        // Não deixa acabar os comandos
        this.sounds.drag();
        this.createDraggableProgramCommands(command.texture.key);
        command.setScale(this.grid.scale * 1.2)
      })
      command.on('drop', _ => {
        this.sounds.drop();
        this.addCommandToProgram(command, this.dropZone);
      })
    })
  }

  private addCommandToProgram(command:Phaser.GameObjects.Sprite, dropZone:DropZone){
    command.setScale(this.grid.scale * 0.75);
        this.program.addCommand(command, dropZone.zone)
  }

  private createDropZone() {
    const rect: Phaser.Geom.Rectangle = this.grid.getArea(18.5, 1, 7, 12);
    this.dropZone = new DropZone(this.scene, rect.x, rect.y, rect.width, rect.height, 'drop-zone');
    this.grid.placeAt(18.5, 1, this.dropZone.sprite, 7,12);
  }

  private createStartStopButtons() {
    const btnPlay = new Button(this.scene, this.sounds, 0, 0, 'btn-play', () => {
      this.fnOnClickRun();
    })
    const btnStop = new Button(this.scene, this.sounds, 0, 0, 'btn-stop', () => {
      this.sounds.stop();
      this.fnOnClickStop();
    })
    this.grid.placeAt(1, 1, btnPlay.sprite, 1.7)
    this.grid.placeAt(3, 1, btnStop.sprite, 1.7)

  }

  onClickRun(fnOnClickRun: () => void) {
    this.fnOnClickRun = fnOnClickRun;
  }

  onClickStop(fnOnClickStop: () => void) {
    this.fnOnClickStop = fnOnClickStop;
  }

  highlight(step: number) {
    this.program.commands.forEach(command => command.sprite.clearTint())
    this.program.commands[step]?.sprite?.setTint(0x0ffff0);
  }
}
