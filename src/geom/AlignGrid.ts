import { Scene } from "phaser";

export default class AlignGrid {
    
    scene: Scene;
    cols: number;
    rows: number;
    cellWidth:number;
    cellHeight:number;
    graphics: Phaser.GameObjects.Graphics;
    width:number = 600;
    height:number = 600;

    constructor(scene:Scene, cols:number = 3, rows:number = 3){
        this.scene = scene;
        this.cols = cols;
        this.rows = rows;
        this.width = scene.cameras.default.width;
        this.height = scene.cameras.default.height;
        this.cellWidth = this.width/cols;
        this.cellHeight = this.height/rows;
    }

    show(alpha=1){
        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(2, 0xff0000, alpha);

        let pointy = this.cellHeight;
        let pointx = this.cellWidth;
        
        for(let y = 0; y < 5; y++){
            this.graphics.moveTo(0, pointy);
            this.graphics.lineTo(this.width, pointy);
            pointy += this.cellHeight;
        }

        for(let x = 0; x < 5; x++){
            this.graphics.moveTo(pointx, 0);
            this.graphics.lineTo(pointx, this.height);
            pointx += this.cellWidth;
        }

        this.graphics.strokePath();
    }

    addImage(x: number, y: number, key: string) {
        let image = this.scene.add.image(0,0,key);
        this.placeAt(0,0,image);
    }

    placeAt(cellHorizontalNumber:number,cellVerticalNumber:number,obj:Phaser.GameObjects.Image|Phaser.GameObjects.Sprite){
        let x = this.cellWidth * cellHorizontalNumber + this.cellWidth/2;
        let y = this.cellHeight * cellVerticalNumber + this.cellHeight/2;
        obj.setPosition(x, y);
        obj.displayWidth = this.cellWidth;
        obj.displayHeight = this.cellHeight;
    }

}