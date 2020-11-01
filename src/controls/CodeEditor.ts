import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import SpriteDropZone from './SpriteDropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import Command from '../program/Command';
import CommandIntent from '../program/CommandIntent';
import FlexFlow from '../geom/FlexFlow';
import ToolboxRowOrganizer from './ToolboxRowOrganizer';

export default class CodeEditor {

  scene: Scene;
  programs: Program[];
  dropZones: SpriteDropZone[]
  fnOnClickRun: () => void;
  fnOnClickStop: () => void;
  sounds: Sounds;
  controlsScale: number;
  scale: number
  clickTime: number = this.getTime()
  grid: AlignGrid;
  lastEditedProgram: Program;
  toolboxRows: ToolboxRowOrganizer[];

  constructor(scene: Scene, programs: Program[], sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.programs = programs;
    this.scene = scene;
    this.grid = grid;

    grid.addImage(17, 1, 'toolbox', 8.5, 9);

    this.scale = grid.scale
    this.createGlobalDragLogic();


    this.dropZones = programs.map(program => program.dropZone)
    this.createStartStopButtons();

    this.toolboxRows =
      [
        new ToolboxRowOrganizer(this.grid, 18, 2, 6, 2, ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down']),
        new ToolboxRowOrganizer(this.grid, 18, 4, 6, 2, ['prog_0', 'prog_1', 'prog_2']),
        new ToolboxRowOrganizer(this.grid, 18, 6, 6, 2, ['if_coin', 'if_block'])
      ]

    this.createDraggableProgramCommands();

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

  private getCommandByTextureName(commands: Command[], textureName: string): Command {
    return commands.filter(c => c.sprite.texture.key === textureName)[0]
  }

  private createDraggableProgramCommands(commandName: string = null) {
    const commandGroup = this.scene.add.group();
    let commandNames = ['arrow-left', 'arrow-up', 'arrow-down', 'arrow-right', 'prog_0', 'prog_1', 'prog_2', 'if_coin', 'if_block']
    if (commandName) {
      commandNames = commandNames.filter(c => c == commandName)
    }
    const commands: Command[] = commandNames
      .map(commandName => {
        let sprite = commandGroup.get(0, 0, commandName)
        return new Command(this.scene, sprite)
      })

    console.log('COMMAND_NAMES', commandNames);

    commands.forEach(commandToSetPositionAtToobox => {
      this.toolboxRows
        .find(toolboxRow => toolboxRow.hasSpaceTo(commandToSetPositionAtToobox))
        ?.setPositionTo(commandToSetPositionAtToobox)
    })

    this.createEventsToCommands(commands);
  }

  createEventsToCommands(commands: Command[]) {
    commands.forEach((command: Command) => {
      let commandSprite: Phaser.GameObjects.Sprite = command.sprite;
      commandSprite.setScale(this.scale);
      this.scene.input.setDraggable(commandSprite.setInteractive({ cursor: 'grab' }));
      commandSprite.on('pointerover', _ => {
        this.sounds.hover();
        commandSprite.setScale(this.scale * 1.2);
      });
      commandSprite.on('pointerout', _ => {
        commandSprite.setScale(this.scale);
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
      commandSprite.on('dragstart', _ => {
        console.log("MOVE_EVENT", "dragstart")
        // Não deixa acabar os comandos
        this.highlightDropZones(command)
        this.clickTime = this.getTime()
        this.sounds.drag();
        this.createDraggableProgramCommands(commandSprite.texture.key);
        commandSprite.setScale(this.scale * 1.5)
        this.logPrograms('dragstart')
      })
      commandSprite.on('dragend', _ => {
        console.log("MOVE_EVENT", "dragend");

        let dragged = command.isDragged;
        let clicked = this.getTime() - this.clickTime < 1000 && !dragged;
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
            let main = this.getLastEditedOrMainProgramOrFirstNonfull();
            command.setProgram(main);
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

            //this.logPrograms('dragend begin')

            if (!dropped) {
              command.removeSelf();
            }
          }
          command.program?.reorganize();
        }
        command.isDragged = false;
        this.unhighlightDropZones(command);
        commandSprite.setScale(this.scale);

        this.logPrograms('dragend');
      })
      commandSprite.on('drop', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        console.log("MOVE_EVENT", "drop ", dropZone)

        let programWhereAreDropped = this.programs
          .flatMap(p => p.dropZone)
          .filter(d => d.zone == dropZone)[0];

        const commandIntentWhereAreDroppedInPlace: Command = this.programs
          .flatMap(p => p.ordinalCommands)
          .filter(c => c.isIntent)
          .find(c => c.tileDropZone?.zone == dropZone);

        const ordinalCommandWhereIfArePlacedOver: Command = this.programs
          .flatMap(p => p.ordinalCommands)
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
        const commandIntentLeaved: Command = this.programs
          .flatMap(p => p.ordinalCommands)
          .filter(c => c.isIntent)
          .find(c => c.tileDropZone?.zone == dropZone);
        if (commandIntentLeaved) {
          commandIntentLeaved.removeSelf();
        }
      })

      commandSprite.on('dragenter', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        const commandHovered: Command = this.programs
          .flatMap(p => p.ordinalCommands)
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
  private logPrograms(moment: string) {
    this.programs.forEach(p => {
      console.log('MOVE_EVENT', moment, 'Program Commands => ', p.name, '=> [', p.ordinalCommands.map(c => c.name).join(', '), ']');
    });
    this.programs.forEach(p => {
      //console.log('program_log_conditional', p.name)
      console.log('Program Conditionals. Size:', p.name, '=>', p.conditionalCommandsIndexed.size)
      p.conditionalCommandsIndexed.forEach((command: Command, index: number) => {
        console.log('Program Conditionals => ', index, command.name, ' over ', command.placedOver?.name)
      });
    });
  }

  highlightDropZones(command: Command) {
    if (command.isConditional) {
      this.programs.forEach(p => p.highlightConditionalAreas(command))
    }
    if (!command.isConditional) {
      this.dropZones.forEach(dropZone => {
        dropZone.highlight(true);
      })
    }
  }

  unhighlightDropZones(command: Command) {
    if (command.isConditional) {
      this.programs.forEach(p => p.unhighlightConditionalAreas())
    }
    this.dropZones.forEach(dropZone => {
      dropZone.highlight(false);
    })
  }

  getTime(): number {
    return new Date().getTime()
  }

  private createStartStopButtons() {
    const btnPlay = new Button(this.scene, this.sounds, 0, 0, 'btn-play', () => {
      this.fnOnClickRun();
    })
    const btnStop = new Button(this.scene, this.sounds, 0, 0, 'btn-stop', () => {
      this.sounds.stop();
      this.fnOnClickStop();
    })
    this.grid.placeAt(1, 17, btnPlay.sprite, 2.3)
    this.grid.placeAt(4, 17, btnStop.sprite, 2.3)

  }

  onClickRun(fnOnClickRun: () => void) {
    this.fnOnClickRun = fnOnClickRun;
  }

  onClickStop(fnOnClickStop: () => void) {
    this.fnOnClickStop = fnOnClickStop;
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
}
