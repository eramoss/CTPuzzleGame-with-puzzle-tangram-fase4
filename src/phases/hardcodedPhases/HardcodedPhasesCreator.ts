import { Scene } from "phaser";
import CodeEditor from "../../controls/CodeEditor";
import Matrix, { MatrixMode } from "../../geom/Matrix";
import MazePhase from "../MazePhase";
import TutorialHelper from "../tutorial/TutorialHelper";

export default class HardcodedPhasesCreator {
  scene: Scene;
  codeEditor: CodeEditor;
  matrixMode: MatrixMode = MatrixMode.ISOMETRIC;
  gridCenterX: number;
  gridCenterY: number;
  gridCellWidth: number;
  tutorial: TutorialHelper

  constructor(scene: Scene, codeEditor: CodeEditor, gridCenterX: number, gridCenterY: number, gridCellWidth: number) {
    this.scene = scene;
    this.codeEditor = codeEditor;
    this.gridCenterX = gridCenterX;
    this.gridCenterY = gridCenterY;
    this.gridCellWidth = gridCellWidth;
    this.tutorial = new TutorialHelper(scene, codeEditor)
  }

  createHardCodedPhases(): Array<MazePhase> {
    let phases = new Array<MazePhase>();

    let showTutorial = true;

    phases.push(this.createDemoPhase());

    //phases.push(this.createHardPhaseIfCoinAndIfBlock(showTutorial));
    //phases.push(this.createPhaseCallRecursiveFunction());
    //phases.push(this.createPhaseHardIfCoinAndIfBlock(showTutorial));
    //phases.push(this.createPhaseHardIfCoinAndIfBlock());
    //phases.push(this.createPhaseEasyArrowUpTwoTimes(showTutorial));
    //phases.push(this.createPhaseStepByStepWithBlock(showTutorial));

    //Easy
    phases.push(this.createEasyPhaseArrowUp(showTutorial));
    phases.push(this.createEasyPhaseArrowUpTwoTimes(showTutorial));
    phases.push(this.createEasyPhaseArrowUpAndRight(showTutorial));

    phases.push(this.createEasyPhaseCallRecursiveFunction(showTutorial));
    phases.push(this.createHardPhaseIfCoinAndIfBlock(showTutorial));

    phases.push(this.createEasyPhaseArrowUp());
    phases.push(this.createEasyPhaseArrowUpTwoTimes());
    phases.push(this.createEasyPhaseEasyThreeStepByStep());
    phases.push(this.createEasyPhaseWithBlock());
    phases.push(this.createEasyPhaseCallRecursiveFunction());

    phases.push(this.createMediumPhaseWithBlockWithTurn());

    phases.push(this.createHardPhaseStepByStepWithBlock());
    phases.push(this.createHardPhaseWithTwoStars());
    //this.phases.push(this.createHardPhaseIfCoinAndIfBlock());

    return phases;
  }

  private createDemoPhase(showTutorial: boolean = false) {
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
      ['block', 'block', 'block', 'block', 'block', 'block', 'block'],
      ['block', 'null', 'null', 'null', 'null', 'null', 'block'],
      ['block', 'null', 'null', 'null', 'null', 'null', 'block'],
      ['block', 'null', 'null', 'null', 'null', 'coin', 'block'],
      ['block', 'null', 'null', 'null', 'null', 'null', 'block'],
      ['block', 'null', 'null', 'null', 'null', 'null', 'block'],
      ['block', 'block', 'block', 'block', 'block', 'block', 'block'],
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
        this.tutorial.buildTutorial(phase,
          [
            'drag arrow-up say drag-up-to-program',
            'click btn-play say click-get-coin'
          ]
        )
      }
    }

    return phase;
  }

  private createEasyPhaseArrowUp(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase,
          [
            'drag arrow-up say drag-up-to-program',
            'click btn-play say click-get-coin'
          ]
        )
      }
    }

    return phase;
  }

  private createEasyPhaseEasyThreeStepByStep(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase, [
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

  private createEasyPhaseArrowUpTwoTimes(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase, [
          'drag arrow-up say drag-up',
          'drag arrow-up say drag-up',
          'click btn-step say click-here-i-go-step',
          'click btn-step say again-i-get-coin'
        ])
      }
    }
    return phase;
  }

  private createEasyPhaseArrowUpAndRight(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase, [
          'drag arrow-up say drag-up',
          'drag arrow-up say drag-up',
          'drag arrow-right say drag-right',
          'drag arrow-up say drag-up',
          'click btn-play say click-play',
        ])
      }
    }
    return phase;
  }

  private createEasyPhaseCallRecursiveFunction(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase, [
          'drag arrow-up say drag-up',
          'drag prog_0 say drag-prog_0',
          'click btn-step say click-step',
          'click btn-step say click-step',
          'click btn-step say click-step',
          'click btn-step say click-step',
          'click btn-step say click-step',
        ]);
      }
    }

    return phase;
  }

  private createHardPhaseStepByStepWithBlock(showTutorial: boolean = false) {
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
        this.tutorial.buildTutorial(phase, [
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

      this.tutorial.buildTutorial(phase, [
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

      this.tutorial.buildTutorial(phase, [
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

  private createMediumPhaseWithBlockWithTurn() {
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

  private createHardPhaseIfCoinAndIfBlock(showTutorial: boolean = false) {
    const phase = new MazePhase(this.scene, this.codeEditor);
    phase.dudeFacedTo = 'right'
    phase.dudeStartPosition = { col: 2, row: 1 }

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
      ['null', 'null', 'null', 'coin', 'coin', 'block', 'null'],
      ['null', 'null', 'null', 'null', 'coin', 'null', 'null'],
      ['null', 'null', 'null', 'coin', 'coin', 'null', 'null'],
      ['null', 'null', 'null', 'null', 'block', 'null', 'null'],
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
        let tutorial = [
          "drag arrow-up say drag-up",
          "drag if_coin say drag-if_coin",
          "drag arrow-right say drag-right",
          "drag if_block say drag-if_block",
          "drag prog_0 say drag-prog_0",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
          "click btn-step say click-step",
        ]
        this.tutorial.buildTutorial(phase, tutorial)
      }
    }

    return phase;
  }


}
