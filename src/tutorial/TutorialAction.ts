import { GameObjects, Scene } from "phaser";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {

    scene: Scene;
    highlightedAreas: Array<TutorialHighlight>;
    nextTutorialAction: TutorialAction
    onHighlight: () => void = () => { }
    onAdvance: () => void = () => { }
    fnToCheckIfCanEnableHighlight: () => boolean
    triggered: boolean = false;
    index: number;

    constructor(
        scene: Scene,
        highlights: Array<TutorialHighlight>,
        fnToCheckIfCanEnableHighlight: () => boolean = () => true
    ) {
        this.scene = scene;
        this.highlightedAreas = highlights;
        this.fnToCheckIfCanEnableHighlight = fnToCheckIfCanEnableHighlight
    }

    reset() {
        console.log('TUTORIAL_RESETING_CHILDREN')
        this.triggered = false;
        this.scene.children.getAll().forEach(c => c.setInteractive());
        this.highlightedAreas.forEach(highlight => {
            highlight.removeHand();
            highlight.resetDepth();
        })
    }

    highlight() {
        if (this.triggered) return;
        this.triggered = true;
        console.log('TUTORIAL_ACTION_INDEX highlight [index]', this.index)
        this.onHighlight();
        this.disableAllInteractions();
        const advance = () => {
            this.onAdvance();
            if (this.fnToCheckIfCanEnableHighlight()) {
                this.nextTutorialAction?.highlight();
            }
        }
        this.highlightedAreas.forEach(highlight =>
            highlight.onClickTutorialStep(() => advance())
        )

    }

    private disableAllInteractions() {
        this.scene.children.getAll().forEach(c => c.disableInteractive());
    }
}