import IsometricPoint from './IsometricPoint'
import { Scene } from 'phaser'

export default class Matrix {
  scene: Phaser.Scene;
  x: number;
  y: number;
  points: IsometricPoint[][];
  constructor(scene: Scene, x: integer, y: integer, distanceBetweenPoints: integer) {
    this.x = x;
    this.y = y;
    this.scene = scene;

    const matrix: integer[][] = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ]

    this.points = []
    for (let y = 0; y < matrix.length; y++)
      this.points[y] = []

    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000)

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        let point: IsometricPoint = new IsometricPoint(x * distanceBetweenPoints, y * distanceBetweenPoints)
        point.x += this.x
        point.y += this.y

        if (scene.game.config.physics.arcade?.debug) {
          const pt = new Phaser.Geom.Point(point.x, point.y);
          this.scene.add.text(pt.x, pt.y, `(${pt.y})`);
          graphics.fillCircle(pt.x, pt.y, 3);
        }
        this.points[x][y] = point
      }
    }
  }
}
