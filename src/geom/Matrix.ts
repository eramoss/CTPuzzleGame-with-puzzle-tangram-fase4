import IsometricPoint from './IsometricPoint'
import { Scene } from 'phaser'

export default class Matrix {

  static ISOMETRIC = "ISOMETRIC"
  static NORMAL = "NORMAL"

  scene: Phaser.Scene;
  x: number;
  y: number;
  points: IsometricPoint[][];
  width: number;
  height: number;
  matrix: number[][];
  mode: String;

  constructor(scene: Scene, mode: String = Matrix.NORMAL, matrix: integer[][], x: integer, y: integer, distanceBetweenPoints: integer) {
    this.mode = mode;
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.matrix = matrix;

    this.points = []
    for (let y = 0; y < matrix.length; y++)
      this.points[y] = []

    this.height = matrix.length;
    this.width = matrix[0].length;

    if (mode == Matrix.NORMAL) {
      this.x = this.x - (distanceBetweenPoints * this.width) / 2
    }
    this.y = this.y - (distanceBetweenPoints * this.height) / 2


    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000)

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let point: IsometricPoint = new IsometricPoint(x * distanceBetweenPoints, y * distanceBetweenPoints)
        if (mode == Matrix.NORMAL)
          point.toCartesian()

        point.x += this.x
        point.y += this.y

        if (scene.game.config.physics.arcade?.debug) {
          const pt = new Phaser.Geom.Point(point.x, point.y);
          this.scene.add.text(pt.x, pt.y, `(${pt.y.toFixed(2)})`);
          graphics.fillCircle(pt.x, pt.y, 3);
        }
        this.points[y][x] = point
      }
    }
  }

  getPoint(y: number, x: number): IsometricPoint {
    let point = null
    const row = this.points[y];
    if (row) {
      point = row[x];
    }
    return point;
  }
}
