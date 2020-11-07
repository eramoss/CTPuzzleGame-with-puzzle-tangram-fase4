import { Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import { joinChilds } from "../utils/Utils";
import MazePhase from "./MazePhase";

export default class MazeConfigs {

    currentPhase: number = -1
    phases: Array<MazePhase>;
    scene: Scene;
    grid: AlignGrid;
    matrixMode: string;
    gridCenterX: number;
    gridCenterY: number;
    gridCellWidth: number;
    codeEditor: CodeEditor;

    constructor(scene: Scene,
        grid: AlignGrid,
        codeEditor: CodeEditor,
        matrixMode: string,
        gridCenterX: number,
        gridCenterY: number,
        gridCellWidth: number) {

        this.matrixMode = matrixMode;
        this.gridCenterX = gridCenterX;
        this.gridCenterY = gridCenterY;
        this.gridCellWidth = gridCellWidth;
        this.codeEditor = codeEditor;

        this.scene = scene;
        this.grid = grid;

        this.phases = new Array<MazePhase>();

        this.phases.push(this.createPhaseEasyArrowUp());
        this.phases.push(this.createPhaseEasyArrowUpAndLeft());
    }

    getNextPhase(): MazePhase {
        this.currentPhase++
        return this.phases[this.currentPhase]
    }

    startPhases() {
        let firstPhase = this.phases[0];
        firstPhase?.firstAction?.execute();
    }

    private createPhaseEasyArrowUp() {
        const phaseArrowUp = new MazePhase(this.scene, this.grid);
        phaseArrowUp.dudeFacedTo = 'right'
        phaseArrowUp.dudeStartPosition = { col: 2, row: 3 }

        let baseMatrix = [
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
        ];

        let obstaclesMatrix = [
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ];

        phaseArrowUp.obstacles = new Matrix(
            this.scene,
            this.matrixMode,
            obstaclesMatrix,
            this.gridCenterX, this.gridCenterY, this.gridCellWidth
        );

        phaseArrowUp.ground = new Matrix(
            this.scene,
            this.matrixMode,
            baseMatrix,
            this.gridCenterX, this.gridCenterY, this.gridCellWidth
        );

        const arrowUp = joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
            .find(c => c.texture.key == 'arrow-up');
        const btnPlay = this.codeEditor.btnPlay.sprite;

        phaseArrowUp.addClickTutorialAction(arrowUp);
        phaseArrowUp.addClickTutorialAction(btnPlay);


        return phaseArrowUp;
    }

    private createPhaseEasyArrowUpAndLeft() {
        const phaseArrowUp = new MazePhase(this.scene, this.grid);
        phaseArrowUp.dudeFacedTo = 'right'
        phaseArrowUp.dudeStartPosition = { col: 1, row: 3 }

        let baseMatrix = [
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
            ['tile', 'tile', 'tile', 'tile', 'tile', 'tile', 'tile'],
        ];

        let obstaclesMatrix = [
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
        ];

        phaseArrowUp.obstacles = new Matrix(
            this.scene,
            this.matrixMode,
            obstaclesMatrix,
            this.gridCenterX, this.gridCenterY, this.gridCellWidth
        );

        phaseArrowUp.ground = new Matrix(
            this.scene,
            this.matrixMode,
            baseMatrix,
            this.gridCenterX, this.gridCenterY, this.gridCellWidth
        );

        const arrowUp = joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
            .find(c => c.texture.key == 'arrow-up');
        const btnStep = this.codeEditor.btnStep.sprite;

        //phaseArrowUp.addClickTutorialAction(arrowUp);
        phaseArrowUp.addClickTutorialAction(btnStep);


        return phaseArrowUp;
    }
}