import { GameObjects, Types, Scene } from 'phaser'
import Matrix from '../geom/Matrix'
import Dude, { DudeMove } from '../sprites/Dude'
import Program from '../program/Program'
import CodeEditor from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'
import MazeModel from '../game/MazeModel'
import AlignGrid from '../geom/AlignGrid'

export default class Game extends Scene {

  codeEditor: CodeEditor
  program: Program
  currentObject: GameObjects.Image;
  dude: Dude
  matrix: Matrix
  sounds: Sounds
  cursors: Types.Input.Keyboard.CursorKeys
  mazeModel: MazeModel
  grid: AlignGrid

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-up', 'assets/ct/arrow_up.png');
    this.load.image('arrow-down', 'assets/ct/arrow_down.png');
    this.load.image('arrow-right', 'assets/ct/arrow_right.png');
    this.load.image('arrow-left', 'assets/ct/arrow_left.png');
    this.load.image('scene', 'assets/ct/programming_scene.png');
    this.load.image('tile', 'assets/ct/tile.png');
    this.load.image('controls', 'assets/ct/controls_sand.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', 'assets/ct/obstacle_orange_normal.png');
    this.load.image('prog_1', 'assets/ct/prog_1.png');
    this.load.image('prog_2', 'assets/ct/prog_2.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 1278, frameHeight: 130 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    //this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 57, frameHeight: 110 });
    this.load.spritesheet('sprite-rope', 'assets/ct/rope_walk.png', { frameWidth: 65, frameHeight: 89 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 94 });
    this.load.spritesheet('trash', 'assets/ct/trash.png', { frameWidth: 104, frameHeight: 122 });

    this.load.audio('blocked', 'assets/ct/sounds/blocked.ogg');
    this.load.audio('drag', 'assets/ct/sounds/drag.ogg');
    this.load.audio('drop', 'assets/ct/sounds/drop.ogg');
    this.load.audio('hover', 'assets/ct/sounds/hover.ogg');
    this.load.audio('remove', 'assets/ct/sounds/remove.ogg');
    this.load.audio('start', 'assets/ct/sounds/start.ogg');
  }

  create() {

    this.grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );

    this.input.setDefaultCursor('pointer');
    this.sounds = new Sounds(this)

    this.program = new Program(this, this.sounds, this.grid, 0.5, 15.5, 18, 2.7, 'drop-zone');
    let prog1 = new Program(this, this.sounds, this.grid, 0.5, 18.5, 18, 2.7, 'drop-zone');
    this.codeEditor = new CodeEditor(this, [this.program, prog1], this.sounds, this.grid);

    let baseMatrix: number[][] = [
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1],
    ];


    let obstaclesMatrix: number[][] = [
      [1, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ];

    this.matrix = new Matrix(this,
      Matrix.NORMAL,
      obstaclesMatrix,
      this.grid.width / 2, this.grid.height / 2.5, this.grid.cellWidth * 1);

    const base = new Matrix(this,
      Matrix.NORMAL,
      baseMatrix,
      this.grid.width / 2, this.grid.height / 2.5, this.grid.cellWidth * 1);

    let spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject> = new Array();
    spriteCreateFunctions[1] = (x: integer, y: integer) => {
      return this.add.image(x, y, 'block').setScale(this.grid.scale).setDepth(2)
    };
    spriteCreateFunctions[-1] = (x: integer, y: integer) => {
      return this.add.image(x, y, 'tile').setScale(this.grid.scale).setDepth(1)
    };
    spriteCreateFunctions[2] = (x: integer, y: integer) => {
      this.anims.create({
        key: 'gold-spining',
        frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      })
      return this.add.sprite(x, y, 'coin-gold').play('gold-spining').setScale(this.grid.scale).setDepth(3);
    }
    new MazeModel(this, base, spriteCreateFunctions)
    this.mazeModel = new MazeModel(this, this.matrix, spriteCreateFunctions)

    let initGame = () => {
      //this.mazeModel.clear();
      this.dude.character.setDepth(4)
      this.mazeModel.putSprite(1, 3, this.dude.character)
      this.dude.setPosition(1, 3);
      this.mazeModel.updateBringFront();
      this.codeEditor.highlight(-1);
    }

    this.dude = new Dude(this, this.matrix, this.sounds);
    this.dude.character.setScale(this.grid.scale)
    this.dude.character.displayOriginY = this.dude.character.height * 0.65;

    this.dude.canMoveTo = (x: number, y: number) => {
      let insideCorners = !!(this.matrix.points[x] && this.matrix.points[x][y]);
      let noBlocked = obstaclesMatrix[y] && obstaclesMatrix[y][x] !== 1
      return insideCorners && noBlocked
    }

    this.dude.onStepChange = (stepCount: integer, movingTo: DudeMove) => {
      console.log('ON_STEP_CHANGE', stepCount, 'current', movingTo);
      this.codeEditor.highlight(stepCount);
      if (movingTo) {
        if (movingTo.possibleMove) {
          let currentPosition = movingTo.previousMove
          if (currentPosition) {
            //this.mazeModel.detectColision()
            try {
              if (currentPosition.possibleMove) {
                this.mazeModel.putSprite(currentPosition.x, currentPosition.y, undefined)
              }
              this.mazeModel.putSprite(movingTo.x, movingTo.y, this.dude.character)
            } catch (e) {
              console.log('Dude out of bounds');
            }
          }
        }
      }
      this.mazeModel.updateBringFront();
    }

    this.codeEditor.onClickRun(() => {
      this.dude.execute(this.program.commands);
    })

    this.codeEditor.onClickStop(() => {
      this.dude.stop();
      initGame();
    })

    // this.program.addCommands(['arrow-down', 'arrow-up', 'prog_1'])
    // this.cursors = this.input.keyboard.createCursorKeys()
    // this.input.on('pointerdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject[]) => {
    //   this.currentObject = gameObject[0] as GameObjects.Sprite
    // }) 

    initGame();
  }

  init() {

  }

  update() {
    this.dude.update()
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