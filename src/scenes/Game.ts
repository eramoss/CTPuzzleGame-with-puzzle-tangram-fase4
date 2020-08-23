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
  
  groundX:number = 315
  groundY:number = 190
  tileWidth:number = 50
  programmingAreaScale:number= 0.75

  controlsX:number=857
  controlsY:number=177
  controlsScale:number=1

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
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 320, frameHeight: 256 });
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
    this.grid = new AlignGrid(
      this,26,26,
      this.game.config.width as number,
      this.game.config.height as number
    );
    
    this.grid.show();
    this.addEnvironmentImages();

    this.sounds = new Sounds(this)
    this.program = new Program(this, this.sounds);
    this.codeEditor = new CodeEditor(this, this.program, this.sounds, this.grid);

    let obstaclesMatrix: number[][] = [
      [0, 0, 0, 0, 2, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
    ];

    this.matrix = new Matrix(this,
      obstaclesMatrix,
      this.groundX, (this.groundY - 225), this.tileWidth);

    let spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject> = new Array();
    spriteCreateFunctions[1] = (x: integer, y: integer) => {
      return this.add.image(x, y + 25, 'block')
    };
    spriteCreateFunctions[2] = (x: integer, y: integer) => {
      this.anims.create({
        key: 'gold-spining',
        frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      })
      return this.add.sprite(x, y+10, 'coin-gold').play('gold-spining').setScale(0.7);
    }

    let initGame = () => {
      this.mazeModel = new MazeModel(this, this.matrix, spriteCreateFunctions, obstaclesMatrix)
      this.mazeModel.putSprite(5, 3, this.dude.character)
      this.dude.setPosition(5, 3);
      this.mazeModel.updateBringFront();
      this.codeEditor.highlight(-1);
    }

    this.dude = new Dude(this, this.matrix, this.sounds);
    this.dude.character

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

  private addEnvironmentImages() {
    this.grid.addImage(1,1, 'ground', 17, 15);
    this.grid.addImage(19, 10, 'controls', 6, 6);
    this.input.setDefaultCursor('pointer');
    
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