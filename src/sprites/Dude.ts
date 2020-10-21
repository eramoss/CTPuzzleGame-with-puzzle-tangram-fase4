import { Physics, Scene } from 'phaser';
import Matrix from '../geom/Matrix'
import IsometricPoint from '../geom/IsometricPoint'
import Command from '../program/Command';
import Sounds from '../sounds/Sounds';

export class DudeMove {
  point: IsometricPoint;
  matrix: Matrix;
  possibleMove: boolean;
  animation: string;
  x: integer;
  y: integer;
  previousMove: DudeMove

  constructor(matrix: Matrix, x: integer, y: integer, animation: string, previousMove: DudeMove, canMoveTo: (x: integer, y: integer) => boolean) {
    this.matrix = matrix;
    this.possibleMove = canMoveTo(x, y);
    this.x = x
    this.y = y
    if (this.possibleMove) {
      this.point = matrix.points[x][y];
    }
    this.animation = animation;
    this.previousMove = previousMove;
  }
}
export default class Dude {

  character: Physics.Arcade.Sprite;
  matrix: Matrix;
  scene: Phaser.Scene;
  step: DudeMove;
  path: DudeMove[]
  x: number;
  y: number;
  walking: boolean;
  onStepChange: (step: integer, movingTo: DudeMove) => void
  totalComands: number;
  sounds: Sounds;
  canMoveTo: (x: number, y: number) => boolean;

  constructor(scene: Scene, matrix: Matrix, sounds: Sounds) {
    this.sounds = sounds;
    this.path = new Array()
    this.scene = scene;
    this.matrix = matrix;
    [
      { key: 'walk-down', frames: [1] },
      { key: 'walk-left', frames: [0] },
      { key: 'walk-up', frames: [3] },
      { key: 'walk-right', frames: [2] },
    ].forEach(anim => {
      this.scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers('sprite-rope', anim),
        frameRate: 7,
        repeat: 1
      });
    })
    this.character = scene.physics.add.sprite(485, 485, 'sprite-rope');
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    const point: IsometricPoint = this.matrix.points[x][y]
    this.setPoint(point);
  }

  setPoint(point: IsometricPoint) {
    this.character.x = point.x
    this.character.y = point.y
  }

  move() {
    this.character.clearTint()
    if (!this.walking) {
      if (!this.step) {
        const stepCount = this.totalComands - this.path.length;
        this.step = this.path.splice(0, 1)[0]
        this.onStepChange(stepCount, this.step);
      }
      if (this.step) {
        this.character.play(this.step.animation);
        if (this.step.possibleMove) {
          this.sounds.start();
          this.scene.physics.moveToObject(this.character, this.step.point, 80)
        } else {
          this.sounds.blocked();
          this.character.setTint(0xff0000);
          this.walking = true;
          setTimeout(() => {
            this.walking = false;
            this.step = undefined
            this.move()
          }, 800)
        }
      }
    }
  }

  stop() {
    this.character.body.stop();
    this.path.splice(0);
    this.step = undefined;
  }

  update() {
    if (this.step) {
      if (this.step.point) {
        const point = this.step.point;
        const distance = Phaser.Math.Distance.Between(
          this.character.x,
          this.character.y,
          point.x,
          point.y)
        if (distance < 4) {
          this.character.body.reset(point.x, point.y);
          this.step = undefined;
          this.move();
        }
      }
    }
  }

  pushMove(x: integer, y: integer, animation: string) {
    let nextX = this.x + x;
    let nextY = this.y + y;
    let previousMove = this.path[this.path.length - 1]
    if (!previousMove) {
      const startPoint = new DudeMove(this.matrix, this.x, this.y, animation, undefined, this.canMoveTo);
      previousMove = startPoint;
    } else {
      if (!previousMove.possibleMove) {
        const possibleMove = previousMove.previousMove;
        previousMove = possibleMove;
      }
    }

    const dudeMove = new DudeMove(this.matrix, nextX, nextY, animation, previousMove, this.canMoveTo);
    this.path.push(dudeMove)
    if (dudeMove.possibleMove) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  moveUp() {
    this.pushMove(0, -1, 'walk-up');
  }

  moveDown() {
    this.pushMove(0, +1, 'walk-down');
  }

  moveLeft() {
    this.pushMove(-1, 0, 'walk-left');
  }

  moveRight() {
    this.pushMove(+1, 0, 'walk-right');
  }

  execute(commands: Command[]) {
    this.buildPath(commands);
    this.move();
  }

  buildPath(commands: Command[]) {
    this.path.splice(0);
    this.totalComands = commands.length
    commands.forEach(command => {
      this[command.getAction()]()
    })
  }
}
