import { GameObjects, Physics, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import InterfaceElement from "../InterfaceElement";
import MazePhase from "./MazePhase";
import TutorialDropLocation from "./TutorialDropLocation";

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

    fnGetChild(key: string): () => InterfaceElement {
        return () => {
            const command = this.codeEditor.availableCommands
                .find(command => command.getSprite().texture.key == key);
            command.isDropSoundEnabled = false;
            return command;
        }
    }

    fnGetArrowUp = this.fnGetChild('arrow-up');
    fnGetArrowLeft = this.fnGetChild('arrow-left');
    fnGetArrowRight = this.fnGetChild('arrow-right');
    fnGetIfCoin = this.fnGetChild('if_coin');
    fnGetIfBlock = this.fnGetChild('if_block');
    fnGetProg_0 = this.fnGetChild('prog_0');
    fnGetProg_1 = this.fnGetChild('prog_1');

    fnGetBtnPlay = () => this.codeEditor.btnPlay;
    fnGetBtnStep = () => this.codeEditor.btnStep;

    fnIsBtnStepStateEnabled = () => {
        const isBtnStepEnabled = !this.codeEditor.btnStep.disabled;
        console.log('TUTORIAL [isBtnStepEnabled]', isBtnStepEnabled)
        return isBtnStepEnabled
    }

    fnGetProgramDropLocation = () => {
        const program = this.codeEditor.getLastEditedOrMainProgramOrFirstNonfull();
        return new TutorialDropLocation(program);
    }

    isCodeStateLike(codeString: string) {
        const commandsToString = this.codeEditor.getLastEditedOrMainProgramOrFirstNonfull().stringfyOrdinalCommands();
        return codeString === commandsToString;
    }


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

        let showTutorial = true;

        //this.phases.push(this.createPhaseEasyArrowUpTwoTimes());
        this.phases.push(this.createPhaseEasyIfCoin(showTutorial));

        this.phases.push(this.createPhaseEasyArrowUp(showTutorial));
        this.phases.push(this.createPhaseEasyArrowUpTwoTimes(showTutorial));
        this.phases.push(this.createPhaseEasyArrowUpAndRight(showTutorial));
        this.phases.push(this.createPhaseEasyThreeStepByStep(showTutorial));
        this.phases.push(this.createPhaseCallRecursiveFunction(showTutorial));

        this.phases.push(this.createPhaseEasyArrowUp());
        this.phases.push(this.createPhaseEasyArrowUpTwoTimes());
        this.phases.push(this.createPhaseEasyThreeStepByStep());
        this.phases.push(this.createEasyPhaseWithBlock());
        this.phases.push(this.createPhaseCallRecursiveFunction());
        this.phases.push(this.createEasyPhaseWithBlockWithTurn());
        this.phases.push(this.createPhaseStepByStepWithBlock());
        this.phases.push(this.createHardPhaseWithTwoStars());
        //this.phases.push(this.createPhaseIfCoin());
        //this.phases.push(this.createPhaseIfBlock()); 
    }

    getNextPhase(): MazePhase {
        this.currentPhase++
        return this.phases[this.currentPhase]
    }

    startPhases() {
        let firstPhase = this.phases[0];
        firstPhase?.firstAction?.highlight();
    }

    private createPhaseEasyIfCoin(showTutorial: boolean = false) {
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

            if (showTutorial) {
                let count = 0;
                phase
                    .addTutorialHighlight(this.fnGetArrowUp, this.fnGetProgramDropLocation)
                    .isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);

                phase
                    .addTutorialHighlight(this.fnGetIfCoin, () => {
                        const command = this.codeEditor.getCommandByName('arrow-up');
                        return new TutorialDropLocation(null, command);
                    })
                    .isCodeStateValidToHighlightThisTutorialAction = () => this.isCodeStateLike("arrow-up")

                phase
                    .addTutorialHighlight(this.fnGetBtnPlay)
                    .isCodeStateValidToHighlightThisTutorialAction = () => this.isCodeStateLike("arrow-up:if_coin")
            }
        }

        return phase;
    }



    private createPhaseEasyArrowUp(showTutorial: boolean = false) {
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

            if (showTutorial) {
                let count = 0;
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetBtnPlay).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            }
        }

        return phase;
    }

    private createPhaseEasyThreeStepByStep(showTutorial: boolean = false) {
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

            if (showTutorial) {
                let count = 0;
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++)
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++)
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++)
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled
            }
        }

        return phase;
    }

    hasAddedComands(quantity: number): () => boolean {
        return () => this.codeEditor.countAddedCommands() == quantity
    }

    private createPhaseEasyArrowUpTwoTimes(showTutorial: boolean = false) {
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
            if (showTutorial) {
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(0)
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(1)
                phase.addTutorialHighlight(this.fnGetBtnPlay).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(2)
            }
        }
        return phase;
    }

    private createPhaseEasyArrowUpAndRight(showTutorial: boolean = false) {
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

            if (showTutorial) {
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(0);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(1);
                phase.addTutorialHighlight(this.fnGetArrowRight).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(2);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(3);
                phase.addTutorialHighlight(this.fnGetBtnPlay).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(4);;
            }
        }
        return phase;
    }

    private createPhaseCallRecursiveFunction(showTutorial: boolean = false) {
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
            ['null', 'null', 'null', 'null', 'null', 'coin', 'null'],
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

            if (showTutorial) {
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(0);
                phase.addTutorialHighlight(this.fnGetProg_0).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(1);
                phase.addTutorialHighlight(this.fnGetBtnPlay).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(2);
            }
        }

        return phase;
    }

    private createPhaseStepByStepWithBlock(showTutorial: boolean = false) {
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

            if (showTutorial) {
                let count = 0;
                phase.addTutorialHighlight(this.fnGetArrowLeft).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowRight).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetProg_1).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowRight).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
                phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
            }
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

            let count = 0;
            phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
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

            let count = 0;
            phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            phase.addTutorialHighlight(this.fnGetArrowUp).isCodeStateValidToHighlightThisTutorialAction = this.hasAddedComands(count++);
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
            phase.addTutorialHighlight(this.fnGetBtnStep).isCodeStateValidToHighlightThisTutorialAction = this.fnIsBtnStepStateEnabled;
        }

        return phase;
    }

    private createHardPhaseWithTwoStars() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 0 }

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
            ['null', 'block', 'block', 'null', 'null', 'null', 'null'],
            ['null', 'block', 'coin', 'null', 'null', 'null', 'null'],
            ['null', 'block', 'block', 'null', 'null', 'null', 'null'],
            ['null', 'block', 'coin', 'null', 'null', 'null', 'null'],
            ['null', 'block', 'block', 'null', 'null', 'null', 'null'],
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
        }

        return phase;
    }


    private createEasyPhaseWithBlock() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 0 }

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
            ['null', 'null', 'null', 'coin', 'coin', 'null', 'null'],
            ['null', 'null', 'null', 'block', 'null', 'null', 'null'],
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
        }

        return phase;
    }

    private createEasyPhaseWithBlockWithTurn() {
        const phase = new MazePhase(this.scene, this.grid);
        phase.dudeFacedTo = 'down'
        phase.dudeStartPosition = { col: 3, row: 0 }

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
            ['null', 'null', 'null', 'coin', 'null', 'null', 'null'],
            ['null', 'null', 'null', 'block', 'coin', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'null', 'null', 'null'],
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
        }

        return phase;
    }
}