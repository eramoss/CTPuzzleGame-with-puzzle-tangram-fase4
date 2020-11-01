import { GameObjects } from "phaser";
import Matrix from "../geom/Matrix";

export class MazeModelObject {
  gameObject: GameObjects.GameObject;
  spriteName: string

  constructor(gameObject: GameObjects.GameObject, spriteName: string) {
    this.gameObject = gameObject;
    this.spriteName = spriteName;
  }
}

export default class MazeModel {

  gameObjects: MazeModelObject[][]
  matrix: Matrix;
  scene: Phaser.Scene;
  obstaclesMatrix: string[][];
  spriteCreateFunctions: ((x: integer, y: integer) => GameObjects.GameObject)[];
  onOverlap: (x: number, y: number, other: MazeModelObject) => void;

  constructor(
    scene: Phaser.Scene,
    matrix: Matrix,
    spriteCreateFunctions: Array<(x: integer, y: integer) => GameObjects.GameObject>) {

    this.scene = scene;
    this.matrix = matrix;
    this.gameObjects = []
    this.obstaclesMatrix = matrix.matrix;
    this.spriteCreateFunctions = spriteCreateFunctions;
    this.buildObjectsModel();
  }

  private buildObjectsModel() {
    for (let y = 0; y < this.matrix.height; y++) {
      if (!this.gameObjects[y]) {
        this.gameObjects[y] = [];
      }
      for (let x = 0; x < this.matrix.width; x++) {
        const spriteNumber = this.obstaclesMatrix[y][x];
        let spriteCreateFn = this.spriteCreateFunctions[spriteNumber];
        if (spriteCreateFn) {
          // Cria os objeto e adiciona no ponto
          const point = this.matrix.points[y][x];
          const gameObject = spriteCreateFn(point.x, point.y);
          this.gameObjects[y][x] = new MazeModelObject(gameObject, spriteNumber);
        }
      }
    }
  }

  getObjectAt(y: number, x: number): MazeModelObject {
    let object: MazeModelObject = null
    let row = this.gameObjects[y];
    if (row) {
      object = row[x]
    }
    return object
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
    let depth = 0;
    for (let diagonalsPassed = 0; diagonalsPassed < diagonalsToPass;) {
      let y = diagonalsPassed;
      let x = 0;
      for (let itensDiagonalPassed = 0; itensDiagonalPassed < itensDiagonalToPass; itensDiagonalPassed++) {
        let object = this.getObjectAt(y, x);
        if (object) {
          console.log('MAZE_MODEL_ORDERING [y,x,object,depth]', y, x, object.spriteName, depth);
          (object.gameObject as GameObjects.Sprite).setDepth(depth)
          //this.scene.children.bringToTop(object.gameObject);
        }
        x++;
        y--;
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
        let c = ' ';
        let object = this.getObjectAt(y, x);
        let depth: number = 0;
        if (object) {
          depth = (object.gameObject as GameObjects.Sprite).depth
          c = this.obstaclesMatrix[y][x];
        }
        logMatrix += `${c.substring(0, 1)}[${depth}] `;
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

  putSprite(x: number, y: number, sprite: GameObjects.GameObject, spriteName: string = null) {
    const existentObjectOnPosition = this.getObjectAt(y, x);
    if (sprite) {
      if (existentObjectOnPosition) {
        this.onOverlap(x, y, existentObjectOnPosition);
      }
    }
    let object: MazeModelObject = null;
    if (sprite) {
      object = new MazeModelObject(sprite, spriteName)
    }
    this.gameObjects[y][x] = object
  }

  clearKeepingInModel(keepInModel: GameObjects.GameObject) {

    for (let y = 0; y < this.matrix.height; y++) {
      for (let x = 0; x < this.matrix.width; x++) {
        let object = this.getObjectAt(y, x);
        if (object) {
          if (object.gameObject != keepInModel) {
            this.scene.children.remove(object.gameObject);
          } else {
            this.gameObjects[y][x] = null;
          }
        }
      }
    }
    this.buildObjectsModel();
  }

  getObjectNameAt(y: number, x: number): string {
    return this.getObjectAt(y, x)?.spriteName
  }

}
