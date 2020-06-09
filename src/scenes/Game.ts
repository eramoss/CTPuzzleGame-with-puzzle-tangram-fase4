import Phaser, { GameObjects, Input, Types, Physics, Scene } from 'phaser'
import Button from '../controls/Button'
import DropZone from '../controls/DropZone'
import Matrix from '../geom/Matrix'
import Dude from '../sprites/Dude'
import Program from '../program/Program'
import Command from '../program/Command'

export default class Game extends Scene {

  dropZone: DropZone
  program: Program
  currentObject: GameObjects.Image;
  dude: Dude
  matrix: Matrix
  cursors: Types.Input.Keyboard.CursorKeys

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-right', 'assets/ct/arrowDownRight.png');
    this.load.image('arrow-down', 'assets/ct/arrowDownLeft.png');
    this.load.image('arrow-up', 'assets/ct/arrowUpRight.png');
    this.load.image('arrow-left', 'assets/ct/arrowUpLeft.png');
    this.load.image('scene', 'assets/ct/programming_scene.png');
    this.load.image('ground', 'assets/ct/ground_sand.png');
    this.load.image('controls', 'assets/ct/controls_sand.png');
    this.load.image('x', 'assets/ct/x.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 30, frameHeight: 30 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 30, frameHeight: 30 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 700, frameHeight: 256 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 30, frameHeight: 75 });
  }

  create() {
    this.program = new Program(this);
    this.addEnvironmentImages();
    this.createDropZone();
    this.createStartStopButtons();
    this.createGlobalDragLogic();
    this.createDraggableProgramCommands()
    this.cursors = this.input.keyboard.createCursorKeys()
    this.matrix = new Matrix(this, 490, 110, 50)

    this.dude = new Dude(this, this.matrix)
    this.dude.setPosition(3, 3);

    this.input.on('pointerdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject[]) => {
      this.currentObject = gameObject[0] as GameObjects.Sprite
    })
  }

  private createGlobalDragLogic() {
    this.input.on('dragstart', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      this.children.bringToTop(gameObject);
    });
    this.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dragX: integer, dragY: integer) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.input.on('dragend', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dropped: boolean) => {
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  private createDraggableProgramCommands() {
    const commandGroup = this.add.group();
    const commands: Phaser.GameObjects.Sprite[] = [
      commandGroup.get(810, 644, 'arrow-left').setScale(0.5),
      commandGroup.get(905, 644, 'arrow-up').setScale(0.5),
      commandGroup.get(810, 695, 'arrow-down').setScale(0.5),
      commandGroup.get(908, 695, 'arrow-right').setScale(0.5)
    ];

    commands.forEach((command: Phaser.GameObjects.Sprite) => {
      this.input.setDraggable(command.setInteractive({ cursor: 'grab' }));
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
    this.dropZone = new DropZone(this, 360, 657, 700, 210, 16, 'drop-zone');
  }

  private createStartStopButtons() {
    new Button(this, 35, 555, 'btn-play', () => {
      this.runCode();
    })
    new Button(this, 75, 555, 'btn-stop', () => {
      this.dude.stop();
    })
  }

  private addEnvironmentImages() {
    this.input.setDefaultCursor('pointer');
    this.add.image(500, 400, 'scene').setInteractive();
    this.add.image(490, 326, 'ground').setInteractive();
    this.add.image(857, 677, 'controls').setInteractive();
  }

  private runCode() {
    this.dude.execute(this.program.commands);
  }

  init() {

  }

  update() {
    this.dude.update()
    this.updateCurrentObjectPosition()
  }

  updateCurrentObjectPosition() {
    if (this.currentObject) {
      if (this.cursors.up?.isDown) {
        this.currentObject.y--;
      }
      if (this.cursors.down?.isDown) {
        this.currentObject.y++;
      }
      if (this.cursors.left?.isDown) {
        this.currentObject.x--;
      }
      if (this.cursors.right?.isDown) {
        this.currentObject.x++;
      }
      console.log(this.currentObject.x, this.currentObject.y);
    }
  }
}
