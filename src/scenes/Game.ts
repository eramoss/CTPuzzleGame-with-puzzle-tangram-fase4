import { GameObjects, Input, Types, Scene } from 'phaser'
import Matrix from '../geom/Matrix'
import Dude, { DudeMove } from '../sprites/Dude'
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
  gameObjects: GameObjects.GameObject[][]

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
    this.load.image('block', 'assets/ct/obstacle_orange.png');

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

    /* this.anims.create({
      key: 'gold-spining',
      frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1
    })

    this.add.sprite(300, 300, 'coin-gold').play('gold-spining');
    */

    this.sounds = new Sounds(this)
    this.program = new Program(this, this.sounds);
    this.codeEditor = new CodeEditor(this, this.program, this.sounds);

    let obstaclesMatrix = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    this.matrix = new Matrix(this,
      obstaclesMatrix,
      490, 110, 50);

    let obstacleTypes = {
      1: 'block',
      2: 'block'
    }

    let gameObjects: GameObjects.GameObject[][] = []
    for (let y = 0; y < this.matrix.height; y++) {
      if (!gameObjects[y]) gameObjects[y] = [];
      for (let x = 0; x < this.matrix.width; x++) {
        let obstacleType = obstacleTypes[obstaclesMatrix[y][x]]
        if (obstacleType) {
          const point = this.matrix.points[x][y];
          const obstacle = this.add.image(point.x, point.y + 25, obstacleType);
          gameObjects[y][x] = obstacle;
        }
      }
    }

    this.dude = new Dude(this, this.matrix, this.sounds);
    gameObjects[3][5] = this.dude.character
    this.dude.setPosition(5, 3);

    this.gameObjects = gameObjects;

    this.dude.onStepChange = (stepCount: integer, movingTo: DudeMove) => {
      console.log('ON_STEP_CHANGE', stepCount, 'current', movingTo);
      if (movingTo) {
        let currentPosition = movingTo.previousMove
        if (currentPosition) {
          this.gameObjects[currentPosition.y][currentPosition.x] = undefined
          this.gameObjects[movingTo.y][movingTo.x] = this.dude.character
        }
      }
      this.updateBringFront();
      this.codeEditor.highlight(stepCount);
    }
    this.updateBringFront();

    this.program.addCommands(['up', 'up', 'left', 'left', 'left', 'left', 'down'], this.codeEditor.dropZone.zone)

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

  updateBringFront() {
    let gameObjects = this.gameObjects;
    let matrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        const object = gameObjects[y][x];
        let c = '-';
        if (object) {
          c = object.type.substring(0, 1);
          this.children.bringToTop(object);
        }
        matrix += c + ' ';
      }
      matrix += '\n';
    }
    console.log('GAME_OBJECTS', matrix)
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
