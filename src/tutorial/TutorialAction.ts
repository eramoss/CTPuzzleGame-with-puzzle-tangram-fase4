import { GameObjects, Scene } from "phaser";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {

    scene: Scene;
    highlightedAreas: Array<TutorialHighlight>;
    nextTutorialAction: TutorialAction
    onHighlight: () => void = () => { }

    constructor(scene: Scene, highlights: Array<TutorialHighlight>) {
        this.scene = scene;
        this.highlightedAreas = highlights;
    }

    reset() {
        this.scene.children.getAll().forEach(c => c.setInteractive());
        this.highlightedAreas.forEach(highlight => {
            highlight.removeHand();
            highlight.resetDepth();
        })
    }

    highlight() {
        this.onHighlight();
        this.disableAllInteractions();
        this.highlightedAreas.forEach(highlight =>
            highlight.onClickTutorialStep(() => {
                this.nextTutorialAction?.highlight();
            })
        )
    }

    private disableAllInteractions() {
        this.scene.children.getAll().forEach(c => c.disableInteractive());
    }
}