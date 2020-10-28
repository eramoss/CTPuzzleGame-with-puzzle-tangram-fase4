import AlignGrid from "../geom/AlignGrid";
import SpriteDropZone from "./SpriteDropZone";
import { GameObjects } from "phaser";
import { createDropZone } from "../utils/Utils";

export default class Trash {
    scene: Phaser.Scene;
    zone: Phaser.GameObjects.Zone;
    dropzone: SpriteDropZone;
    constructor(scene: Phaser.Scene, grid: AlignGrid, cellx: number, celly: number, colspan: number, rowspan: number) {
        this.scene = scene;

        this.dropzone = createDropZone(grid, cellx, celly, colspan, rowspan, 'trash');
        this.zone = this.dropzone.zone;

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

    open() {
        this.dropzone.highlight();
    }

    close() {
        this.dropzone.highlight(false);
    }

    spriteIsHover(obj: GameObjects.Sprite): boolean {
        const rect: Phaser.Geom.Rectangle = this.zone.getBounds();
        return rect.contains(obj.x, obj.y);
    }

    onClick(fn: (_: any) => void) {
        this.dropzone.sprite.on('click', fn)
    }
}