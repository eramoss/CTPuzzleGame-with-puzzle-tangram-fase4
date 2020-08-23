import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import DropZone from './DropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';

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

  constructor(scene: Scene, program: Program, sounds:Sounds, grid:AlignGrid) {
    this.sounds = sounds;
    this.program = program;
    this.scene = scene;
    this.grid = grid;
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

  private createDraggableProgramCommands() {
    const commandGroup = this.scene.add.group();
    const commands: Phaser.GameObjects.Sprite[] = [
      commandGroup.get(0,0, 'arrow-left'),
      commandGroup.get(0,0, 'arrow-up'),
      commandGroup.get(0,0, 'arrow-down'),
      commandGroup.get(0,0, 'arrow-right')
    ];
    this.grid.placeAt(19,10, commands[0],2,2);
    this.grid.placeAt(22,10, commands[1],2,2);
    this.grid.placeAt(19,13, commands[2],2,2);
    this.grid.placeAt(22,13, commands[3],2,2);

    commands.forEach((command: Phaser.GameObjects.Sprite) => {
      this.scene.input.setDraggable(command.setInteractive({ cursor: 'grab' }));
      command.on('pointerdown', _ => {
        this.dropZone.highlight()
      });
      command.on('pointerup', _ => {
        this.dropZone.highlight(false)
      });
      command.on('pointerover', _ => {
        this.sounds.hover();
        command.setScale(0.7);
      });
      command.on('pointerout', _ => {
        command.setScale(0.5);
      });
      command.on('dragstart', _ => {
        // Não deixa acabar os comandos
        this.sounds.drag();
        this.createDraggableProgramCommands();
        command.setScale(0.8)
      })
      command.on('dragend', _ => {
        command.setScale(0.5);
      })
      command.on('drop', (pointer: Input.Pointer, dropZone: GameObjects.Zone) => {
        this.sounds.drop();
        this.program.addCommand(command, dropZone)
      })
    })
  }

  private createDropZone() {
    const width = this.scene.cameras.default.width;
    const height = this.scene.cameras.default.height;
    this.dropZone = new DropZone(this.scene, width-340/2, 125, 320, 256, 16, 'drop-zone');
  }

  private createStartStopButtons() {
    new Button(this.scene, this.sounds, 35, 555, 'btn-play', () => {
      this.fnOnClickRun();
    })
    new Button(this.scene, this.sounds, 75, 555, 'btn-stop', () => {
      this.sounds.stop();
      this.fnOnClickStop();
    })
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
