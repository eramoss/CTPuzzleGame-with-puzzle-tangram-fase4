import { GameObjects, Physics, Scene } from "phaser";
import CodeEditor from "../controls/CodeEditor";
import AlignGrid from "../geom/AlignGrid";
import Matrix from "../geom/Matrix";
import InterfaceElement from "../InterfaceElement";
import MazePhase from "./MazePhase";
import TutorialAction from "./TutorialAction";
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

    fnGetInterfaceElement(key: string): () => InterfaceElement {
        return () => {
            const getOnlyFixedElements = true
            const foundElement = this.codeEditor.getInterfaceElements(getOnlyFixedElements)
                .find(it => it.getSprite().texture.key == key);
            if (!foundElement) {
                console.warn('Não foi encontrado o elemento ' + key)
            }
            return foundElement;
        }
    }

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
        const commandsToString = this.codeEditor.stringfyCommands();
        console.log('CODE_STATE [codeString]\n', codeString)
        console.log('CODE_STATE [commandsToString]\n', commandsToString)
        return codeString === commandsToString;
    }

    createTutorialDropLocation(commandName: string, index = 0) {
        const commands = this.codeEditor.getAddedCommandsByName(commandName);
        return new TutorialDropLocation(null, commands[index]);
    }

    buildTutorial(phase: MazePhase, tutorialsActionsWrittenAsPhrases: string[]): string {

        const tutorialActionsMap = new Map<string, (
            fnGetInterfaceElement: () => InterfaceElement,
            fnGetDropLocation: () => TutorialDropLocation) => TutorialAction>();

        tutorialActionsMap.set('drag', phase.addTutorialHighlightDrag);
        tutorialActionsMap.set('click', phase.addTutorialHighlightClick);

        let codeStates: string[] = []
        let expectedCodeStateDuringTutorialAction: string = '';
        let code = [];
        tutorialsActionsWrittenAsPhrases
            .forEach((tutorialActionAsString, actionIndex) => {
                // Example: "drop          arrow-up      to program"
                //           [actionName]  [elementName]

                let commands = tutorialActionAsString.split(' ');
                let actionName = commands[0];
                let elementName = commands[1];

                let instruction = elementName;
                const isConditional = elementName.startsWith('if_');
                const isButton = elementName.startsWith('btn');
                let lastInstruction = "";
                if (!isButton) {
                    if (isConditional) {
                        let index = code.length - 1;
                        lastInstruction = code[index];
                        instruction = lastInstruction + ":" + elementName
                        code[index] = instruction;
                    } else {
                        code.push(instruction);
                    }
                }

                let fnGetDropLocation = null;
                if (actionName == 'drag') {
                    fnGetDropLocation = this.fnGetProgramDropLocation;
                    if (isConditional) {
                        fnGetDropLocation = () => this.createTutorialDropLocation(lastInstruction)
                    }
                }
                if (actionName == 'click') {

                }

                let tutorialActionCreator = tutorialActionsMap.get(actionName)
                let fnGetInterfaceElement = this.fnGetInterfaceElement(elementName)

                codeStates[actionIndex] = expectedCodeStateDuringTutorialAction;

                const tutorialAction: TutorialAction = tutorialActionCreator
                    .call(phase, fnGetInterfaceElement, fnGetDropLocation);

                tutorialAction.isEnvironmentValidToHighlightTutorial =
                    () => this.isCodeStateLike(codeStates[actionIndex])

                if (elementName == 'btn-step') {
                    tutorialAction.isAllowedToHighlightNextTutorialStep = () => {
                        const btnStepEnabled = !this.codeEditor.btnStep.disabled;
                        return btnStepEnabled
                    }
                }

                //console.log('BUILD_CODE', expectedCodeStateDuringTutorialAction)
                expectedCodeStateDuringTutorialAction = code.join(', ');
            })
        return expectedCodeStateDuringTutorialAction;
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

        this.phases.push(this.createPhaseHardIfCoinAndIfBlock(showTutorial));
        //this.phases.push(this.createPhaseEasyArrowUpTwoTimes(showTutorial));
        //this.phases.push(this.createPhaseStepByStepWithBlock(showTutorial));

        this.phases.push(this.createPhaseEasyArrowUp(showTutorial));
        this.phases.push(this.createPhaseEasyArrowUpTwoTimes(showTutorial));
        this.phases.push(this.createPhaseEasyArrowUpAndRight(showTutorial));
        this.phases.push(this.createPhaseCallRecursiveFunction(showTutorial));
        this.phases.push(this.createPhaseHardIfCoinAndIfBlock(showTutorial));

        this.phases.push(this.createPhaseEasyArrowUp());
        this.phases.push(this.createPhaseEasyArrowUpTwoTimes());
        this.phases.push(this.createPhaseEasyThreeStepByStep());
        this.phases.push(this.createEasyPhaseWithBlock());
        this.phases.push(this.createPhaseCallRecursiveFunction());
        this.phases.push(this.createEasyPhaseWithBlockWithTurn());
        this.phases.push(this.createPhaseStepByStepWithBlock());
        this.phases.push(this.createHardPhaseWithTwoStars());
        this.phases.push(this.createPhaseHardIfCoinAndIfBlock());
        this.phases.push(this.createPhaseHardIfCoinAndIfBlock());
    }

    getNextPhase(): MazePhase {
        this.currentPhase++
        return this.phases[this.currentPhase]
    }

    private createPhaseHardIfCoinAndIfBlock(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
        phase.dudeFacedTo = 'right'
        phase.dudeStartPosition = { col: 1, row: 1 }

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
            ['null', 'null', 'coin', 'coin', 'coin', 'block', 'null'],
            ['null', 'null', 'null', 'null', 'coin', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'coin', 'null', 'null'],
            ['null', 'null', 'coin', 'coin', 'coin', 'null', 'null'],
            ['null', 'null', 'null', 'null', 'block', 'null', 'null'],
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
                let tutorial = [
                    "drag arrow-up",
                    "drag if_coin",
                    "drag arrow-right",
                    "drag if_block",
                    "drag prog_0",
                    "click btn-play",
                ]
                this.buildTutorial(phase, tutorial)
            }
        }

        return phase;
    }




    private createPhaseEasyArrowUp(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase,
                    [
                        'drag arrow-up',
                        'click btn-play'
                    ]
                )
            }
        }

        return phase;
    }

    private createPhaseEasyThreeStepByStep(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase, [
                    'click arrow-up',
                    'click arrow-up',
                    'click arrow-up',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                ])
            }
        }

        return phase;
    }

    hasAddedComands(quantity: number): () => boolean {
        return () => this.codeEditor.countAddedCommands() == quantity
    }

    private createPhaseEasyArrowUpTwoTimes(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase, [
                    'drag arrow-up',
                    'drag arrow-up',
                    'click btn-step',
                    'click btn-step'
                ])
            }
        }
        return phase;
    }

    private createPhaseEasyArrowUpAndRight(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase, [
                    'drag arrow-up',
                    'drag arrow-up',
                    'drag arrow-right',
                    'drag arrow-up',
                    'click btn-play',
                ])
            }
        }
        return phase;
    }

    private createPhaseCallRecursiveFunction(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase, [
                    'drag arrow-up',
                    'drag prog_0',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                ]);
            }
        }

        return phase;
    }

    private createPhaseStepByStepWithBlock(showTutorial: boolean = false) {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
                this.buildTutorial(phase, [
                    'drag arrow-left',
                    'drag arrow-up',
                    'drag arrow-right',
                    'drag arrow-up',
                    'drag prog_1',
                    'drag arrow-up',
                    'drag arrow-up',
                    'drag arrow-right',
                    'drag arrow-up',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                    'click btn-step',
                ])
            }
        }

        return phase;
    }

    private createPhaseIfCoin() {
        const phase = new MazePhase(this.scene, this.codeEditor);
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

            this.buildTutorial(phase, [
                'drag arrow-up',
                'drag arrow-up',
                'click btn-step',
                'click btn-step',
                'click btn-step',
            ])
        }

        return phase;
    }

    private createPhaseIfBlock() {
        const phase = new MazePhase(this.scene, this.codeEditor);
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

            this.buildTutorial(phase, [
                'drag arrow-up',
                'drag arrow-up',
                'drag arrow-up',
                'click btn-step',
                'click btn-step',
                'click btn-step',
            ])
        }
        return phase;
    }

    private createHardPhaseWithTwoStars() {
        const phase = new MazePhase(this.scene, this.codeEditor);
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
        const phase = new MazePhase(this.scene, this.codeEditor);
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
        const phase = new MazePhase(this.scene, this.codeEditor);
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

    test() {
        const phase = new MazePhase(this.scene, this.codeEditor);
        let testCount = 0;
        let code = this.buildTutorial(phase, [
            "drag arrow-up to program",
            "drag arrow-up to program"]
        )
        console.log('TEST', testCount++, code == 'arrow-up, arrow-up', code);

        code = this.buildTutorial(phase, [
            "drag arrow-up to program",
            "drag if_coin to arrow-up"]
        )
        console.log('TEST', testCount++, code == 'arrow-up:if_coin', code);

        code = this.buildTutorial(phase, [
            "drag arrow-up to program",
            "drag if_coin to arrow-up",
            "drag arrow-up to program"
        ]
        )
        console.log('TEST', testCount++, code == 'arrow-up:if_coin, arrow-up', code);

        code = this.buildTutorial(phase, [
            "drag arrow-up to program",
            "drag if_coin to arrow-up",
            "drag arrow-up to program",
            "drag if_coin to arrow-up"
        ]
        )
        console.log('TEST', testCount++, code == 'arrow-up:if_coin, arrow-up:if_coin', code);

        code = this.buildTutorial(phase, [
            "drag arrow-up to program",
            "drag if_coin to arrow-up",
            "drag arrow-right to program",
            "drag if_block to arrow-right",
        ]
        )
        console.log('TEST', testCount++, code == 'arrow-up:if_coin, arrow-right:if_block', code);

    }
}