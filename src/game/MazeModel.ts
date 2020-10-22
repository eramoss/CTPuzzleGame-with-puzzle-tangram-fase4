import { GameObjects } from "phaser";
import Matrix from "../geom/Matrix";

class MazeModelObject {
  gameObject: GameObjects.GameObject;
  spriteNumber: number

  constructor(gameObject: GameObjects.GameObject, spriteNumber: number) {
    this.gameObject = gameObject;
    this.spriteNumber = spriteNumber;
  }
}

export default class MazeModel {

  gameObjects: MazeModelObject[][]
  matrix: Matrix;
  scene: Phaser.Scene;
  obstaclesMatrix: number[][];

  constructor(scene: Phaser.Scene, matrix: Matrix, spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject>) {
    this.scene = scene;
    this.matrix = matrix;
    this.gameObjects = []
    this.obstaclesMatrix = matrix.matrix;

    for (let y = 0; y < matrix.height; y++) {
      if (!this.gameObjects[y]) {
        this.gameObjects[y] = [];
      }
      for (let x = 0; x < matrix.width; x++) {
        const spriteNumber = this.obstaclesMatrix[y][x];
        let spriteCreateFn = spriteCreateFunctions[spriteNumber]
        if (spriteCreateFn) {
          // Cria os objeto e adiciona no ponto
          const point = matrix.points[x][y];
          const gameObject = spriteCreateFn(point.x, point.y);
          this.gameObjects[y][x] = new MazeModelObject(gameObject, spriteNumber);
        }
      }
    }
  }

  updateBringFront() {
    if (this.matrix.mode == Matrix.ISOMETRIC) {
      this.updateIsometric()
    }
    if (this.matrix.mode == Matrix.NORMAL) {
      this.updateByZIndex()
    }
  }

  private updateIsometric() {
    let logMatrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let c = '-';
        let object = this.gameObjects[y][x];
        if (object) {
          c = this.obstaclesMatrix[y][x].toString();
          this.scene.children.bringToTop(object.gameObject);
        }
        logMatrix += c + ' ';
      }
      logMatrix += '\n';
    }
    console.log('GAME_OBJECTS', logMatrix)
  }

  private updateByZIndex() {
    /* let logMatrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let c = '-';
        let object = this.gameObjects[y][x];
        if (object) {
          c = this.obstaclesMatrix[y][x].toString();
          this.scene.children.bringToTop(object);
        }
        logMatrix += c + ' ';
      }
      logMatrix += '\n';
    }
    console.log('GAME_OBJECTS', logMatrix) */
  }

  putSprite(x: number, y: number, sprite: GameObjects.GameObject, zIndex: number = -1) {
    this.gameObjects[y][x] = new MazeModelObject(sprite, zIndex)
  }

}
