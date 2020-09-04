import { Scene, Input, GameObjects } from 'phaser';
import Button from './Button';
import Program from '../program/Program';
import DropZone from './DropZone';
import Sounds from '../sounds/Sounds';
import AlignGrid from '../geom/AlignGrid';
import Trash from './Trash';
import FlexFlow from '../geom/FlexFlow';

export default class CodeEditor {

  scene: Scene;
  program: Program;
  dropZone: DropZone
  fnOnClickRun: () => void;
  fnOnClickStop: () => void;
  sounds: Sounds;
  controlsScale: number;
  trash: Trash;
  scale: number
  clickTime: number = this.getTime()
  arrowsGrid: FlexFlow;
  grid: AlignGrid;

  constructor(scene: Scene, program: Program, sounds: Sounds, grid: AlignGrid) {
    this.sounds = sounds;
    this.program = program;
    this.scene = scene;
    this.grid = grid;

    const controlsImage = grid.addImage(0.5, 3.3, 'controls', 3);
    this.arrowsGrid = new FlexFlow(scene)
    this.arrowsGrid.flow = 'column'

    this.arrowsGrid.x = controlsImage.x - controlsImage.displayWidth / 2
    this.arrowsGrid.y = controlsImage.y - controlsImage.displayHeight / 2
    this.arrowsGrid.width = controlsImage.displayWidth
    this.arrowsGrid.height = controlsImage.displayHeight

    this.scale = grid.scale
    this.trash = new Trash(this.scene, this.grid, 22.5, 11.5, 2.5, 4);
    this.createGlobalDragLogic();

    this.createDraggableProgramCommands()
    this.dropZone = program.dropZone
    this.createStartStopButtons();
  }

  private createGlobalDragLogic() {
    this.scene.input.on('dragstart', (pointer: Input.Pointer, gameObject: GameObjects.GameObject) => {
      this.scene.children.bringToTop(gameObject);
    });
    this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dragX: integer, dragY: integer) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    this.scene.input.on('dragend', (pointer: Input.Pointer, gameObject: GameObjects.Sprite, dropped: boolean) => {
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }

  private getByTextureName(commands: Phaser.GameObjects.Sprite[], textureName: string): Phaser.GameObjects.Sprite {
    return commands.filter(c => c.texture.key === textureName)[0]
  }

  private createDraggableProgramCommands(commandName: string = null) {
    const commandGroup = this.scene.add.group();
    let commandNames = ['arrow-left', 'arrow-up', 'arrow-down', 'arrow-right']
    if (commandName) {
      commandNames = commandNames.filter(c => c == commandName)
    }
    const commands: Phaser.GameObjects.Sprite[] = commandNames
      .map(commandName => commandGroup.get(0, 0, commandName))

    console.log('COMMAND_NAMES', commandNames);

    let positions = {
      'arrow-left': 0,
      'arrow-right': 1,
      'arrow-up': 2,
      'arrow-down': 3,
    }
    Object.getOwnPropertyNames(positions).forEach(key => {
      let position = positions[key]
      this.arrowsGrid.setChildAt(this.getByTextureName(commands, key), position)
    });

    commands.forEach((commandSprite: Phaser.GameObjects.Sprite) => {
      commandSprite.setScale(this.scale);
      this.scene.input.setDraggable(commandSprite.setInteractive({ cursor: 'grab' }));
      commandSprite.on('pointerdown', _ => {
        this.dropZone.highlight()
        this.clickTime = this.getTime()
      });
      commandSprite.on('pointerup', _ => {
        this.dropZone.highlight(false)
        if (this.getTime() - this.clickTime < 100) {
          this.addCommandToProgram(commandSprite)
        }
      });
      commandSprite.on('pointerover', _ => {
        this.sounds.hover();
        commandSprite.setScale(this.scale * 1.2);
      });
      commandSprite.on('pointerout', _ => {
        commandSprite.setScale(this.scale);
      });
      commandSprite.on('dragstart', _ => {
        // Não deixa acabar os comandos
        this.sounds.drag();
        this.createDraggableProgramCommands(commandSprite.texture.key);
        commandSprite.setScale(this.scale * 1.2)
        this.trash.open();
      })
      this.scene.input.on('dragend', (pointer: Phaser.Input.Pointer, obj: GameObjects.GameObject, dropZone: DropZone) => {
        if (obj == commandSprite) {
          if (!dropZone) {
            this.removeCommandFromProgram(commandSprite)
          }
        }
      });
      commandSprite.on('dragend', (teste, teste2) => {
        console.log(teste2);
        this.trash.close();
        commandSprite.setScale(this.scale);
      })
      commandSprite.on('drop', _ => {
        if (this.trash.spriteIsHover(commandSprite)) {
          this.removeCommandFromProgram(commandSprite)
        } else {
          this.addCommandToProgram(commandSprite);
        }
      })
    })
  }

  getTime(): number {
    return new Date().getTime()
  }

  private addCommandToProgram(command: Phaser.GameObjects.Sprite) {
    this.sounds.drop();
    this.program.addCommand(command)
  }

  private removeCommandFromProgram(command: Phaser.GameObjects.Sprite) {
    this.program.removeCommandBySprite(command);
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

  highlight(step: number) {
    this.program.commands.forEach(command => command.sprite.clearTint())
    this.program.commands[step]?.sprite?.setTint(0x0ffff0);
  }
}
