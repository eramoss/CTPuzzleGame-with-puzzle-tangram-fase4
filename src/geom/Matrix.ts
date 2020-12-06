import IsometricPoint from './IsometricPoint'
import { Scene } from 'phaser'
import { isDebug } from '../utils/Utils';

export default class Matrix {

  static MODE_ISOMETRIC = "ISOMETRIC"
  static MODE_NORMAL = "NORMAL"

  scene: Phaser.Scene;
  x: number;
  y: number;
  points: IsometricPoint[][];
  width: number;
  height: number;
  matrix: string[][];
  mode: string = Matrix.MODE_NORMAL;

  constructor(scene: Scene, mode: string, matrix: string[][], x: integer, y: integer, distanceBetweenPoints: integer) {
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

    if (mode == Matrix.MODE_NORMAL) {
      this.x = this.x - (distanceBetweenPoints * this.width) / 2
    }
    this.y = this.y - (distanceBetweenPoints * this.height) / 2


    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000)

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        let point: IsometricPoint = new IsometricPoint(col * distanceBetweenPoints, row * distanceBetweenPoints)
        if (mode == Matrix.MODE_NORMAL)
          point.toCartesian()

        point.x += this.x
        point.y += this.y

        if (isDebug(scene)) {
          const pt = new Phaser.Geom.Point(point.x, point.y);
          this.scene.add.text(pt.x, pt.y, `(${pt.y.toFixed(2)})`);
          graphics.fillCircle(pt.x, pt.y, 3);
        }
        this.points[row][col] = point
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

  getKey(y: number, x: number): string {
    let key = null
    const row = this.matrix[y];
    if (row) {
      key = row[x];
    }
    return key;
  }

  getTotalElements(): number {
    return this.width * this.height
  }
}
