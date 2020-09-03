import { GameObjects, Game, Scene } from "phaser";
import drawRect from "../utils/Utils";

export default class FlexFlow {


    children: (GameObjects.Sprite | GameObjects.Image)[]

    scene: Scene;
    flow: string = 'row'
    width: number;
    height: number;
    x: number;
    y: number;
    constructor(scene: Scene) {
        this.scene = scene;
        this.children = []
        this.width = this.scene.game.config.width as number
        this.height = this.scene.game.config.height as number
    }

    organizeSelf() {
        const countObjs = this.children.length;
        let { dimension, axis, inverseDimension, inverseAxis } = this.getDimension()
        const positionEach: number = this[dimension] as number / countObjs;
        this.children.forEach((child, index) => {
            if (child) {
                child[inverseAxis] = this[inverseAxis] + this[inverseDimension] / 2
                child[axis] = this[axis] + (index + 0.5) * positionEach
            }
        })
        drawRect(this.scene, this.x, this.y, this.width, this.height)
    }
    getDimension(): { dimension: string; axis: string; inverseDimension: string, inverseAxis: string } {
        if (this.flow === 'column') {
            return { dimension: 'height', axis: 'y', inverseDimension: 'width', inverseAxis: 'x' }
        }
        if (this.flow === 'row') {
            return { dimension: 'width', axis: 'x', inverseDimension: 'height', inverseAxis: 'y' }
        }
    }

    setChildAt(child: GameObjects.Sprite, index: number) {
        this.children.splice(index, 1, child);
        this.organizeSelf();
    }

    addChild(child: GameObjects.Sprite | GameObjects.Image) {
        this.children.push(child)
        this.organizeSelf()
    }
}