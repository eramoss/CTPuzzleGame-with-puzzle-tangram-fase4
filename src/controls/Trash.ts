import AlignGrid from "../geom/AlignGrid";
import DropZone from "./DropZone";
import { GameObjects } from "phaser";

export default class Trash {
    scene: Phaser.Scene;
    zone: Phaser.GameObjects.Zone;
    dropzone: DropZone;
    constructor(scene: Phaser.Scene, grid: AlignGrid) {
        this.scene = scene;
        const dropArea = grid.getArea(16, 1, 2, 4);
        this.dropzone = new DropZone(scene, dropArea.x, dropArea.y, dropArea.width, dropArea.height, 'trash');
        this.zone = this.dropzone.zone;
        grid.placeAt(16.3, 1, this.dropzone.sprite, 1.4);

        let openTrash = (pointer: Phaser.Input.Pointer, obj: GameObjects.GameObject, zone: GameObjects.Zone) => {
            if (zone === this.zone) {
                this.dropzone.highlight();
            }
        }

        let closeTrash = (pointer: Phaser.Input.Pointer, obj: GameObjects.GameObject, zone: GameObjects.Zone) => {
            if (zone === this.zone) {
                this.dropzone.highlight(false);
            }
        }

        scene.input.on('dragenter', openTrash)
        scene.input.on('dragleave', closeTrash)
        scene.input.on('drop', closeTrash)
    }

    open(){
        this.dropzone.highlight();
    }

    close(){
        this.dropzone.highlight(false);
    }

    spriteIsHover(obj: GameObjects.Sprite): boolean {
        const rect: Phaser.Geom.Rectangle = this.zone.getBounds();
        return rect.contains(obj.x, obj.y);
    }
}