import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import SpriteDropZone from './SpriteDropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import FlexFlow from '../geom/FlexFlow';
import Command from '../program/Command';
import CommandIntent from '../program/CommandIntent';

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
  arrowsGrid: FlexFlow;
  grid: AlignGrid;

  constructor(scene: Scene, programs: Program[], sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.programs = programs;
    this.scene = scene;
    this.grid = grid;

    const controlsImage = grid.addImage(0.5, 1, 'controls', 3, 19);
    this.arrowsGrid = new FlexFlow(scene)
    this.arrowsGrid.flow = 'column'

    this.arrowsGrid.x = controlsImage.x - controlsImage.displayWidth / 2
    this.arrowsGrid.y = controlsImage.y - controlsImage.displayHeight / 2
    this.arrowsGrid.width = controlsImage.displayWidth
    this.arrowsGrid.height = controlsImage.displayHeight

    this.scale = grid.scale
    this.createGlobalDragLogic();
    this.createDraggableProgramCommands();

    this.dropZones = programs.map(program => program.dropZone)
    this.createStartStopButtons();

  }

  createEventsToCommandsForAddedPrograms() {
    this.programs.forEach(p => {
      this.createEventsToCommands(p.commands);
    })
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

  private getByTextureName(commands: Command[], textureName: string): Command {
    return commands.filter(c => c.sprite.texture.key === textureName)[0]
  }

  private createDraggableProgramCommands(commandName: string = null) {
    const commandGroup = this.scene.add.group();
    let commandNames = ['arrow-left', 'arrow-up', 'arrow-down', 'arrow-right', 'prog_0', 'prog_1', 'prog_2']
    if (commandName) {
      commandNames = commandNames.filter(c => c == commandName)
    }
    const commands: Command[] = commandNames
      .map(commandName => {
        let sprite = commandGroup.get(0, 0, commandName)
        return new Command(this.scene, sprite)
      })

    console.log('COMMAND_NAMES', commandNames);

    let positions = {
      'arrow-left': 0,
      'arrow-right': 1,
      'arrow-up': 2,
      'arrow-down': 3,
      'prog_0': 4,
      'prog_1': 5,
      'prog_2': 6,
    }
    Object.getOwnPropertyNames(positions)
      .forEach(commandName => {
        let position = positions[commandName]
        const commandToPutAtPallet = this.getByTextureName(commands, commandName);
        if (commandToPutAtPallet) {
          this.arrowsGrid.setChildAt(commandToPutAtPallet.sprite, position)
        }
      });
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
      commandSprite.on('dragstart', _ => {
        console.log("MOVE_EVENT", "dragstart")
        // Não deixa acabar os comandos
        command.programDropZone = null;
        this.highlightDropZones()
        this.clickTime = this.getTime()
        this.sounds.drag();
        this.createDraggableProgramCommands(commandSprite.texture.key);
        commandSprite.setScale(this.scale * 1.2)
      })
      commandSprite.on('dragend', _ => {
        console.log("MOVE_EVENT", "dragend");
        let clicked = this.getTime() - this.clickTime < 400;
        let dropped = command.programDropZone != null;

        let dropZone = command.programDropZone;
        let programToDropInto = this.getProgramByDropzone(dropZone);
        const isAddedToSomeProgram = command.program != null;

        if (clicked && !isAddedToSomeProgram) {
          let main = this.getMainProgram();
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
            if (!programToDropInto) {
              command.removeSelf();
            }
          }

          if (!dropped) {
            command.removeSelf();
          }
        }

        this.highlightDropZones(false);
        commandSprite.setScale(this.scale);
      })
      commandSprite.on('drop', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        console.log("MOVE_EVENT", "drop ", dropZone)
        let programWhereAreDropped = this.programs
          .flatMap(p => p.dropZone)
          .filter(d => d.zone == dropZone)[0];
        if (!programWhereAreDropped) {
          const commandIntentWhereAreDroppedInPlace: Command = this.programs
            .flatMap(p => p.commands)
            .filter(c => c.isIntent)
            .find(c => c.tileDropZone?.zone == dropZone);
          if (commandIntentWhereAreDroppedInPlace) {
            programWhereAreDropped = commandIntentWhereAreDroppedInPlace.program.dropZone;
          }
        }
        command.programDropZone = programWhereAreDropped;
      })
      commandSprite.on('dragleave', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        const commandIntentLeaved: Command = this.programs
          .flatMap(p => p.commands)
          .filter(c => c.isIntent)
          .find(c => c.tileDropZone?.zone == dropZone);
        if (commandIntentLeaved) {
          commandIntentLeaved.removeSelf();
        }
      })
      commandSprite.on('dragenter', (pointer: Phaser.Input.Pointer, dropZone: Phaser.GameObjects.Zone) => {
        const commandHovered: Command = this.programs
          .flatMap(p => p.commands)
          .filter(c => !c.isIntent)
          .find(c => c.tileDropZone?.zone == dropZone);
        if (commandHovered) {
          if (commandHovered != command) {
            console.log("MOVE_OBJECT", 'dragenter [command]', commandHovered);
            const commandIntent = new CommandIntent(this.scene, commandHovered);
            command.intent = commandIntent;
          }
        }
      })
    })
  }
  highlightDropZones(highlight: boolean = true) {
    this.dropZones.forEach(dropZone => {
      dropZone.highlight(highlight);
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
    this.grid.placeAt(22.5, 4.2, btnPlay.sprite, 2.3)
    this.grid.placeAt(22.5, 8, btnStop.sprite, 2.3)

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

  getMainProgram(): Program {
    return this.programs[0]
  }
}
