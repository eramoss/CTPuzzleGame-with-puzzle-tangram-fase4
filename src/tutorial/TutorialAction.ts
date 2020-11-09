import { GameObjects, Scene } from "phaser";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {

    scene: Scene;
    highlightedAreas: Array<TutorialHighlight>;
    nextTutorialAction: TutorialAction
    onHighlight: () => void = () => { }
    fnToCheckIfCanEnableHighlight: () => boolean
    triggered: any;

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
        if (this.fnToCheckIfCanEnableHighlight()) {
            this.onHighlight();
            this.disableAllInteractions();
            this.highlightedAreas.forEach(highlight =>
                highlight.onClickTutorialStep(() => {
                    this.nextTutorialAction?.highlight();
                })
            )
        }
    }

    private disableAllInteractions() {
        this.scene.children.getAll().forEach(c => c.disableInteractive());
    }
}