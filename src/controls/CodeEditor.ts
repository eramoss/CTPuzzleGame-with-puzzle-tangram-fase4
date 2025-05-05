import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import Command from '../program/Command';
import { joinChilds } from '../utils/Utils';
import InterfaceElement from '../InterfaceElement';
import { Logger } from '../main';
import Trash from './Trash';

export default class CodeEditor {

  scene: Scene;
  programs: Program[];
  onClickRun: () => void = () => { };
  onRotateLeft: () => void = () => { };
  onRotateRight: () => void = () => { };
  onEditProgram: () => void = () => { };
  onReplayCurrentPhase: () => void = () => { };
  onInteract: () => void = () => { };
  onClickStop: () => void = () => { };
  onClickStepByStep: () => void = () => { };

  onRemoveCommand: (command: Command) => void = () => { };
  sounds: Sounds;
  controlsScale: number;
  scale: number
  clickTime: number = this.getTime()
  grid: AlignGrid;
  lastEditedProgram: Program;
  btnStep: Button;
  btnStop: Button;
  btnPlay: Button;
  btnLeft: Button;
  btnRight: Button;
  availableCommands: Command[] = [];
  onShowInstruction: (instruction: string) => void = () => { };
  onHideLastInstruction: () => void = () => { };
  trash: Trash;
  toolboxCommandsGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Scene, sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.scene = scene;
    this.grid = grid;
    this.scale = grid.scale

    this.createStartStopStepButton();
  }

  setOnBlinkBtnStep(onBlink: (blinked: boolean) => void) {
    this.btnStep.onBlink = onBlink
  }

  getTime(): number {
    return new Date().getTime()
  }

  //Aqui é chamado o botão de play
  private createStartStopStepButton() {
    this.btnPlay = new Button(this.scene, this.sounds, 0, 0, 'btn-play', () => {
      this.onClickRun();
    })
    this.btnRight = new Button(this.scene, this.sounds, 0, 0, 'giroright', () => {
      this.onRotateRight();
    })
    this.btnLeft = new Button(this.scene, this.sounds, 0, 0, 'giroleft', () => {
      this.onRotateLeft();
    })
    this.resetPositionsStartStopStepButton();
    this.setPlayBtnModeStoppeds();
  }
  
  resetPositionsStartStopStepButton() {
    this.grid.placeAt(6, 17, this.btnPlay.sprite, 2)
    this.grid.placeAt(9, 17, this.btnLeft.sprite, 2)
    this.grid.placeAt(11, 17, this.btnRight.sprite, 2)
  }

  showStopBtnAtLeft() {
    this.grid.placeAt(4, 17, this.btnStop.sprite, 2)
  }

  setPlayBtnModeStoppeds() {
    this.resetPositionsStartStopStepButton()
    this.btnPlay.show()
    this.btnLeft.show()
    this.btnRight.show()
  }

  setPlayBtnModeStopped() {
    this.btnPlay.show()
    this.btnStop.hide();
    this.unhighlightStepButton();
  }

  setPlayBtnModePlaying() {
    this.btnPlay.hide()
    this.btnStop.show();
  }

  setPlayBtnModeDebugStoped(){
    this.btnPlay.show()
    this.showStopBtnAtLeft()
  }

  getLastEditedOrMainProgramOrFirstNonfull(): Program {
    const mainProgram = this.programs[0];
    let lastEditedProgram = this.lastEditedProgram;
    if (lastEditedProgram?.isEmpty()) {
      lastEditedProgram = null;
    }
    let program = lastEditedProgram || mainProgram;
    if (program.isFull()) {
      program = this.programs.find(p => !p.isFull())
      if (!program) {
        program = mainProgram;
      }
    }
    return program
  }

  prepare(options: PlayPhaseOptions) {
    if (options.clearCodeEditor) {
      this.clear();
    }
    this.disanimatePrograms();
    this.unhighlightStepButton();
    this.setPlayBtnModeStopped();
  }

  clear() {
    this.programs.forEach(p => p.clear());
  }

  disanimatePrograms() {
    this.programs.forEach(p => {
      p.disanimate()
    });
  }

  highlightStepButton() {
    this.btnStep.blink();
  }

  unhighlightStepButton() {
    this.btnStep.stopBlink();
  }

  notifyWhenProgramIsEditted() {
    this.programs.forEach(p => {
      p.onEdit = () => {
        this.onEditProgram()
      }
    })
  }

  countAddedCommands(): number {
    const count = joinChilds(this.programs, (p) => p.ordinalCommands).length;
    Logger.log('CODE_EDITOR [countAddedCommands]', count)
    return count
  }

  getAddedCommandsByName(textureKey: string): Command[] {
    return this.getAllOrdinalCommands()
      .filter(command => command.name == textureKey);
  }

  getAvailableCommandsByName(textureKey: string): Command[] {
    return this.availableCommands
      .filter(command => command.name == textureKey);
  }

  private getAllOrdinalCommands() {
    return joinChilds(this.programs, (p) => p.ordinalCommands);
  }

  private getAllAddedCommands(): Command[] {
    return joinChilds(this.programs, (p) => p.getAllCommands());
  }

  getInterfaceElements(onlyFixedElements: boolean = false): InterfaceElement[] {
    const interfaceElements = [];
    interfaceElements.push(this.btnPlay)
    interfaceElements.push(this.btnStep)
    //interfaceElements.push(this.btnStop)
    this.availableCommands.forEach(availableCommand => {
      interfaceElements.push(availableCommand);
    })
    if (!onlyFixedElements) {
      this.getAllAddedCommands().forEach(addedCommand => {
        interfaceElements.push(addedCommand);
      })
    }
    return interfaceElements;
  }

  disableInteractive() {
    this.getInterfaceElements()
      .forEach(genericInteraceElement => {
        genericInteraceElement.disableInteractive();
      })
  }

  setInteractive() {
    this.getInterfaceElements()
      .forEach(genericInteraceElement => {
        genericInteraceElement?.setInteractive();
      })
  }

  replay() {
    this.sounds.error();
    this.onReplayCurrentPhase();
  }

  getCode(): string {
    return this.getCommandsAsString().join(', ');
  }

  getCommandsAsString(): string[] {
    return this.getAllOrdinalCommands().map(c => c.stringfy())
  }
}

export class PlayPhaseOptions {
  clearCodeEditor?: boolean = true
  clearResponseState?: boolean = false
  muteInstructions?: boolean = true
}
