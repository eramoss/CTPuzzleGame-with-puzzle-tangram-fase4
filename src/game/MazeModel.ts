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
  getObjectAt(y: number, x: number): MazeModelObject {
    let object: MazeModelObject = null
    let row = this.gameObjects[y];
    if (row) {
      object = row[x]
    }
    return object
  }

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
          const point = matrix.points[y][x];
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

    let diagonalsToPass = (this.matrix.height + this.matrix.width) - 1;
    let itensDiagonalToPass = 1;
    let depth = 10;
    for (let diagonalsPassed = 0; diagonalsPassed < diagonalsToPass;) {
      let y = diagonalsPassed;
      let x = 0;
      for (let itensDiagonalPassed = 0; itensDiagonalPassed < itensDiagonalToPass; itensDiagonalPassed++) {
        x++;
        y--;
        let object = this.getObjectAt(y, x);
        if (object) {
          console.log('MAZE_MODEL_ORDERING [y,x]', y, x);
          (object.gameObject as GameObjects.Sprite).depth = depth
          //this.scene.children.bringToTop(object.gameObject);
        }
      }
      depth++;
      diagonalsPassed++;
      itensDiagonalToPass++;
    }

    this.logMatrix();
  }

  logMatrix() {
    let logMatrix = '\n';
    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let c = '-';
        let object = this.getObjectAt(y, x);
        if (object) {
          c = this.obstaclesMatrix[y][x].toString();
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

  putSprite(x: number, y: number, sprite: GameObjects.GameObject, spriteNumber: number = -1) {
    let object = null;
    if (sprite) {
      object = new MazeModelObject(sprite, spriteNumber)
    }
    this.gameObjects[y][x] = object
  }

}
