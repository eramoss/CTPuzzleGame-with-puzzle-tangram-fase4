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

  constructor(matrix: Matrix, x: integer, y: integer, animation: string, previousMove: DudeMove) {
    this.matrix = matrix;
    this.possibleMove = this.canMoveTo(x, y);
    this.x = x
    this.y = y
    if (this.possibleMove) {
      this.point = matrix.points[x][y];
    }
    this.animation = animation;
    this.previousMove = previousMove;
  }
  canMoveTo(x: number, y: number) {
    return !!(this.matrix.points[x] && this.matrix.points[x][y]);
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
  onStepChange: (step: integer, current: DudeMove) => void
  totalComands: number;
  sounds: Sounds;

  constructor(scene: Scene, matrix: Matrix, sounds: Sounds) {
    this.sounds = sounds;
    this.path = new Array()
    this.scene = scene;
    this.matrix = matrix;
    [
      { key: 'walk-down', frames: [1, 2, 0] },
      { key: 'walk-left', frames: [4, 5, 3] },
      { key: 'walk-up', frames: [6, 7, 8] },
      { key: 'walk-right', frames: [9, 10, 11] },
    ].forEach(anim => {
      this.scene.anims.create({
        key: anim.key,
        frames: scene.anims.generateFrameNumbers('sprite-boy', anim),
        frameRate: 7,
        repeat: 1
      });
    })
    this.character = scene.physics.add.sprite(485, 485, 'sprite-boy');
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
    this.setPosition(this.x, this.y)
    this.path.splice(0)
    this.character.body.stop();
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
      // Guardo ponto de partida
      previousMove = new DudeMove(this.matrix, this.x, this.y, animation, undefined);
    }
    const dudeMove = new DudeMove(this.matrix, nextX, nextY, animation, previousMove);
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
    this.stop()
    this.totalComands = commands.length
    commands.forEach(command => {
      this[command.getAction()]()
    })
    this.move();
  }
}
