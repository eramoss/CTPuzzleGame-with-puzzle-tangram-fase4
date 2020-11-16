import { GameObjects, Types, Scene } from 'phaser'
import Matrix from '../geom/Matrix'
import Dude from '../sprites/Dude'
import { DudeMove } from "../sprites/DudeMove"
import Program from '../program/Program'
import CodeEditor from '../controls/CodeEditor'
import Sounds from '../sounds/Sounds'
import MazeModel, { MazeModelObject } from '../game/MazeModel'
import AlignGrid from '../geom/AlignGrid'
import MazeConfigs from '../phases/MazeConfigs'
import MazePhase from '../phases/MazePhase'

export const DEPTH_OVERLAY_PANEL_TUTORIAL = 50

export default class Game extends Scene {

  codeEditor: CodeEditor
  program: Program
  currentObject: GameObjects.Image;
  dude: Dude
  sounds: Sounds
  cursors: Types.Input.Keyboard.CursorKeys
  obstaclesMazeModel: MazeModel
  groundMazeModel: MazeModel
  grid: AlignGrid
  mode: string = Matrix.ISOMETRIC
  phases: MazeConfigs
  currentPhase: MazePhase

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('arrow-up', 'assets/ct/arrow_up.png');
    this.load.image('arrow-down', 'assets/ct/arrow_down.png');
    this.load.image('arrow-right', 'assets/ct/arrow_right.png');
    this.load.image('arrow-left', 'assets/ct/arrow_left.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.image('tile', `assets/ct/tile_${this.mode}.png`);
    this.load.image('toolbox', 'assets/ct/toolbox.png');
    this.load.image('x', 'assets/ct/x.png');
    this.load.image('block', `assets/ct/obstacle_orange_${this.mode}.png`);
    this.load.image('prog_0', 'assets/ct/prog_0.png');
    this.load.image('prog_1', 'assets/ct/prog_1.png');
    this.load.image('prog_2', 'assets/ct/prog_2.png');
    this.load.image('intention_comamnd', 'assets/ct/intention_comamnd.png');
    this.load.image('if_coin', 'assets/ct/if_coin.png');
    this.load.image('if_block', 'assets/ct/if_block.svg');
    this.load.image('if_highlight', 'assets/ct/if_highlight.png');
    this.load.image('tutorial-block-click-background', 'assets/ct/tutorial-block-click-background.png');
    this.load.image('tutorial-drop-indicator', 'assets/ct/tutorial_drop_indicator.png');

    this.load.spritesheet('btn-play', 'assets/ct/btn_play.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-stop', 'assets/ct/btn_stop.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('btn-step', 'assets/ct/btn_step.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('drop-zone', 'assets/ct/programming_zone.png', { frameWidth: 541, frameHeight: 105 });
    this.load.spritesheet('tile-drop-zone', 'assets/ct/tile_drop_zone.png', { frameWidth: 79, frameHeight: 69 });
    this.load.spritesheet('sprite-girl', 'assets/ct/sprite_girl.png', { frameWidth: 30, frameHeight: 77 });
    //this.load.spritesheet('sprite-boy', 'assets/ct/sprite_boy.png', { frameWidth: 57, frameHeight: 110 });
    this.load.spritesheet('sprite-rope-NORMAL', 'assets/ct/rope_walk_NORMAL.png', { frameWidth: 65, frameHeight: 89 });
    this.load.spritesheet('sprite-rope-ISOMETRIC', 'assets/ct/rope_walk_ISOMETRIC.png', { frameWidth: 97.5, frameHeight: 111 });
    this.load.spritesheet('coin-gold', 'assets/ct/coin_gold.png', { frameWidth: 92, frameHeight: 94 });
    this.load.spritesheet('trash', 'assets/ct/trash.png', { frameWidth: 104, frameHeight: 122 });
    this.load.spritesheet('hand-tutorial', 'assets/ct/hand_tutorial.png', { frameWidth: 134, frameHeight: 176 });
    this.load.spritesheet('hand-tutorial-drag', 'assets/ct/hand_tutorial_drag.png', { frameWidth: 77, frameHeight: 101 });

    this.load.audio('blocked', 'assets/ct/sounds/blocked.mp3');
    this.load.audio('error', 'assets/ct/sounds/error.ogg');
    this.load.audio('drag', 'assets/ct/sounds/drag.ogg');
    this.load.audio('drop', 'assets/ct/sounds/drop.ogg');
    this.load.audio('hover', 'assets/ct/sounds/hover.ogg');
    this.load.audio('remove', 'assets/ct/sounds/remove.ogg');
    this.load.audio('start', 'assets/ct/sounds/start.ogg');
    this.load.audio('coin', 'assets/ct/sounds/coin.wav');
    this.load.audio('blink', 'assets/ct/sounds/blink.mp3');
    this.load.audio('success', 'assets/ct/sounds/success.mp3');
  }

  create() {

    this.grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );

    this.grid.addImage(0, 0, 'background', this.grid.cols, this.grid.rows);
    this.input.setDefaultCursor('pointer');
    this.sounds = new Sounds(this)

    this.program = new Program(this, 'prog_0', this.grid, 18.4, 11, 7, 2.3, 'drop-zone');
    let prog1 = new Program(this, 'prog_1', this.grid, 18.4, 14.5, 7, 2.3, 'drop-zone');
    let prog2 = new Program(this, 'prog_2', this.grid, 18.4, 18, 7, 2.3, 'drop-zone');
    this.codeEditor = new CodeEditor(this, [this.program, prog1, prog2], this.sounds, this.grid);

    let gridCenterX = this.grid.width / 3.2;
    let gridCenterY = this.grid.height / 2;
    let gridCellWidth = this.grid.cellWidth * 1.1

    this.phases = new MazeConfigs(
      this,
      this.grid,
      this.codeEditor,
      Matrix.ISOMETRIC,
      gridCenterX,
      gridCenterY,
      gridCellWidth
    )
    //this.phases.test()

    const scale = this.grid.scale
    let isometric = this.mode == Matrix.ISOMETRIC;

    let spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject> = new Array();
    spriteCreateFunctions['block'] = (x: integer, y: integer) => {
      return this.add.image(x, y - 30 * scale, 'block')
        .setScale(scale * (isometric ? 1.5 : 1))
    };
    spriteCreateFunctions['tile'] = (x: integer, y: integer) => {
      return this.add.image(x, y + 10 * scale, 'tile')
        .setScale(scale * (isometric ? 1.6 : 1))
    };
    spriteCreateFunctions['coin'] = (x: integer, y: integer) => {
      this.anims.create({
        key: 'gold-spining',
        frames: this.anims.generateFrameNumbers('coin-gold', { start: 0, end: 5 }),
        frameRate: 7,
        repeat: -1
      })
      return this.physics.add.sprite(x, y - 15, 'coin-gold')
        .play('gold-spining')
        .setScale(this.grid.scale)
    }

    this.groundMazeModel = new MazeModel(this, spriteCreateFunctions, DEPTH_OVERLAY_PANEL_TUTORIAL + 1);
    this.obstaclesMazeModel = new MazeModel(this, spriteCreateFunctions, DEPTH_OVERLAY_PANEL_TUTORIAL + 100);

    this.obstaclesMazeModel.onChange = () => {
      if (this.obstaclesMazeModel.count('coin') == 0) {
        this.dude.stop(true)
        this.dude.playSuccess();
        this.codeEditor.disableStepButton();
        this.codeEditor.unhighlightStepButton();
        setTimeout(function () {
          playNextPhase();
        }, 2000);
      }
    }

    let playNextPhase = () => {
      let clearCodeEditor = true;
      playPhase(this.phases.getNextPhase(), clearCodeEditor);
    }

    let replayCurrentPhase = () => {
      let clearCodeEditor = this.currentPhase?.isTutorialPhase();
      playPhase(this.currentPhase, clearCodeEditor)
    }

    let playPhase = (phase: MazePhase, clearCodeEditor: boolean = false) => {

      this.currentPhase?.clearTutorials()
      this.currentPhase = phase

      if (!this.currentPhase) {
        this.scene.start('game-win');
      }

      if (this.currentPhase) {

        this.currentPhase.setupMatrixAndTutorials()
        this.dude.matrix = this.currentPhase.obstacles;
        const obstacles = this.currentPhase.obstacles
        const ground = this.currentPhase.ground

        this.groundMazeModel.clear();
        this.obstaclesMazeModel.clearKeepingInModel(this.dude.character);
        this.groundMazeModel.setMatrixOfObjects(ground);
        this.obstaclesMazeModel.setMatrixOfObjects(obstacles);

        let { row, col } = this.currentPhase.dudeStartPosition;
        this.obstaclesMazeModel.putSprite(col, row, this.dude.character, 'rope')
        this.dude.setPosition(col, row);
        this.obstaclesMazeModel.updateBringFront();

        this.dude.currentFace = this.currentPhase.dudeFacedTo
        this.dude.setFacedTo(this.currentPhase.dudeFacedTo);

        this.codeEditor.disanimatePrograms();
        this.codeEditor.unhighlightStepButton();
        this.codeEditor.enableStepButton();
        this.codeEditor.enablePlayButton();
        if (clearCodeEditor) {
          this.codeEditor.clear();
        }

        this.currentPhase.showTutorialActionsIfExists();
      }

      // this.program.clear();
      // prog1.clear();
      // prog2.clear();
      // this.codeEditor.addCommands(this.program, ['arrow-up', 'arrow-up:if_block', 'arrow-up', 'prog_0'])
      // this.codeEditor.addCommands(prog1, ['arrow-up'])
      // this.codeEditor.addCommands(prog2, ['arrow-right', 'arrow-up', 'arrow-up', 'arrow-right', 'prog_1'])
    }

    this.dude = new Dude(this, this.mode, this.sounds, this.grid);
    this.dude.character.setScale(this.grid.scale)
    this.dude.character.displayOriginY = this.dude.character.height * 0.65;

    this.dude.canMoveTo = (x: number, y: number) => {
      let obstacles = this.currentPhase.obstacles;
      let ground = this.currentPhase.ground;
      let can = true;
      let point = obstacles.getPoint(y, x);
      let object = this.obstaclesMazeModel.getObjectAt(y, x)
      let isNotHole = ground.getKey(y, x) != 'hole';
      const isNotOutOfBounds = point != null
      const isNotBlock = object?.spriteName != 'block'
      can = isNotOutOfBounds && isNotBlock && isNotHole
      console.log('CAN_MOVE_TO [x, y, can]', x, y, can)
      return can
    }

    this.dude.isConditionValid = (condition: string, dudeMove: DudeMove) => {
      let valid = true;
      if (condition.startsWith('if_')) {
        const command = condition.replace('if_', '');
        //if (command == 'coin' || command == 'block') {
        let { x, y } = dudeMove.getAheadPosition();
        valid = this.obstaclesMazeModel.getObjectNameAt(y, x) == command
        if (valid) {
          (this.obstaclesMazeModel.getObjectAt(y, x).gameObject as GameObjects.Image).setTint(0xccff00);
        }
        //}
      }
      return valid
    }

    this.dude.onCompleteMoveCallback = (current: DudeMove) => {
      if (this.dude.stepByStep) {
        if (!this.dude.stopped) {
          this.codeEditor.enableStepButton();
          this.codeEditor.highlightStepButton();
          this.currentPhase?.updateTutorial();
        }
      }
      this.obstaclesMazeModel.onChange();
      //this.mazeModel.updateBringFront();
    }

    this.dude.onStartMoveCallback = (x: number, y: number, currentDestine: DudeMove) => {
      this.codeEditor.disableStepButton();
      this.codeEditor.disablePlayButton();
      this.codeEditor.unhighlightStepButton();
      this.obstaclesMazeModel.putSprite(x, y, undefined);
      if (currentDestine) {
        if (currentDestine.couldExecute) {
          //this.dude.character.depth = 0;
          this.obstaclesMazeModel.putSprite(currentDestine.x, currentDestine.y, this.dude.character, 'rope')
        }
      }
      this.obstaclesMazeModel.updateBringFront();
    }

    this.obstaclesMazeModel.onOverlap = (x: number, y: number, other: MazeModelObject) => {
      if (other.spriteName == 'coin') {
        let waitALittleBitBeforeColide = 700
        setTimeout(() => {
          this.children.remove(other.gameObject);
          //coin.setGravityY(-200);
          //coin.setVelocityY(-100)
          this.sounds.coin();
        }, waitALittleBitBeforeColide);
      }
    }

    this.dude.onFinishWalking = () => {
      this.codeEditor.unhighlightStepButton();
      if (this.obstaclesMazeModel.count('coin') > 0) {
        this.dude.stop(true);
        this.sounds.error();
        replayCurrentPhase();
      }
    }

    this.codeEditor.onClickRun = () => {
      if (this.dude.stopped) {
        if (this.currentPhase?.isTutorialPhase()) {
          this.currentPhase?.clearTutorials();
          this.codeEditor.disableInteractive();
        }
        this.dude.execute([this.program, prog1, prog2]);
      }
    }

    this.codeEditor.onEditProgram = () => {
      if (!this.dude.stopped) {
        replayCurrentPhase()
      }
    }

    this.codeEditor.onReplayCurrentPhase = () => {
      replayCurrentPhase();
    }

    this.codeEditor.onClickStepByStep = () => {
      this.codeEditor.disableStepButton();
      this.currentPhase?.removeBackgroundTutorialOverlay()
      this.dude.executeStepByStep([this.program, prog1, prog2]);
    }

    this.codeEditor.onInteract = () => {
      //let resetFace = true;
      //this.dude.stop();
      //initGame();
    }

    this.codeEditor.onClickStop = () => {
      let resetFace = true;
      this.dude.stop(resetFace);
      replayCurrentPhase();
    }

    playNextPhase();
  }

  init() {

  }

  update() {
    this.dude.update()
  }
}