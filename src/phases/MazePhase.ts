import { GameObjects, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import { MecanicaRope } from "../ct-platform-classes/MecanicaRope";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import InterfaceElement from "../InterfaceElement";
import { Logger } from "../main";
import TutorialAction from "./TutorialAction";
import TutorialDropLocation from "./TutorialDropLocation";
import TutorialHighlight from "./TutorialHighlight";

export default class MazePhase {

    setupTutorialsAndObjectsPositions: () => void;
    obstacles: Matrix;
    ground: Matrix;
    scene: Scene;
    grid: AlignGrid
    itemId: number

    firstAction: TutorialAction;
    action: TutorialAction;
    //actions: TutorialAction[] = [];

    next: MazePhase
    backgroundOverlay: GameObjects.Sprite;

    dudeFacedTo: string = 'right'
    dudeStartPosition: { row: number, col: number } = { row: 0, col: 0 }
    codeEditor: CodeEditor;
    mecanicaRope: MecanicaRope;

    constructor(scene: Scene, codeEditor: CodeEditor) {
        this.scene = scene;
        this.grid = codeEditor.grid;
        this.codeEditor = codeEditor;
    }

    setupMatrixAndTutorials() {
        this.clearTutorials();
        this.setupTutorialsAndObjectsPositions();
    }

    addTutorialHighlightDrag(
        fnGetInterfaceElement: () => InterfaceElement,
        fnGetDropLocation: () => TutorialDropLocation,
    ): TutorialAction {
        const action = this.addTutorialHighlight(fnGetInterfaceElement, fnGetDropLocation);
        action.highlights.forEach(highlight => highlight.continueTutorialOnDrag = true)
        return action
    }

    addTutorialHighlightClick(
        fnGetInterfaceElement: () => InterfaceElement,
        fnGetDropLocation: () => TutorialDropLocation = null
    ): TutorialAction {
        const action = this.addTutorialHighlight(fnGetInterfaceElement, fnGetDropLocation);
        action.highlights.forEach(highlight => highlight.continueTutorialOnClick = true)
        return action
    }

    private addTutorialHighlight(
        fnGetInterfaceElement: () => InterfaceElement,
        fnGetDropLocation: () => TutorialDropLocation = null
    ): TutorialAction {
        return this.addTutorialHighlights(
            [new TutorialHighlight(this.scene, this.grid, fnGetInterfaceElement, fnGetDropLocation)]
        )
    }

    addTutorialHighlights(
        highlights: Array<TutorialHighlight>
    ): TutorialAction {
        const tutorialAction = new TutorialAction(this.scene, highlights);
        tutorialAction.onHighlight = () => {
            this.addBackgroundOverlay()
            this.codeEditor.disableInteractive();
        }
        tutorialAction.askToShowInstruction = (instruction:string) => {
            this.codeEditor.onShowInstruction(instruction);
        }
        tutorialAction.onInvalidState = () => {
            this.codeEditor.replay();
        }
        tutorialAction.onCompleteAction = () => {
            this.action = tutorialAction.nextTutorialAction
            Logger.log('TUTORIAL_ADVANCE [this.action.index]', this.action?.index)
            this.codeEditor.onHideLastInstruction();
        }
        let index = 0;
        if (!this.firstAction) {
            this.firstAction = tutorialAction
        } else {
            index = this.action.index + 1;
            tutorialAction.previousTutorialAction = this.action
            this.action.nextTutorialAction = tutorialAction;
        }
        tutorialAction.index = index;
        this.action = tutorialAction;
        return tutorialAction;
    }

    showTutorialActionsIfExists() {
        this.firstAction?.highlight();
    }

    updateTutorial() {
        Logger.log('TUTORIAL_UPDATE [this.action.index]', this.action?.index)
        this.action?.highlight();
    }

    isTutorialPhase() {
        return this.firstAction != null
    }

    clearTutorials() {
        this.codeEditor.setInteractive();
        this.removeBackgroundTutorialOverlay();
        let action = this.firstAction;
        while (action != null) {
            action.reset();
            action = action.nextTutorialAction
        }
        this.action = null;
        this.firstAction = null;
    }

    addBackgroundOverlay() {
        /* if (!this.backgroundOverlay) {
            this.backgroundOverlay = this.scene.add.sprite(0, 0, 'tutorial-block-click-background')
                .setDepth(DEPTH_OVERLAY_PANEL_TUTORIAL);
            this.grid.placeAt(0, 0, this.backgroundOverlay, this.grid.cols, this.grid.rows);
        } */
    }

    removeBackgroundTutorialOverlay() {
        /* if (this.backgroundOverlay) {
            this.scene.children.remove(this.backgroundOverlay);
            this.backgroundOverlay = null;
        } */
    }
}
