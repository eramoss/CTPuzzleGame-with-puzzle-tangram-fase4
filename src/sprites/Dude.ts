import { Physics, Scene } from 'phaser';
import Matrix from '../geom/Matrix'
import IsometricPoint from '../geom/IsometricPoint'
import Command from '../program/Command';
import Sounds from '../sounds/Sounds';
import Program from '../program/Program';
import AlignGrid from '../geom/AlignGrid';
import { DudeMove } from './DudeMove';
import { Branch } from './Branch';
import { androidVibrate, joinChilds } from '../utils/Utils';

export default class Dude {
  character: Physics.Arcade.Sprite;
  matrix: Matrix;
  scene: Phaser.Scene;
  currentStep: DudeMove;
  x: number;
  y: number;
  stopped: boolean = true;
  stepByStep: boolean;
  onCompleteMoveCallback: (current: DudeMove) => void
  onFinishWalking: () => void = () => { };
  onStartMoveCallback: (x: number, y: number, current: DudeMove) => void
  sounds: Sounds;
  canMoveTo: (x: number, y: number) => boolean;
  isConditionValid: (condition: string, dudeMove: DudeMove) => boolean;
  programs: Program[];
  branchMoves: Array<Branch> = new Array();
  functionsRunningByTimeout: number[] = [];
  currentFace: string;
  programBeingExecuted: Program;
  grid: AlignGrid;
  tag: string;

  constructor(scene: Scene, matrixMode: string, sounds: Sounds, grid: AlignGrid) {
    this.grid = grid;
    this.sounds = sounds;
    this.scene = scene;
    this.character = scene.physics.add.sprite(485, 485, `sprite-rope-${matrixMode}`)
    this.createAnimations(matrixMode);
  }

  setTimeout(fn: Function, timeout: number) {
    this.functionsRunningByTimeout.push(setTimeout(fn, timeout))
  }

  createAnimations(matrixMode: string) {
    let isometric = matrixMode == Matrix.ISOMETRIC;
    [
      { key: 'down', frames: isometric ? [1] : [2] },
      { key: 'left', frames: isometric ? [3] : [0] },
      { key: 'up', frames: isometric ? [5] : [1] },
      { key: 'right', frames: isometric ? [7] : [3] },
      { key: 'right-up', frames: [6, 5] },
      { key: 'right-down', frames: [0, 1] },
      { key: 'left-up', frames: [4, 5] },
      { key: 'left-down', frames: [2, 1] },
      { key: 'up-left', frames: [4, 3] },
      { key: 'up-right', frames: [6, 7] },
      { key: 'down-left', frames: [2, 3] },
      { key: 'down-right', frames: [0, 7] },
    ].forEach(anim => {
      this.scene.anims.create({
        key: anim.key,
        frames: this.scene.anims.generateFrameNumbers(`sprite-rope-${matrixMode}`, anim),
        frameRate: 7,
        repeat: 0
      });
    })
  }

  moveTo(dudeMove: DudeMove) {
    this.character.clearTint()
    this.playAnimation();
    this.currentStep?.animate();
    this.scene.physics.moveToObject(this.character, dudeMove.point, 70 * this.grid.scale);
    this.onStartMoveCallback(this.x, this.y, this.currentStep);
  }

  warmBlocked() {
    //this.playAnimation(dudeMove.action);
    //this.sounds.blocked();
    androidVibrate(120)
    this.character.setTint(0xff0000);
  }

  achieved(point: IsometricPoint) {
    const distance = Phaser.Math.Distance.Between(
      this.character.x,
      this.character.y,
      point.x,
      point.y)
    return distance <= 4
  }

  resetAt(dudeMove: DudeMove) {
    console.log("MOVE_RESET_AT [x,y]", dudeMove.x, dudeMove.y)
    this.setPosition(dudeMove.x, dudeMove.y)
    let point = dudeMove.point;
    if (point) {
      this.character.body.reset(point.x, point.y);
    }
  }

  playAnimation(face: string = null) {
    this.setFacedTo(face);
  }

  setFacedTo(face: string) {
    if (!this.currentFace) {
      this.currentFace = face;
    }
    this.character.play(face || this.currentFace);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    const point: IsometricPoint = this.matrix.points[y][x]
    this.character.x = point.x
    this.character.y = point.y
  }

  stop(resetFace: boolean = false) {
    this.stopped = true;
    this.character.clearTint();
    this.character.body.stop();
    this.currentStep = null;
    this.disanimatePrograms();
    this.functionsRunningByTimeout.forEach(timeout => clearTimeout(timeout));
    this.functionsRunningByTimeout = []
    if (resetFace) {
      this.resetFace();
    }
  }

  private resetFace() {
    this.currentFace = null;
  }

  onBranch(progName: string, branch: Branch) {
    this.branchMoves.push(branch);
    let progs = this.programs.filter(p => p.name == progName)
    if (progs.length) {
      let progToExecute = progs[0]
      branch.program = progToExecute;
      this.executeProgram(progToExecute)
    }
  }

  getBranchToBackTo(): Branch {
    let branchToBack: Branch = null
    if (this.branchMoves.length) {
      let branchMove = this.branchMoves.pop();
      if (branchMove) {
        branchMove.onCompleteBranch();
        if (branchMove.dudeMove) {
          branchToBack = branchMove;
        } else {
          branchToBack = this.getBranchToBackTo()
        }
      }
    }
    return branchToBack
  }

  onCompleteMove(move: DudeMove) {
    this.character.clearTint();
    this.onCompleteMoveCallback(this.currentStep);
    if (!this.stopped) {
      this.currentStep = move.next
      if (!move.next) {
        this.continuePreviousBranchIfExists();
        this.programBeingExecuted.disanimate();
      }
      if (move.couldExecute)
        this.resetAt(move);
      if (!this.stepByStep) {
        move.disanimate();
        this.currentStep?.execute(move);
      }
      if (!this.currentStep) {
        this.setTimeout(() => {
          this.onFinishWalking()
        }, 0);
      }
    }
  }

  continuePreviousBranchIfExists() {
    let branchToBackTo = this.getBranchToBackTo()
    if (branchToBackTo) {
      this.currentStep = branchToBackTo.dudeMove
    }
  }

  update() {
    this.currentStep?.update();
  }

  executeStepByStep(programs: Program[]) {
    if (this.warnIfProgramEmpty(programs[0])) return;
    if (this.stopped) {
      let stepByStep = true;
      this.execute(programs, stepByStep);
    }
    if (!this.stopped) {
      this.currentStep?.execute();
    }
  }

  execute(programs: Program[], stepByStep: boolean = false) {
    this.stepByStep = stepByStep;
    this.stop();
    this.stopped = false;
    this.programs = programs;
    this.disanimatePrograms();
    this.executeProgram(programs[0])
  }

  disanimatePrograms() {
    (this.programs || []).forEach(p => {
      p.disanimate();
      p.disanimateCommands()
    });
  }

  executeProgram(program: Program) {
    this.programBeingExecuted?.disanimate();
    this.programBeingExecuted = program;
    this.programBeingExecuted.animate();
    this.warnIfProgramEmpty(program);
    program.disanimateCommands();
    this.setTimeout(() => {
      this.buildPath(program.ordinalCommands);
      if (!this.currentStep) {
        this.continuePreviousBranchIfExists();
      }
      this.currentStep?.execute()
    }, 200);
  }

  private warnIfProgramEmpty(program: Program) {
    const isEmpty = program.isEmpty();
    if (isEmpty) {
      program.animate();
      this.sounds.error();
      setTimeout(() => {
        this.programBeingExecuted?.disanimate();
        program.disanimate();
        this.onFinishWalking();
      }, 300);
    }
    return isEmpty;
  }

  buildPath(commands: Command[]) {
    let moves: Array<DudeMove> =
      joinChilds(commands, (c) => [c.condition, c])
        .filter(command => command != undefined)
        .map(command => new DudeMove(this, command))

    moves.forEach((move, index) => {
      if (index > 0) {
        moves[index - 1].setNext(move)
      }
    })
    this.currentStep = moves[0]
  }

  playSuccess() {
    let playAnimation = (color: number, face: string, time: number) => {
      this.setTimeout(() => {
        this.playAnimation(face);
        this.character.setTint(color)
        if (!color) { this.character.clearTint(); }
      }, time)
    }
    var animations = ['down', 'down-right', 'right', 'right-up', 'up', 'up-left', 'left', 'left-down']
    let time = 0;
    let colors = [0xff00c5, 0xffb900, 0x0299f5, 0x00cf00]
    this.sounds.success();
    animations.forEach((faceAnimation, index) => {
      let color = colors[Math.ceil(Math.random() * colors.length)]
      if (index == animations.length - 1) {
        color = null;
      }
      playAnimation(color, faceAnimation, time)
      time += 120;
    })
  }
}


