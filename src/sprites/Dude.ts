import { Physics, Scene } from 'phaser';
import Matrix from '../geom/Matrix'
import IsometricPoint from '../geom/IsometricPoint'

export default class Dude {
  character: Physics.Arcade.Sprite;
  matrix: Matrix;
  scene: Phaser.Scene;
  destination: IsometricPoint;
  path: IsometricPoint[]
  x: number;
  y: number;

  constructor(scene: Scene, matrix: Matrix) {
    this.path = new Array()
    this.scene = scene;
    this.matrix = matrix;
    this.character = scene.physics.add.sprite(490, 490, 'x');
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    const point: IsometricPoint = this.matrix.points[x][y]
    this.character.x = point.x
    this.character.y = point.y
  }

  move() {
    if (!this.destination) {
      this.destination = this.path.splice(0, 1)[0]
    }
    if (this.destination) {
      this.scene.physics.moveTo(this.character, this.destination.x, this.destination.y, 100)
    }
  }

  update() {
    if (this.destination) {
      if (Math.abs(Math.floor(this.character.x) - this.destination.x) < 10 &&
        Math.abs(Math.floor(this.character.y) - this.destination.y) < 10) {
        this.character.body.stop()
        this.destination = undefined
        this.move();
      }
    }
  }

  canMoveTo(x: number, y: number) {
    return !!(this.matrix.points[x] && this.matrix.points[x][y]);
  }

  moveTo(x: number, y: number) {
    const point: IsometricPoint = this.matrix.points[x][y]
    this.path.push(point)
    this.move();
  }

  advance(x: integer, y: integer) {
    let nextX = this.x + x;
    let nextY = this.y + y;
    if (this.canMoveTo(nextX, nextY)) {
      this.moveTo(nextX, nextY);
      this.x = nextX;
      this.y = nextY;
    }
  }

  moveUp() {
    this.advance(0, -1);
  }

  moveDown() {
    this.advance(0, +1);
  }

  moveLeft() {
    this.advance(-1, 0)
  }

  moveRight() {
    this.advance(+1, 0)
  }

}
