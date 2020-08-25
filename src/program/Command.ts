import { GameObjects } from 'phaser';

export default class Command {

  onRemoveCommand?: (command: Command) => any;
  sprite: GameObjects.Sprite;
  removeSprite: GameObjects.Sprite;
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, sprite: GameObjects.Sprite, removeBtnTexture: string) {
    this.sprite = sprite;
    this.scene = scene;
    this.removeSprite = scene.add.sprite(this.sprite.x, this.sprite.y, removeBtnTexture);
    this.removeSprite.setScale(sprite.scale);

    scene.input.setDraggable(sprite.setInteractive({ cursor: 'pointer' }), false);
    sprite.removeAllListeners('pointerover');
    sprite.removeAllListeners('pointerout');

    sprite.on('pointerover', () => {
      this.removeSprite.visible = true;
    })

    sprite.on('pointerout', () => {
      this.removeSprite.visible = false;
    })

    sprite.on('pointerdown', () => {
      if (this.onRemoveCommand) {
        this.onRemoveCommand(this);
        scene.children.remove(sprite);
        scene.children.remove(this.removeSprite);
      }
    })
  }

  getAction(): string {
    let action: string = ''
    switch (this.sprite.texture.key) {
      case 'arrow-up': action = 'moveUp'; break;
      case 'arrow-down': action = 'moveDown'; break;
      case 'arrow-left': action = 'moveLeft'; break;
      case 'arrow-right': action = 'moveRight'; break;
    }
    return action;
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.removeSprite.x = x;
    this.removeSprite.y = y;
  }

  removeSelf() {
    this.scene.children.remove(this.sprite);
    this.scene.children.remove(this.removeSprite);
  }
}
