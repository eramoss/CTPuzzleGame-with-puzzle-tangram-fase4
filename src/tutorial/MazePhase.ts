import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import TutorialAction from "./TutorialAction";
import TutorialHighlight from "./TutorialHighlight";

export default class MazePhase {

    setupTutorialsAndObjectsPositions: () => void;
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

    addTutorialHighlights(highlights: Array<TutorialHighlight>) {
        const action = new TutorialAction(this.scene, this.grid, highlights);
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

    clear() {
        this.firstAction?.reset()
        this.action?.reset()
        let action = this.firstAction;
        while (action != null) {
            action.reset();
            action = action.next
        }
    }

}