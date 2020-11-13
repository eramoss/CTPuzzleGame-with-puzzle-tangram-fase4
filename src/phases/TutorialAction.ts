import { GameObjects, Scene } from "phaser";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {

    scene: Scene;
    highlightedAreas: Array<TutorialHighlight>;
    nextTutorialAction: TutorialAction
    previousTutorialAction: TutorialAction;
    onHighlight: () => void = () => { }
    onAdvance: () => void = () => { }
    canBeHighlightedWhen: () => boolean = () => true
    triggered: boolean = false;
    index: number;

    constructor(
        scene: Scene,
        highlights: Array<TutorialHighlight>,
    ) {
        this.scene = scene;
        this.highlightedAreas = highlights;
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
        if (this.canBeHighlightedWhen()) {
            this.triggered = true;
            console.log('TUTORIAL_ACTION_INDEX highlight [index]', this.index)
            this.onHighlight();
            this.disableAllInteractions();
            const advance = () => {
                this.onAdvance();
                this.nextTutorialAction?.highlight();
            }
            this.highlightedAreas.forEach(highlight =>
                highlight.onClickTutorialStep(() => advance())
            );
        }
        if (!this.canBeHighlightedWhen()) {
            if (this.previousTutorialAction) {
                this.previousTutorialAction.triggered = false
                this.previousTutorialAction.highlight();
            }
        }
    }

    private disableAllInteractions() {
        this.scene.children.getAll().forEach(c => c.disableInteractive());
    }
}