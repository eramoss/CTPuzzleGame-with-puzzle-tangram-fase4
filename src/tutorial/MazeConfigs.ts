import { Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import { joinChilds, createJoinArraysFn as createJoinFunction } from "../utils/Utils";
import MazePhase from "./MazePhase";
import TutorialHighlight from "./TutorialHighlight";

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

    fnGetArrowUp = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-up');
    fnGetArrowLeft = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-left');
    fnGetArrowRight = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-right');
    fnGetBtnPlay = () => this.codeEditor.btnPlay.sprite;
    fnGetProgram = () => this.codeEditor.getLastEditedOrMainProgramOrFirstNonfull().sprite

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
        this.phases.push(this.createPhaseEasyArrowUpTwoTimes());
        this.phases.push(this.createPhaseEasyArrowUpAndRight());
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
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'right'
        phase.dudeStartPosition = { col: 2, row: 3 }

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

        phase.setupTutorialsAndObjectsPositions = () => {
            phase.obstacles = new Matrix(
                this.scene,
                this.matrixMode,
                obstaclesMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );

            phase.ground = new Matrix(
                this.scene,
                this.matrixMode,
                baseMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );

            phase.addTutorialHighlights([
                new TutorialHighlight(this.fnGetArrowUp),
                new TutorialHighlight(this.fnGetProgram, false)
            ])
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetBtnPlay)])
        }

        return phase;
    }

    private createPhaseEasyArrowUpTwoTimes() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'right'
        phase.dudeStartPosition = { col: 1, row: 3 }

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

        phase.setupTutorialsAndObjectsPositions = () => {

            phase.obstacles = new Matrix(
                this.scene,
                this.matrixMode,
                obstaclesMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );

            phase.ground = new Matrix(
                this.scene,
                this.matrixMode,
                baseMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );
            phase.addTutorialHighlights([
                new TutorialHighlight(this.fnGetArrowUp),
                new TutorialHighlight(this.fnGetProgram, false),
            ])
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetArrowUp)])
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetBtnPlay)])
        }
        return phase;
    }

    private createPhaseEasyArrowUpAndRight() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'right'
        phase.dudeStartPosition = { col: 1, row: 2 }

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

        phase.setupTutorialsAndObjectsPositions = () => {

            phase.obstacles = new Matrix(
                this.scene,
                this.matrixMode,
                obstaclesMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );

            phase.ground = new Matrix(
                this.scene,
                this.matrixMode,
                baseMatrix,
                this.gridCenterX, this.gridCenterY, this.gridCellWidth
            );

            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetArrowUp)]);
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetArrowUp)]);
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetArrowRight)]);
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetArrowUp)]);
            phase.addTutorialHighlights([new TutorialHighlight(this.fnGetBtnPlay)]);
        }
        return phase;
    }
}