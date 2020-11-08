import { GameObjects, Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import { DEPTH_OVERLAY_PANEL_TUTORIAL } from "../scenes/Game";
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
    backgroundOverlay: GameObjects.Sprite;

    dudeFacedTo: string = 'right'
    dudeStartPosition: { row: number, col: number } = { row: 0, col: 0 }

    constructor(scene: Scene, grid: AlignGrid) {
        this.scene = scene;
        this.grid = grid;
    }

    addHighlight(fnGetSprite: () => GameObjects.Sprite | GameObjects.Image) {
        this.addTutorialHighlights([new TutorialHighlight(this.scene, this.grid, fnGetSprite)])
    }

    addTutorialHighlights(highlights: Array<TutorialHighlight>) {
        const tutorialAction = new TutorialAction(this.scene, highlights);
        tutorialAction.onHighlight = () => {
            this.addBackgroundOverlay()
        }
        if (!this.firstAction) {
            this.firstAction = tutorialAction
        } else {
            this.action.nextTutorialAction = tutorialAction;
        }
        this.action = tutorialAction;
    }

    executeTutorialOrStartWithoutTutorial() {
        this.firstAction?.highlight();
    }

    isTutorialPhase() {
        return this.firstAction != null
    }

    clearTutorials() {
        this.removeBackgroundOverlay();
        let action = this.firstAction;
        while (action != null) {
            action.reset();
            action = action.nextTutorialAction
        }
    }

    addBackgroundOverlay() {
        if (!this.backgroundOverlay) {
            this.backgroundOverlay = this.scene.add.sprite(0, 0, 'tutorial-block-click-background')
                .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
            this.grid.placeAt(0, 0, this.backgroundOverlay, this.grid.cols, this.grid.rows);
        }
    }

    removeBackgroundOverlay() {
        if (this.backgroundOverlay) {
            this.scene.children.remove(this.backgroundOverlay);
            this.backgroundOverlay = null;
        }
    }
}