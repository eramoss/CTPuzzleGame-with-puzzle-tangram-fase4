import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import SpriteDropZone from './SpriteDropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import Command from '../program/Command';
import CommandIntent from '../program/CommandIntent';
import ToolboxRowOrganizer from './ToolboxRowOrganizer';
import { joinChilds } from '../utils/Utils';

export default class CodeEditor {


  scene: Scene;
  programs: Program[];
  dropZones: SpriteDropZone[]
  onClickRun: () => void = () => { };
  onEditProgram: () => void = () => { };
  onInteract: () => void = () => { };
  onClickStop: () => void = () => { };
  onClickStepByStep: () => void = () => { };
  sounds: Sounds;
  controlsScale: number;
  scale: number
  clickTime: number = this.getTime()
  grid: AlignGrid;
  lastEditedProgram: Program;
  toolboxRows: ToolboxRowOrganizer[];
  btnStep: Button;
  btnStop: Button;
  btnPlay: Button;
  availableCommands: Command[] = [];

  constructor(scene: Scene, programs: Program[], sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.programs = programs;
    this.scene = scene;
    this.grid = grid;
    this.scale = grid.scale
    this.createGlobalDragLogic();
    this.dropZones = programs.map(program => program.dropZone)
    this.createStartStopStepButtons();
    grid.addImage(17, 1, 'toolbox', 8.5, 9);
    this.toolboxRows =
      [
        new ToolboxRowOrganizer(this.grid, 20, 2, 2, 2, ['arrow-up',]),
        new ToolboxRowOrganizer(this.grid, 17, 3, 8, 2, ['arrow-left', 'arrow-right']),
        new ToolboxRowOrganizer(this.grid, 20, 3.7, 2, 2, ['arrow-down']),
        new ToolboxRowOrganizer(this.grid, 18, 5.4, 6, 2, ['if_coin', 'if_block'], 1.1),
        new ToolboxRowOrganizer(this.grid, 18, 7.4, 6, 2, ['prog_0', 'prog_1', 'prog_2'], 1.1),
      ]

    this.createDraggableProgramCommands();
    this.notifyWhenProgramIsEditted()
  }

  addCommands(program: Program, commands: string[]) {
    let addedCommands = program.addCommands(commands)
    this.createEventsToCommands(addedCommands);
  }

  private createGlobalDragLogic() {
    this.scene.input.on('dragstart', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      this.scene.children.bringToTop(gameObject);
    });
    this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dragX: integer, dragY: integer) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
  }

  private createDraggableProgramCommands(commandName: string = null) {
    const commandGroup = this.scene.physics.add.group();
    let commandNames = ['arrow-left', 'arrow-up', 'arrow-down', 'arrow-right', 'prog_0', 'prog_1', 'prog_2', 'if_coin', 'if_block']
    if (commandName) {
      commandNames = commandNames.filter(c => c == commandName)
    }
    const createdCommands: Command[] = commandNames
      .map(commandName => {
        let sprite = commandGroup.get(0, 0, commandName)
        return new Command(this.scene, sprite)
      })

    console.log('COMMAND_NAMES', commandNames);

    createdCommands.forEach(commandToSetPositionAtToobox => {
      let toolboxRow = this.findToolboxRow(commandToSetPositionAtToobox)
      if (toolboxRow) {
        toolboxRow.setPositionTo(commandToSetPositionAtToobox)
      }
    })

    createdCommands.forEach(command => {
      const same = this.availableCommands.find(a => a.isSameTexture(command));
      if (!same) {
        this.availableCommands.push(command);
      }
      else {
        const index = this.availableCommands.indexOf(same);
        this.availableCommands.splice(index, 1, command);
      }
    })

    this.createEventsToCommands(createdCommands);
    return createdCommands;
  }

  findToolboxRow(command: Command): ToolboxRowOrganizer {
    return this.toolboxRows
      .find(toolboxRow => toolboxRow.hasSpaceTo(command));
  }

  createEventsToCommands(commands: Command[]) {
    commands.forEach((command: Command) => {
      let toolboxRow = this.findToolboxRow(command);
      let commandSprite: Phaser.GameObjects.Sprite = command.sprite;
      commandSprite.setScale(toolboxRow.scaleNormal);
      this.scene.input.setDraggable(commandSprite.setInteractive({ cursor: 'grab' }));
      commandSprite.on('pointerdown', _ => {
        this.onInteract();
      })
      commandSprite.on('pointerover', _ => {
        this.sounds.hover();
        commandSprite.setScale(toolboxRow.scaleOnPointerOver);
      });
      commandSprite.on('pointerout', _ => {
        commandSprite.setScale(toolboxRow.scaleNormal);
      });
      commandSprite.on('drag', _ => {
        console.log("MOVE_EVENT", "drag")
        command.isDragged = true;
        if (command.programDropZone) {
          command.removeSelf(false);
          command.programDropZone = null;
          this.logPrograms('drag')
        }
      })
      commandSprite.on('dragstart', (
        input: Phaser.Input.Pointer,
        dragStartOptions:
          {
            dontRecreate: boolean,
            muteDragSound: boolean,
            muteDropSound: boolean,
            onCreateCommandBelow: (codeEditor: CodeEditor, command: Command) => void
          }
      ) => {

        console.log("MOVE_EVENT", "dragstart")
        this.unhighlightConditionalDropZones();
        this.highlightDropZones(command)
        this.clickTime = this.getTime()
        if (!dragStartOptions.muteDragSound) {
          this.sounds.drag();
        }
        if (!dragStartOptions.dontRecreate) {
          const createdCommands = this.createDraggableProgramCommands(commandSprite.texture.key);
          createdCommands
            .forEach(c => {
              c.isDropSoundEnabled = !dragStartOptions.muteDropSound
            });
          if (dragStartOptions.onCreateCommandBelow) {
            if (createdCommands.length > 1) {
              console.warn('Atenção. Há mais de um comando criado para substituir o arrastado!')
            }
            dragStartOptions.onCreateCommandBelow(this, createdCommands[0]);
          }
        }
        commandSprite.setScale(toolboxRow.scaleOnDragStart)
        this.logPrograms('dragstart')
      })
      commandSprite.on('dragend', () => {
        console.log("MOVE_EVENT", "dragend");

        let dragged = command.isDragged && command.isSpriteConsiderableDragged(this.grid);
        let clicked = this.getTime() - this.clickTime < 700 && !dragged;
        let dropped = command.programDropZone != null;
        let isConditional = command.isConditional;

        if (dragged && !dropped) {
          command.removeSelf();
        }

        if (isConditional) {
          if (clicked && !dragged) {
            command.removeSelf();
          }
          if (dropped) {
            if (!command.placedOver) {
              command.removeSelf();
            }
          }
          if (!dropped) {
            if (dragged) {
              command.removeSelf();
            }
          }
        }
        if (!isConditional) {

          let dropZone = command.programDropZone;
          let programToDropInto = this.getProgramByDropzone(dropZone);
          const isAddedToSomeProgram = command.program != null;

          if (programToDropInto) {
            this.lastEditedProgram = programToDropInto;
          }

          if (clicked && !isAddedToSomeProgram) {
            let programToAddWhenClicked = this.getLastEditedOrMainProgramOrFirstNonfull();
            if (programToAddWhenClicked.isFull()) {
              command.removeSelf();
            }
            if (!programToAddWhenClicked.isFull()) {
              command.setProgram(programToAddWhenClicked);
            }
          }

          if (clicked && isAddedToSomeProgram) {
            if (!(dropped && programToDropInto != command.program)) {
              command.removeSelf();
            } else {
              command.cancelMovement();
            }
          }

          if (!clicked) {
            if (dropped) {
              if (programToDropInto) {
                command.intent?.consolidateIntentionToDrop(command);
                command.setProgram(programToDropInto);
              }
            }

            if (!dropped) {
              command.removeSelf();
            }
          }
          command.program?.reorganize();
        }
        command.isDragged = false;
        this.unhighlightDropZones(command);
        commandSprite.setScale(toolboxRow.scaleNormal);

        this.logPrograms('dragend');
      })
      commandSprite.on('drop', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        console.log("MOVE_EVENT", "drop ", dropZone)

        let programWhereAreDropped = this.programs
          .map(p => p.dropZone)
          .filter(d => d.zone == dropZone)[0];

        const commandIntentWhereAreDroppedInPlace: Command =
          this.getAllProgramCommands()
            .filter(c => c.isIntent)
            .find(c => c.tileDropZone?.zone == dropZone);

        const ordinalCommandWhereIfArePlacedOver: Command =
          this.getAllProgramCommands()
            .filter(c => !c.isIntent && !c.isConditional)
            .find(c => c.tileDropZone?.zone == dropZone);

        if (!programWhereAreDropped) {
          if (commandIntentWhereAreDroppedInPlace) {
            programWhereAreDropped = commandIntentWhereAreDroppedInPlace.program.dropZone;
          } else {
            if (command.tileDropZone?.zone == dropZone) {
              programWhereAreDropped = command.program?.dropZone;
            }
          }
        }

        if (command.isConditional) {
          programWhereAreDropped = null;
          if (ordinalCommandWhereIfArePlacedOver) {
            ordinalCommandWhereIfArePlacedOver.setCondition(command);
            programWhereAreDropped = ordinalCommandWhereIfArePlacedOver.programDropZone
          }
        }

        command.programDropZone = programWhereAreDropped;

        this.logPrograms('drop');
      })

      commandSprite.on('dragleave', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        console.log("MOVE_EVENT", "dragleave")
        const commandIntentLeaved: Command =
          this.getAllProgramCommands()
            .filter(c => c.isIntent)
            .find(c => c.tileDropZone?.zone == dropZone);
        if (commandIntentLeaved) {
          commandIntentLeaved.removeSelf();
        }
      })

      commandSprite.on('dragenter', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        const commandHovered: Command = this.getAllProgramCommands()
          .filter(c => !c.isIntent)
          .find(c => c.tileDropZone?.zone == dropZone);
        if (commandHovered && !commandHovered.program?.isFull()) {
          console.log("MOVE_EVENT", 'dragenter [commandHovered]', commandHovered);
          if (dropZone != command?.tileDropZone?.zone) {
            if (!command.isConditional) {
              const commandIntent = new CommandIntent(this.scene, commandHovered);
              command.intent = commandIntent;
            }
          }
        }
      })
    })
  }

  getAllProgramCommands(): Array<Command> {
    return joinChilds(this.programs, (program) => program.ordinalCommands)
  }

  private logPrograms(moment: string) {
    this.programs.forEach(p => {
      console.log('MOVE_EVENT', moment, 'Program Commands => ', p.name, '=> [', p.stringfyOrdinalCommands(), p.stringfyConditionalCommands(), ']');
    });
    this.programs.forEach(p => {
      console.log('Program Conditionals. Size:', p.name, '=>', p.conditionalCommandsIndexed.size)
      p.conditionalCommandsIndexed.forEach((command: Command, index: number) => {
        console.log('Program Conditionals => ', index, command.name, ' over ', command.placedOver?.name)
      });
    });
  }

  highlightDropZones(command: Command) {
    console.log('CODE_EDITOR [highlightDropZones]')
    if (command.isConditional) {
      this.programs.forEach(p => p.highlightConditionalAreas(command))
    }
    if (!command.isConditional) {
      this.dropZones.forEach(dropZone => {
        dropZone.highlight(true);
      })
    }
  }

  unhighlightDropZones(command: Command = null) {
    console.log('CODE_EDITOR [unhighlightDropZones]')
    if (command.isConditional) {
      this.unhighlightConditionalDropZones();
    }
    this.dropZones.forEach(dropZone => {
      dropZone.highlight(false);
    })
  }

  unhighlightConditionalDropZones() {
    this.programs.forEach(p => p.unhighlightConditionalAreas());
  }

  getTime(): number {
    return new Date().getTime()
  }

  private createStartStopStepButtons() {
    this.btnPlay = new Button(this.scene, this.sounds, 0, 0, 'btn-play', () => {
      this.onClickRun();
    })
    this.btnStop = new Button(this.scene, this.sounds, 0, 0, 'btn-stop', () => {
      this.sounds.stop();
      this.onClickStop();
    })
    this.btnStep = new Button(this.scene, this.sounds, 0, 0, 'btn-step', () => {
      //this.sounds.stop();
      this.onClickStepByStep();
    })
    this.grid.placeAt(1, 17, this.btnPlay.sprite, 2.3)
    this.grid.placeAt(4, 17, this.btnStep.sprite, 2.3)
    this.grid.placeAt(7, 17, this.btnStop.sprite, 2.3)

  }

  getProgramByDropzone(zone: SpriteDropZone) {
    return this.programs.filter(program => program.dropZone === zone)[0]
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

  clear() {
    this.programs.forEach(p => p.clear());
  }

  disanimatePrograms() {
    this.programs.forEach(p => p.disanimateCommands());
  }

  highlightStepButton() {
    this.btnStep.blink();
  }

  unhighlightStepButton() {
    this.btnStep.stopBlink();
  }

  disableStepButton() {
    this.btnStep.disable();
  }

  enableStepButton() {
    this.btnStep.enable();
  }

  disablePlayButton() {
    this.btnPlay.disable();
  }

  enablePlayButton() {
    this.btnPlay.enable();
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
    console.log('CODE_EDITOR [countAddedCommands]', count)
    return count
  }

  getCommandByName(textureKey: string) {
    return joinChilds(this.programs, (p) => p.ordinalCommands)
      .find(command => command.name == textureKey);
  }
}
