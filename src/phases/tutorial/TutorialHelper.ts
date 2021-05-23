import { Scene } from "phaser";
import CodeEditor from "../../controls/CodeEditor";
import InterfaceElement from "../../InterfaceElement";
import { Logger } from "../../main";
import { phrases } from "../../utils/phrases";
import MazePhase, { CommandName } from "../MazePhase";
import TutorialAction from "../TutorialAction";
import TutorialDropLocation from "../TutorialDropLocation";

export default class TutorialHelper {
  scene: Scene;
  codeEditor: CodeEditor;

  constructor(scene: Scene, codeEditor: CodeEditor) {
    this.scene = scene;
    this.codeEditor = codeEditor;
    this.test()
  }

  buildTutorial(phase: MazePhase, tutorialsActionsWrittenAsPhrases: string[]): string {

    const tutorialActionsMap = new Map<string, (
      fnGetInterfaceElement: () => InterfaceElement,
      fnGetDropLocation: () => TutorialDropLocation) => TutorialAction>();

    tutorialActionsMap.set('drag', phase.addTutorialHighlightDrag);
    tutorialActionsMap.set('click', phase.addTutorialHighlightClick);
    let maxBlocksPerProgram = 5

    let codeStates: string[] = []
    let expectedCodeStateOnTutorialStep: string = '';

    class Block {
      code: string
      prog: CommandName = 'prog_0'

      createString(): string {
        return `${this.code}[${this.prog}]`
      }
    }

    let code: Block[] = [];
    tutorialsActionsWrittenAsPhrases
      .forEach((tutorialPhrase, actionIndex) => {
        // Example: "drop          arrow-up      say drag-arrow-up-1"
        //           [actionName]  [elementName]     [tutorial-phrase-key]
        // Example: "drag          arrow-up       to prog_2"
        //           [actionName]  [elementName]     [programToDragCommand]

        let words = tutorialPhrase.split(' ');
        let action = words[0];
        let command = words[1];
        let ballon = null;
        let programToDragCommand = null

        let indexOfWordSay = tutorialPhrase.indexOf('say')
        if (indexOfWordSay > -1) {
          ballon = words[words.length - 1];
          ballon = phrases[ballon]
          if (!ballon) {
            ballon = tutorialPhrase.substring(indexOfWordSay + 'say '.length)
          }
        }

        let instruction = new Block();

        let progNumber = Math.floor(code.length / maxBlocksPerProgram)
        instruction.prog = 'prog_' + progNumber as CommandName
        instruction.code = command

        let indexOfWordDragTo = words.indexOf('to')
        if (indexOfWordDragTo) {
          programToDragCommand = words[indexOfWordDragTo + 1]
          if (programToDragCommand.startsWith('prog')) {
            instruction.prog = programToDragCommand
          }
        }

        const isConditional = command.startsWith('if_');
        const isButton = command.startsWith('btn');
        let lastInstruction = '';

        if (!isButton) {
          if (isConditional) {
            let index = code.length - 1;
            lastInstruction = code[index].code;
            instruction.code = `${lastInstruction}:${command}`
            code[index] = instruction;
          } else {
            code.push(instruction);
          }
        }

        let fnGetDropLocation = null;
        if (action == 'drag') {
          fnGetDropLocation = () => {
            return this.fnGetProgramDropLocation(programToDragCommand);
          }
          if (isConditional) {
            fnGetDropLocation = () => this.createTutorialDropLocation(instruction.code)
          }
        }

        let fnCreateTutorialAction = tutorialActionsMap.get(action)
        let fnGetInterfaceElement = this.fnGetInterfaceElement(command)

        codeStates[actionIndex] = expectedCodeStateOnTutorialStep;

        const tutorialAction: TutorialAction =
          fnCreateTutorialAction
            .call(
              phase,
              fnGetInterfaceElement,
              fnGetDropLocation
            );

        tutorialAction.ballonInstruction = ballon

        tutorialAction.isEnvironmentValidToHighlightTutorial =
          () => {
            let codeState = codeStates[actionIndex]
            return this.isCodeStateLike(codeState)
          }

        if (command == 'btn-step') {
          tutorialAction.isAllowedToHighlightNextTutorialStep = () => {
            const btnStepEnabled = !this.codeEditor.btnStep.disabled;
            return btnStepEnabled
          }
        }

        expectedCodeStateOnTutorialStep = code.map(c => c.createString()).join(', ');
      })
    return expectedCodeStateOnTutorialStep;
  }

  fnGetInterfaceElement(key: string): () => InterfaceElement {
    return () => {
      const getOnlyFixedElements = true
      const foundElement = this.codeEditor.getInterfaceElements(getOnlyFixedElements)
        .find(it => it.getSprite().texture.key == key);
      if (!foundElement) {
        Logger.warn('Não foi encontrado o elemento ' + key)
      }
      return foundElement;
    }
  }

  fnIsBtnStepStateEnabled = () => {
    const isBtnStepEnabled = !this.codeEditor.btnStep.disabled;
    Logger.log('TUTORIAL [isBtnStepEnabled]', isBtnStepEnabled)
    return isBtnStepEnabled
  }

  fnGetProgramDropLocation = (programToDragCommand: string = null) => {
    let program = this.codeEditor.getLastEditedOrMainProgramOrFirstNonfull();
    if (programToDragCommand) {
      let programFilteredByName = this.codeEditor.programs.find(p => p.name == programToDragCommand)
      if (programFilteredByName) {
        program = programFilteredByName
      }
    }
    return new TutorialDropLocation(program);
  }

  isCodeStateLike(codeString: string) {
    const commandsToString = this.codeEditor.getCode();
    Logger.log('CODE_STATE [codeString]\n', codeString)
    Logger.log('CODE_STATE [commandsToString]\n', commandsToString)
    return codeString === commandsToString;
  }

  createTutorialDropLocation(commandName: string, index = 0) {
    const commands = this.codeEditor.getAddedCommandsByName(commandName);
    return new TutorialDropLocation(null, commands[index]);
  }


  test() {
    const TEST_TAG = 'TEST_TUTORIAL_HELPER'
    let total = 0
    let passed = 0
    const test = (testDescription: string, expectedCode: string, phrases: string[]) => {
      const phase = new MazePhase(this.scene, this.codeEditor);
      let buildTutorialCode = this.buildTutorial(phase, phrases)
      let testPassed = expectedCode == buildTutorialCode
      total++
      if (testPassed) {
        passed++
      }
      Logger.warn(TEST_TAG, total, testDescription + ':', (testPassed ? 'OK' : 'FAILED!!'));
      if (!testPassed) {
        Logger.warn(TEST_TAG, 'Expected:', expectedCode)
        Logger.warn(TEST_TAG, 'Result:', buildTutorialCode)
      }
    }


    test(
      'Duas setas para frente',
      'arrow-up[prog_0], arrow-up[prog_0]',
      [
        "drag arrow-up to prog_0",
        "drag arrow-up to prog_0"
      ]
    );

    test(
      'Seta para frente se tem moeda',
      'arrow-up:if_coin[prog_0]',
      [
        "drag arrow-up to prog_0",
        "drag if_coin to arrow-up"
      ]
    );

    test(
      'Se tem moeda, para cima + moeda',
      'arrow-up:if_coin[prog_0], arrow-up[prog_0]',
      [
        "drag arrow-up to prog_0",
        "drag if_coin to arrow-up",
        "drag arrow-up to prog_0"
      ]
    );

    test(
      'Dois ifs com moeda',
      'arrow-up:if_coin[prog_0], arrow-up:if_coin[prog_0]',
      [
        "drag arrow-up to prog_0",
        "drag if_coin to arrow-up",
        "drag arrow-up to prog_0",
        "drag if_coin to arrow-up"
      ]
    );

    test(
      'Ifs com moeda e bloco',
      'arrow-up:if_coin[prog_0], arrow-right:if_block[prog_0]',
      [
        "drag arrow-up to prog_0",
        "drag if_coin to arrow-up",
        "drag arrow-right to prog_0",
        "drag if_block to arrow-right",
      ]
    );

    test(
      'Seta para cima em prog_1',
      'arrow-up[prog_1]',
      [
        "drag arrow-up to prog_1",
      ]
    );

    test(
      'Vários comandos',
      'arrow-up[prog_0], arrow-left[prog_0], arrow-up[prog_0], arrow-up[prog_0], prog_1[prog_0], arrow-up[prog_1]',
      [
        "click arrow-up",
        "click arrow-left",
        "click arrow-up",
        "click arrow-up",
        "click prog_1",
        "click arrow-up",
      ]
    );

    Logger.warn('TESTS', total, 'PASSED', passed)

  }

}

