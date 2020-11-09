import { Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import { joinChilds, createJoinArraysFn as createJoinFunction } from "../utils/Utils";
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

    fnGetArrowUp = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-up');
    fnGetArrowLeft = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-left');
    fnGetArrowRight = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'arrow-right');
    fnGetIfCoin = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'if_coin');
    fnGetIfBlock = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'if_block');
    fnGetProg_0 = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'prog_0');
    fnGetProg_1 = () => joinChilds(this.codeEditor.toolboxRows, (t) => t.flow.children)
        .find(c => c.texture.key == 'prog_1');
    fnGetBtnPlay = () => this.codeEditor.btnPlay.sprite;
    fnGetBtnStep = () => this.codeEditor.btnStep.sprite;
    fnIsBtnStepStateEnabled = () => {
        const isBtnStepEnabled = !this.codeEditor.btnStep.disabled;
        console.log('TUTORIAL [isBtnStepEnabled]', isBtnStepEnabled)
        return isBtnStepEnabled
    }
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
        this.phases.push(this.createPhaseEasyArrowUpWithoutTutorial());
        this.phases.push(this.createPhaseWithBlock());
        this.phases.push(this.createPhaseCallRecursiveFunction());
        this.phases.push(this.createPhaseStepByStep());
        /* this.phases.push(this.createPhaseIfCoin());
        this.phases.push(this.createPhaseIfBlock()); */
    }

    getNextPhase(): MazePhase {
        this.currentPhase++
        return this.phases[this.currentPhase]
    }

    startPhases() {
        let firstPhase = this.phases[0];
        firstPhase?.firstAction?.highlight();
    }

    private createPhaseEasyArrowUp() {
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
            ['null', 'null', 'coin', 'null', 'null', 'null', 'null'],
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

            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnPlay)
        }

        return phase;
    }

    private createPhaseStepByStep() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 1 }

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
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
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


            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
        }

        return phase;
    }

    private createPhaseEasyArrowUpWithoutTutorial() {
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
            ['null', 'null', 'coin', 'null', 'null', 'null', 'null'],
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

            /* phase.addTutorialHighlights([
                new TutorialHighlight(this.fnGetArrowUp),
                //new TutorialHighlight(this.fnGetProgram, false)
            ])
            phase.addHighlight(this.fnGetBtnPlay)])*/
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
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnPlay)
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

            phase.addHighlight(this.fnGetArrowUp);
            phase.addHighlight(this.fnGetArrowUp);
            phase.addHighlight(this.fnGetArrowRight);
            phase.addHighlight(this.fnGetArrowUp);
            phase.addHighlight(this.fnGetBtnPlay);
        }
        return phase;
    }

    private createPhaseCallRecursiveFunction() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'right'
        phase.dudeStartPosition = { col: 0, row: 3 }

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
            ['null', 'null', 'null', 'null', 'null', 'null', 'coin'],
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

            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetProg_0)
            phase.addHighlight(this.fnGetBtnPlay)
        }

        return phase;
    }

    private createPhaseWithBlock() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 1 }

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
            ['null', 'null', 'null', 'block', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
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

            phase.addHighlight(this.fnGetArrowLeft)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowRight)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetProg_1)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowRight)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
        }

        return phase;
    }

    private createPhaseIfCoin() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 1 }

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
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
            ['null', 'null', 'coin', 'coin', 'null', 'null', 'null'],
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


            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
        }

        return phase;
    }

    private createPhaseIfBlock() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 1 }

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
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
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


            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetArrowUp)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
            phase.addHighlight(this.fnGetBtnStep, this.fnIsBtnStepStateEnabled)
        }

        return phase;
    }
}