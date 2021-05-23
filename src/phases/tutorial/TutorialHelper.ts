import { Scene } from "phaser";
import CodeEditor from "../../controls/CodeEditor";
import InterfaceElement from "../../InterfaceElement";
import { Logger } from "../../main";
import { phrases } from "../../utils/phrases";
import MazePhase from "../MazePhase";
import TutorialAction from "../TutorialAction";
import TutorialDropLocation from "../TutorialDropLocation";

export default class TutorialHelper {
  scene: Scene;
  codeEditor: CodeEditor;

  constructor(scene: Scene, codeEditor: CodeEditor) {
    this.scene = scene;
    this.codeEditor = codeEditor;
  }

  buildTutorial(phase: MazePhase, tutorialsActionsWrittenAsPhrases: string[]): string {


    const tutorialActionsMap = new Map<string, (
      fnGetInterfaceElement: () => InterfaceElement,
      fnGetDropLocation: () => TutorialDropLocation) => TutorialAction>();

    tutorialActionsMap.set('drag', phase.addTutorialHighlightDrag);
    tutorialActionsMap.set('click', phase.addTutorialHighlightClick);

    let codeStates: string[] = []
    let expectedCodeState: string = '';
    let code = [];
    tutorialsActionsWrittenAsPhrases
      .forEach((tutorialPhrase, actionIndex) => {
        // Example: "drop          arrow-up      say drag-arrow-up-1"
        //           [actionName]  [elementName]     [tutorial-phrase-key]

        let words = tutorialPhrase.split(' ');
        let action = words[0];
        let command = words[1];
        let ballon = null;
        let programToDragTo = null

        let indexOfWordSay = tutorialPhrase.indexOf('say')
        if (indexOfWordSay > -1) {
          ballon = words[words.length - 1];
          ballon = phrases[ballon]
          if (!ballon) {
            ballon = tutorialPhrase.substring(indexOfWordSay + 'say '.length)
          }
        }

        let indexOfWordDragTo = words.indexOf('to')
        if (indexOfWordDragTo) {
          programToDragTo = words[indexOfWordDragTo + 1]
        }

        let instruction = command;
        const isConditional = command.startsWith('if_');
        const isButton = command.startsWith('btn');
        let lastInstruction = "";

        if (!isButton) {
          if (isConditional) {
            let index = code.length - 1;
            lastInstruction = code[index];
            instruction = lastInstruction + ":" + command
            code[index] = instruction;
          } else {
            code.push(instruction);
          }
        }

        let fnGetDropLocation = null;
        if (action == 'drag') {
          fnGetDropLocation = () => {
            return this.fnGetProgramDropLocation(programToDragTo);
          }
          if (isConditional) {
            fnGetDropLocation = () => this.createTutorialDropLocation(lastInstruction)
          }
        }

        let fnCreateTutorialAction = tutorialActionsMap.get(action)
        let fnGetInterfaceElement = this.fnGetInterfaceElement(command)

        codeStates[actionIndex] = expectedCodeState;

        const tutorialAction: TutorialAction =
          fnCreateTutorialAction
            .call(
              phase,
              fnGetInterfaceElement,
              fnGetDropLocation
            );

        tutorialAction.ballonInstruction = ballon

        tutorialAction.isEnvironmentValidToHighlightTutorial =
          () => this.isCodeStateLike(codeStates[actionIndex])

        if (command == 'btn-step') {
          tutorialAction.isAllowedToHighlightNextTutorialStep = () => {
            const btnStepEnabled = !this.codeEditor.btnStep.disabled;
            return btnStepEnabled
          }
        }

        //Logger.log('BUILD_CODE', expectedCodeStateDuringTutorialAction)
        expectedCodeState = code.join(', ');
      })
    return expectedCodeState;
  }

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
    const commandsToString = this.codeEditor.stringfyCommands();
    Logger.log('CODE_STATE [codeString]\n', codeString)
    Logger.log('CODE_STATE [commandsToString]\n', commandsToString)
    return codeString === commandsToString;
  }

  createTutorialDropLocation(commandName: string, index = 0) {
    const commands = this.codeEditor.getAddedCommandsByName(commandName);
    return new TutorialDropLocation(null, commands[index]);
  }


  test(scene: Scene, codeEditor: CodeEditor) {
    const phase = new MazePhase(this.scene, this.codeEditor);
    let testCount = 0;
    let code = this.buildTutorial(phase, [
      "drag arrow-up to program",
      "drag arrow-up to program"]
    )
    Logger.log('TEST', testCount++, code == 'arrow-up, arrow-up', code);

    code = this.buildTutorial(phase, [
      "drag arrow-up to program",
      "drag if_coin to arrow-up"]
    )
    Logger.log('TEST', testCount++, code == 'arrow-up:if_coin', code);

    code = this.buildTutorial(phase, [
      "drag arrow-up to program",
      "drag if_coin to arrow-up",
      "drag arrow-up to program"
    ]
    )
    Logger.log('TEST', testCount++, code == 'arrow-up:if_coin, arrow-up', code);

    code = this.buildTutorial(phase, [
      "drag arrow-up to program",
      "drag if_coin to arrow-up",
      "drag arrow-up to program",
      "drag if_coin to arrow-up"
    ]
    )
    Logger.log('TEST', testCount++, code == 'arrow-up:if_coin, arrow-up:if_coin', code);

    code = this.buildTutorial(phase, [
      "drag arrow-up to program",
      "drag if_coin to arrow-up",
      "drag arrow-right to program",
      "drag if_block to arrow-right",
    ]
    )
    Logger.log('TEST', testCount, code == 'arrow-up:if_coin, arrow-right:if_block', code);

  }

}

