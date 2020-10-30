import { GameObjects, Types, Scene, Physics } from 'phaser'
import Matrix from '../geom/Matrix'
import Dude, { DudeMove } from '../sprites/Dude'
import Program from '../program/Program'
import CodeEditor from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'
import MazeModel, { MazeModelObject } from '../game/MazeModel'
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
  mode: String = Matrix.ISOMETRIC

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-up', 'assets/ct/arrow_up.png');
    this.load.image('arrow-down', 'assets/ct/arrow_down.png');
    this.load.image('arrow-right', 'assets/ct/arrow_right.png');
    this.load.image('arrow-left', 'assets/ct/arrow_left.png');
    this.load.image('scene', 'assets/ct/programming_scene.png');
    this.load.image('tile', `assets/ct/tile_${this.mode}.png`);
    this.load.image('controls', 'assets/ct/controls_sand.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', `assets/ct/obstacle_orange_${this.mode}.png`);
    this.load.image('prog_0', 'assets/ct/prog_0.png');
    this.load.image('prog_1', 'assets/ct/prog_1.png');
    this.load.image('prog_2', 'assets/ct/prog_2.png');
    this.load.image('intention_comamnd', 'assets/ct/intention_comamnd.png');
    this.load.image('if_coin', 'assets/ct/if_coin.png');
    this.load.image('if_block', 'assets/ct/if_block.png');
    this.load.image('if_highlight', 'assets/ct/if_highlight.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 861, frameHeight: 105 });
    this.load.spritesheet('tile-drop-zone', 'assets/ct/tile_drop_zone.png', { frameWidth: 79, frameHeight: 69 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    //this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 57, frameHeight: 110 });
    this.load.spritesheet('sprite-rope-NORMAL', 'assets/ct/rope_walk_NORMAL.png', { frameWidth: 65, frameHeight: 89 });
    this.load.spritesheet('sprite-rope-ISOMETRIC', 'assets/ct/rope_walk_ISOMETRIC.png', { frameWidth: 97.5, frameHeight: 111 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 94 });
    this.load.spritesheet('trash', 'assets/ct/trash.png', { frameWidth: 104, frameHeight: 122 });

    this.load.audio('blocked', 'assets/ct/sounds/blocked.ogg');
    this.load.audio('drag', 'assets/ct/sounds/drag.ogg');
    this.load.audio('drop', 'assets/ct/sounds/drop.ogg');
    this.load.audio('hover', 'assets/ct/sounds/hover.ogg');
    this.load.audio('remove', 'assets/ct/sounds/remove.ogg');
    this.load.audio('start', 'assets/ct/sounds/start.ogg');
    this.load.audio('coin', 'assets/ct/sounds/mario.wav');
  }

  create() {

    this.grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );

    this.input.setDefaultCursor('pointer');
    this.sounds = new Sounds(this)

    //let prog_if_1 = new Program(this, 'prog_0', this.sounds, this.grid, 7, 12, 12, 1, 'drop-zone');
    this.program = new Program(this, 'prog_0', this.sounds, this.grid, 7, 13, 12, 2.6, 'drop-zone');
    let prog1 = new Program(this, 'prog_1', this.sounds, this.grid, 7, 16, 12, 2.6, 'drop-zone');
    let prog2 = new Program(this, 'prog_2', this.sounds, this.grid, 7, 19, 12, 2.6, 'drop-zone');
    this.codeEditor = new CodeEditor(this, [this.program, /* prog_if_1, */ prog1, prog2], this.sounds, this.grid);

    let baseMatrix: number[][] = [
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1, -1],
    ];


    let obstaclesMatrix: number[][] = [
      [0, 0, 0, 2, 0, 0, 0],
      [2, 0, 0, 0, 0, 0, 2],
      [0, 0, 1, 0, 1, 0, 0],
      [0, 2, 0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0],
      [2, 0, 0, 2, 0, 0, 2],
    ]

    this.matrix = new Matrix(this,
      this.mode,
      obstaclesMatrix,
      this.grid.width / 2, this.grid.height / 3, this.grid.cellWidth);

    const base = new Matrix(this,
      this.mode,
      baseMatrix,
      this.grid.width / 2, this.grid.height / 3, this.grid.cellWidth);

    let isometric = this.mode == Matrix.ISOMETRIC;
    let spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject> = new Array();
    spriteCreateFunctions[1] = (x: integer, y: integer) => {
      return this.add.image(x, y - 5, 'block').setScale(this.grid.scale * (isometric ? 1.2 : 1))
    };
    spriteCreateFunctions[-1] = (x: integer, y: integer) => {
      return this.add.image(x, y + 10, 'tile').setScale(this.grid.scale * (isometric ? 1.4 : 1))
    };
    spriteCreateFunctions[2] = (x: integer, y: integer) => {
      this.anims.create({
        key: 'gold-spining',
        frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      })
      return this.physics.add.sprite(x, y, 'coin-gold').play('gold-spining').setScale(this.grid.scale)
    }
    new MazeModel(this, base, spriteCreateFunctions)
    this.mazeModel = new MazeModel(this, this.matrix, spriteCreateFunctions)

    let initGame = () => {
      this.mazeModel.clearKeepingInModel(this.dude.character);
      this.mazeModel.putSprite(4, 1, this.dude.character)
      this.dude.setPosition(4, 1);
      this.mazeModel.updateBringFront();
      this.dude.setFacedTo('right');
      this.program.clear();
      prog1.clear();
      prog2.clear();
      this.program.addCommands(['arrow-up', 'arrow-left', 'arrow-down'])
      //prog1.addCommands(['arrow-down'])
      this.codeEditor.createEventsToCommandsForAddedPrograms();
    }

    this.dude = new Dude(this, this.matrix, this.sounds, this.grid);
    this.dude.character.setScale(this.grid.scale)
    this.dude.character.displayOriginY = this.dude.character.height * 0.65;

    this.dude.canMoveTo = (x: number, y: number) => {
      let point = this.matrix.getPoint(y, x);
      let object = this.mazeModel.getObjectAt(y, x)
      let blockNumber = 1
      const can = point != null && object?.spriteNumber != blockNumber
      console.log('CAN_MOVE_TO [x, y, can]', x, y, can)
      return can
    }

    this.dude.onCompleteMoveCallback = (current: DudeMove) => {
      /* if(baseMatrix[current.y][current.x] == 0){
        this.dude.character.setVelocityX(0)
        this.dude.character.setVelocityY(100)
        this.dude.character.setGravityY(100)
      } */
    }

    this.dude.onStartMoveCallback = (x: number, y: number, current: DudeMove) => {
      this.mazeModel.putSprite(x, y, undefined);
      if (current) {
        this.mazeModel.putSprite(current.x, current.y, this.dude.character)
      }
      this.mazeModel.updateBringFront();
    }

    this.mazeModel.onOverlap = (x: number, y: number, other: MazeModelObject) => {
      if (other.spriteNumber == 2) {//coin
        this.children.remove(other.gameObject);
        //coin.setGravityY(-200);
        //coin.setVelocityY(-100)
        this.sounds.coin();
      }
    }

    this.codeEditor.onClickRun(() => {
      this.dude.execute([this.program, prog1, prog2]);
    })

    this.codeEditor.onClickStop(() => {
      //console.clear();
      let resetFace = true;
      this.dude.stop(resetFace);
      //this.mazeModel.clear();
      initGame();
    })

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