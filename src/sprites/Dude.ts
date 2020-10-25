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

  constructor(dude: Dude, action: string) {
    this.dude = dude;
    this.action = action;
  }

  update() {
    if (this.executing) {
      if (this.point) {
        if (this.dude.achieved(this.point)) {
          console.log("MOVE_ACHIEVED [x,y]", this.x, this.y)
          this.dude.onCompleteMove(this)
        }
      }
    }
  }

  execute(previousMove: DudeMove = null) {
    console.log("DUDE_MOVE", this.action)

    this.executing = true;

    let x: number, y: number;
    if (previousMove == null) {
      x = this.dude.x
      y = this.dude.y
    } else {
      x = previousMove.x
      y = previousMove.y
    }

    console.log("DUDE")

    let backupX = x;
    let backupY = y;

    switch (this.action) {
      case 'moveDown': y++; break;
      case 'moveUp': y--; break;
      case 'moveRight': x++; break;
      case 'moveLeft': x--; break;
      default:
        break;
    }

    this.x = x;
    this.y = y;
    console.log('MOVE [x,y]', x, y)
    console.log('MOVE_BACKUP [x,y]', backupX, backupY)

    this.couldExecute = this.dude.canMoveTo(x, y)
    if (this.couldExecute) {
      this.point = this.dude.matrix.getPoint(y, x);
      this.dude.moveTo(this)
    } else {
      this.dude.warmBlocked(this)
      this.x = backupX;
      this.y = backupY;
      setTimeout(() => {
        this.dude.onCompleteMove(this)
      }, 500);
    }
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
  onStepChange: (step: integer, movingTo: DudeMove) => void
  sounds: Sounds;
  canMoveTo: (x: number, y: number) => boolean;

  constructor(scene: Scene, matrix: Matrix, sounds: Sounds) {
    this.sounds = sounds;
    this.scene = scene;
    this.matrix = matrix;
    this.character = scene.physics.add.sprite(485, 485, 'sprite-rope');
    this.createAnimations();
  }

  createAnimations() {
    [
      { key: 'moveDown', frames: [2] },
      { key: 'moveLeft', frames: [0] },
      { key: 'moveUp', frames: [1] },
      { key: 'moveRight', frames: [3] },
    ].forEach(anim => {
      this.scene.anims.create({
        key: anim.key,
        frames: this.scene.anims.generateFrameNumbers('sprite-rope', anim),
        frameRate: 7,
        repeat: 1
      });
    })
  }

  moveTo(dudeMove: DudeMove) {
    this.character.clearTint()
    this.sounds.start();
    this.playAnimation(dudeMove.action);
    this.scene.physics.moveToObject(this.character, dudeMove.point, 40);
  }

  warmBlocked(dudeMove: DudeMove) {
    this.playAnimation(dudeMove.action);
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
    this.character.body.reset(dudeMove.point.x, dudeMove.point.y);
  }

  playAnimation(action: string) {
    this.character.play(action);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    const point: IsometricPoint = this.matrix.points[y][x]
    this.character.x = point.x
    this.character.y = point.y
  }

  stop() {
    this.character.body.stop();
  }

  onCompleteMove(previousMove: DudeMove) {
    if (!previousMove.next) {
      this.character.clearTint();
    }
    this.currentStep = previousMove.next
    if (previousMove.couldExecute)
      this.resetAt(previousMove);
    this.currentStep?.execute(previousMove);
  };

  update() {
    if (this.currentStep) {
      this.currentStep?.update();
    }
  }

  execute(programs: Program[]) {
    this.buildPath(programs[0].commands);
    this.currentStep?.execute()
  }

  buildPath(commands: Command[]) {
    let moves: Array<DudeMove> = commands
      .map(command => new DudeMove(this, command.getAction()))
    moves.forEach((move, index) => {
      if (index > 0) {
        moves[index - 1].next = move
      }
    })
    this.currentStep = moves[0]
  }
}
