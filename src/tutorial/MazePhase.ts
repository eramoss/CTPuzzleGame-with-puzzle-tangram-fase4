import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import TutorialAction from "./TutorialAction";

export default class MazePhase {
    setupTutorialsAndObjectsPositions: () => void;
    clear() {
        this.action?.reset()
    }

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

    addClickTutorialAction(fnGetSprite: () => GameObjects.Sprite | GameObjects.Image) {
        this.addAction('click', fnGetSprite)
    }

    addAction(actionName: string, fnGetSprite: () => GameObjects.Sprite | GameObjects.Image) {
        const action = new TutorialAction(this.scene, this.grid, actionName, fnGetSprite);
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