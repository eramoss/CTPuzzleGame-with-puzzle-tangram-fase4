import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import DropZone from './DropZone';

export default class CodeEditor {

  scene: Scene;
  program: Program;
  dropZone: DropZone
  fnOnClickRun: () => void;
  fnOnClickStop: () => void;
  listener: Listener

  constructor(scene: Scene, program: Program, listener: Listener) {
    this.program = program;
    this.scene = scene;
    this.createGlobalDragLogic();
    this.createDraggableProgramCommands()
    this.createDropZone();
    this.createStartStopButtons();
    this.listener = listener
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
      if (dropped) {
      }
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  private createDraggableProgramCommands() {
    const commandGroup = this.scene.add.group();
    const commands: Phaser.GameObjects.Sprite[] = [
      commandGroup.get(810, 644, 'arrow-left').setScale(0.5),
      commandGroup.get(905, 644, 'arrow-up').setScale(0.5),
      commandGroup.get(810, 695, 'arrow-down').setScale(0.5),
      commandGroup.get(908, 695, 'arrow-right').setScale(0.5)
    ];

    commands.forEach((command: Phaser.GameObjects.Sprite) => {
      this.scene.input.setDraggable(command.setInteractive({ cursor: 'grab' }));
      command.on('pointerdown', _ => {
        this.dropZone.highlight()
      });
      command.on('pointerup', _ => {
        this.dropZone.highlight(false)
      });
      command.on('pointerover', _ => {
        command.setScale(0.7);
      });
      command.on('pointerout', _ => {
        command.setScale(0.5);
      });
      command.on('dragstart', _ => {
        // Não deixa acabar os comandos
        this.createDraggableProgramCommands();
        command.setScale(0.8)
      })
      command.on('dragend', _ => {
        command.setScale(0.5);
      })
      command.on('drop', (pointer: Input.Pointer, dropZone: GameObjects.Zone) => {
        this.program.addCommand(command, dropZone)
      })
    })
  }

  private createDropZone() {
    this.dropZone = new DropZone(this.scene, 360, 657, 700, 210, 16, 'drop-zone');
  }

  private createStartStopButtons() {
    new Button(this.scene, 35, 555, 'btn-play', () => {
      this.fnOnClickRun();
    })
    new Button(this.scene, 75, 555, 'btn-stop', () => {
      this.fnOnClickStop()
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

class Listener {
  constructor() { }
}
