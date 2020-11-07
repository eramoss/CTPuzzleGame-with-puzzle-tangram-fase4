import { GameObjects, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import TutorialAction from "./TutorialAction";

export default class MazePhase {

    obstacles: Matrix;
    ground: Matrix;
    scene: Scene;
    grid: AlignGrid
    firstAction: TutorialAction;
    action: TutorialAction;
    next: MazePhase

    dudeFacedTo: string = 'right'
    dudeStartPosition: { row: number, col: number } = { row: 0, col: 0 }

    constructor(scene: Scene, grid: AlignGrid) {
        this.scene = scene;
        this.grid = grid;
    }

    addClickTutorialAction(sprite: GameObjects.Sprite | GameObjects.Image) {
        this.addAction('click', sprite)
    }

    addAction(actionName: string, sprite: GameObjects.Sprite | GameObjects.Image) {
        const action = new TutorialAction(this.scene, this.grid, actionName, sprite);
        if (!this.firstAction) {
            this.firstAction = action
        } else {
            this.action.next = action;
        }
        this.action = action;
    }

    executeTutorialOrStartWithoutTutorial() {
        this.firstAction.execute();
    }

}