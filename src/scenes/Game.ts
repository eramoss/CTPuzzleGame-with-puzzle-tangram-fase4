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
    this.load.image('arrow-up', 'assets/ct/arrowUpRight.png');
    this.load.image('arrow-down', 'assets/ct/arrowDownLeft.png');
    this.load.image('arrow-right', 'assets/ct/arrowDownRight.png');
    this.load.image('arrow-left', 'assets/ct/arrowUpLeft.png');
    this.load.image('scene', 'assets/ct/programming_scene.png');
    this.load.image('ground', 'assets/ct/ground_sand.png');
    this.load.image('controls', 'assets/ct/controls_sand.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', 'assets/ct/obstacle_orange.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 320, frameHeight: 316 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 57, frameHeight: 110 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 94 });
    this.load.spritesheet('trash', 'assets/ct/trash.png', { frameWidth: 199, frameHeight: 265 });

    this.load.audio('blocked', 'assets/ct/sounds/blocked.ogg');
    this.load.audio('drag', 'assets/ct/sounds/drag.ogg');
    this.load.audio('drop', 'assets/ct/sounds/drop.ogg');
    this.load.audio('hover', 'assets/ct/sounds/hover.ogg');
    this.load.audio('remove', 'assets/ct/sounds/remove.ogg');
    this.load.audio('start', 'assets/ct/sounds/start.ogg');
  }

  create() {
    this.input.setDefaultCursor('pointer');

    this.grid = new AlignGrid(
      this, 26, 26,
      this.game.config.width as number,
      this.game.config.height as number
    );

    this.sounds = new Sounds(this)

    this.grid.addImage(1, 5, 'ground', 17);
    this.program = new Program(this, this.sounds, this.grid);
    this.codeEditor = new CodeEditor(this, this.program, this.sounds, this.grid);

    let obstaclesMatrix: number[][] = [
      [0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 1, 2, 1, 2, 0, 1],
      [1, 0, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 1, 2, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
    ];

    const cell = this.grid.getCell(1, 5);
    this.matrix = new Matrix(this,
      obstaclesMatrix,
      cell.x + this.grid.cellWidth * 17 / 2, cell.y, this.grid.cellWidth * 1.06);

    let spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject> = new Array();
    spriteCreateFunctions[1] = (x: integer, y: integer) => {
      return this.add.image(x, y + (10 * this.grid.scale), 'block').setScale(this.grid.scale)
    };
    spriteCreateFunctions[2] = (x: integer, y: integer) => {
      this.anims.create({
        key: 'gold-spining',
        frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      })
      return this.add.sprite(x, y, 'coin-gold').play('gold-spining').setScale(this.grid.scale);
    }
    this.mazeModel = new MazeModel(this, this.matrix, spriteCreateFunctions, obstaclesMatrix)

    let initGame = () => {
      //this.mazeModel.clear();
      this.mazeModel.putSprite(0, 0, this.dude.character)
      this.dude.setPosition(0, 0);
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

    //this.program.addCommands(['down', 'down', 'down', 'down', 'down', 'down'], this.codeEditor.dropZone.zone)
    /* this.cursors = this.input.keyboard.createCursorKeys()
    this.input.on('pointerdown', (pointer: Input.Pointer, gameObject: GameObjects.GameObject[]) => {
      this.currentObject = gameObject[0] as GameObjects.Sprite
    }) */

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