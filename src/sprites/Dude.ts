import { Physics, Scene } from 'phaser';
import Matrix from '../geom/Matrix'
import IsometricPoint from '../geom/IsometricPoint'
import Command from '../program/Command';
import Sounds from '../sounds/Sounds';
import Program from '../program/Program';

export class DudeMove {

  name: string;
  dude: Dude;
  action: string;
  point: IsometricPoint;
  x: number;
  y: number;
  next?: DudeMove;
  executing: boolean = false;
  couldExecute: boolean;
  command: Command;

  // move / current face / action (x,y) / new face

  prepareMove(x: number, y: number, move: string, currentFace: string): { newX: number, newY: number, newFace: string, animation: string } {
    let newFace = currentFace;
    let newX = x;
    let newY = y;

    if (move == 'down') {
      if (currentFace == 'up') { newX; newY++; }
      if (currentFace == 'down') { newX; newY--; }
      if (currentFace == 'left') { newX++; newY; }
      if (currentFace == 'right') { newX--; newY; }
    }

    if (move == 'up') {
      if (currentFace == 'up') { newX; newY--; }
      if (currentFace == 'down') { newX; newY++; }
      if (currentFace == 'left') { newX--; newY; }
      if (currentFace == 'right') { newX++; newY; }
    }

    if (move == 'right') {
      if (currentFace == 'up') { newFace = 'right'; }
      if (currentFace == 'down') { newFace = 'left'; }
      if (currentFace == 'left') { newFace = 'up'; }
      if (currentFace == 'right') { newFace = 'down'; }
    }

    if (move == 'left') {
      if (currentFace == 'up') { newFace = 'left'; }
      if (currentFace == 'down') { newFace = 'right'; }
      if (currentFace == 'left') { newFace = 'down'; }
      if (currentFace == 'right') { newFace = 'up'; }
    }
    let animation = newFace
    if (this.dude.matrix.mode == Matrix.ISOMETRIC) {
      animation = currentFace + "-" + newFace;
    }

    return { newX, newY, newFace, animation }
  }

  constructor(dude: Dude, command: Command) {
    this.dude = dude;
    this.command = command;
    this.action = command.getAction();
  }



  update() {
    if (this.executing) {
      if (this.point) {
        if (this.dude.achieved(this.point)) {
          console.log("MOVE_ACHIEVED [x,y]", this.x, this.y)
          this.onCompleteMove();
        }
      }
    }
  }

  animate() {
    console.log('animate');
    this.command.animateSprite();
  }

  disanimate() {
    this.command.disanimateSprite();
  }

  onCompleteMove() {
    this.disanimate();
    this.dude.onCompleteMove(this);
  }

  onBranchMove() {
    let onCompleteBranch = () => {
      this.disanimate();
    }
    const moveToContinueWhenBackToThisBranch = this.next;
    const progToCall = this.action;
    let branch = new Branch(moveToContinueWhenBackToThisBranch, onCompleteBranch);
    this.dude.onBranch(progToCall, branch);
  }

  execute(previousMove: DudeMove = null) {
    console.log("DUDE_MOVE", this.action)
    this.executing = true;

    this.animate();

    this.command.sprite.setTint(0xffff00);
    this.dude.setTimeout(() => {
      this.command.sprite.clearTint();
      //this.disanimate();
    }, 80);

    let x: number, y: number;
    if (previousMove == null) {
      x = this.dude.x
      y = this.dude.y
    } else {
      x = previousMove.x
      y = previousMove.y
    }

    let { newX, newY, newFace, animation } = this.prepareMove(x, y, this.action, this.dude.currentFace);
    if (newX) x = newX;
    if (newY) y = newY;
    this.dude.currentFace = newFace;
    this.couldExecute = this.dude.canMoveTo(x, y);

    if (this.couldExecute) {
      this.x = x;
      this.y = y;
    }

    let branched = this.isProgMove();
    let turnMove = this.action == 'left' || this.action == 'right';

    if (branched) {
      this.onBranchMove();
    }

    if (turnMove) {
      this.dude.setTimeout(() => { this.onCompleteMove(); }, 600);
      this.dude.playAnimation(animation);
    }

    if (!branched && !turnMove) {
      console.log('MOVE [x,y]', x, y)
      if (this.couldExecute) {
        this.point = this.dude.matrix.getPoint(y, x);
        this.dude.moveTo(this);
      } else {
        this.dude.warmBlocked();
        this.dude.setTimeout(() => {
          this.onCompleteMove();
        }, 500);
      }
    }
  }

  isProgMove() {
    return this.action.indexOf('prog') > -1
  }
}
export default class Dude {

  character: Physics.Arcade.Sprite;
  matrix: Matrix;
  scene: Phaser.Scene;
  currentStep: DudeMove;
  x: number;
  y: number;
  walking: boolean;
  onStepChange: (movingTo: DudeMove) => void
  sounds: Sounds;
  canMoveTo: (x: number, y: number) => boolean;
  programs: Program[];
  branchMoves: Array<Branch> = new Array();
  functionsRunningByTimeout: number[] = [];
  currentFace: string;
  initialFace: string;

  constructor(scene: Scene, matrix: Matrix, sounds: Sounds) {
    this.sounds = sounds;
    this.scene = scene;
    this.matrix = matrix;
    this.character = scene.physics.add.sprite(485, 485, `sprite-rope-${matrix.mode}`);
    this.createAnimations();
  }

  setTimeout(fn: Function, timeout: number) {
    this.functionsRunningByTimeout.push(setTimeout(fn, timeout))
  }

  createAnimations() {
    let isometric = this.matrix.mode == Matrix.ISOMETRIC;
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
        frames: this.scene.anims.generateFrameNumbers(`sprite-rope-${this.matrix.mode}`, anim),
        frameRate: 7,
        repeat: 0
      });
    })
  }

  moveTo(dudeMove: DudeMove) {
    this.character.clearTint()
    this.sounds.start();
    this.playAnimation();
    this.scene.physics.moveToObject(this.character, dudeMove.point, 40);
    this.onStepChange(this.currentStep);
  }

  warmBlocked() {
    //this.playAnimation(dudeMove.action);
    this.sounds.blocked();
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
    if (!this.currentFace) {
      this.currentFace = face;
      if (!this.initialFace) {
        this.initialFace = face;
      }
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

  stop() {
    this.character.clearTint();
    this.character.body.stop();
    this.currentStep = null;
    this.disanimatePrograms();
    this.functionsRunningByTimeout.forEach(timeout => clearTimeout(timeout));
    this.functionsRunningByTimeout = []
    this.currentFace = null;
    this.playAnimation(this.initialFace);
  }

  onBranch(progName: string, branch: Branch) {
    this.branchMoves.push(branch);
    let progs = this.programs.filter(p => p.name == progName)
    if (progs.length) {
      this.executeProgram(progs[0])
    }
  }

  getBranchToBackTo(): Branch {
    let branchToBack: Branch = null
    if (this.branchMoves.length) {
      let branchMove = this.branchMoves.pop();
      if (branchMove) {
        branchMove.onComplete();
        if (branchMove.dudeMove) {
          branchToBack = branchMove;
        } else {
          branchToBack = this.getBranchToBackTo()
        }
      }
    }
    return branchToBack
  }

  onCompleteMove(previousMove: DudeMove) {
    this.character.clearTint();
    this.currentStep = previousMove.next
    if (!previousMove.next) {
      this.continuePreviousBranchIfExists();
    }
    if (previousMove.couldExecute)
      this.resetAt(previousMove);
    this.currentStep?.execute(previousMove);
  }

  continuePreviousBranchIfExists() {
    let branchToBackTo = this.getBranchToBackTo()
    if (branchToBackTo) {
      this.currentStep = branchToBackTo.dudeMove
    }
  }

  update() {
    if (this.currentStep) {
      this.currentStep?.update();
    }
  }

  execute(programs: Program[]) {
    this.stop();
    this.programs = programs;
    this.disanimatePrograms();
    this.executeProgram(programs[0])
  }

  disanimatePrograms() {
    (this.programs || []).forEach(p => p.disanimateCommands());
  }

  executeProgram(program: Program) {
    program.disanimateCommands();
    this.setTimeout(() => {
      this.buildPath(program.commands);
      if (!this.currentStep) {
        this.continuePreviousBranchIfExists();
      }
      this.currentStep?.execute()
    }, 200);
  }

  buildPath(commands: Command[]) {
    let moves: Array<DudeMove> = commands
      .map(command => new DudeMove(this, command))
    moves.forEach((move, index) => {
      if (index > 0) {
        moves[index - 1].next = move
      }
    })
    this.currentStep = moves[0]
  }
}

class Branch {
  dudeMove: DudeMove
  onComplete: Function

  constructor(dudeMove: DudeMove, onComplete: Function) {
    this.dudeMove = dudeMove;
    this.onComplete = onComplete;
  }
}