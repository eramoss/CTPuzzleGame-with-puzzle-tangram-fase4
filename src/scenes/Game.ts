import { GameObjects, Input, Types, Scene } from 'phaser'
import Matrix from '../geom/Matrix'
import Dude from '../sprites/Dude'
import Program from '../program/Program'
import CodeEditor from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'

export default class Game extends Scene {

  codeEditor: CodeEditor
  program: Program
  currentObject: GameObjects.Image;
  dude: Dude
  matrix: Matrix
  sounds: Sounds
  cursors: Types.Input.Keyboard.CursorKeys

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-up', 'assets/ct/arrowUpRight.png');
    this.load.image('arrow-down', 'assets/ct/arrowDownLeft.png');
    this.load.image('arrow-right', 'assets/ct/arrowDownRight.png');
    this.load.image('arrow-left', 'assets/ct/arrowUpLeft.png');
    this.load.image('scene', 'assets/ct/programming_scene.png');
    this.load.image('ground', 'assets/ct/ground_sand.png');
    this.load.image('controls', 'assets/ct/controls_sand.png');
    this.load.image('x', 'assets/ct/x.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 30, frameHeight: 30 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 30, frameHeight: 30 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 700, frameHeight: 256 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 57, frameHeight: 110 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 94 });

    this.load.audio('blocked', 'assets/ct/sounds/blocked.ogg');
    this.load.audio('drag', 'assets/ct/sounds/drag.ogg');
    this.load.audio('drop', 'assets/ct/sounds/drop.ogg');
    this.load.audio('hover', 'assets/ct/sounds/hover.ogg');
    this.load.audio('remove', 'assets/ct/sounds/remove.ogg');
    this.load.audio('start', 'assets/ct/sounds/start.ogg');
  }

  create() {
    this.addEnvironmentImages();

    this.anims.create({
      key: 'gold-spining',
      frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1
    })

    this.add.sprite(300, 300, 'coin-gold').play('gold-spining');

    this.sounds = new Sounds(this)
    this.program = new Program(this, this.sounds);
    this.codeEditor = new CodeEditor(this, this.program, this.sounds);
    this.matrix = new Matrix(this, 490, 110, 50)
    this.dude = new Dude(this, this.matrix, this.sounds)
    this.dude.setPosition(3, 3);

    this.dude.onStepChange = ((step: integer) => {
      console.log('step ', step);
      this.codeEditor.highlight(step);
    })

    this.codeEditor.onClickRun(() => {
      this.dude.execute(this.program.commands);
    })

    this.codeEditor.onClickStop(() => {
      this.dude.stop();
    })

    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.on('pointerdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject[]) => {
      this.currentObject = gameObject[0] as GameObjects.Sprite
    })
  }


  private addEnvironmentImages() {
    this.input.setDefaultCursor('pointer');
    this.add.image(500, 400, 'scene').setInteractive();
    this.add.image(490, 335, 'ground').setInteractive();
    this.add.image(857, 677, 'controls').setInteractive();
  }

  init() {

  }

  update() {
    this.dude.update()
    /* this.updateCurrentObjectPosition() */
  }

  /* updateCurrentObjectPosition() {
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
  } */
}
