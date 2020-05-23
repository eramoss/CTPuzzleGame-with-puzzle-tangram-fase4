import Phaser, { Physics } from 'phaser'
import Carrot from '../game/Carrot'

export default class Game extends Phaser.Scene {

  private player?: Phaser.Physics.Arcade.Sprite
  private platforms?: Phaser.Physics.Arcade.StaticGroup
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private carrots?: Phaser.Physics.Arcade.Group
  private carrotsCollected: integer = 0
  private carrotsCollectedText: Phaser.GameObjects.Text
  private powerup?: Phaser.Physics.Arcade.Sprite

  constructor() {
    super('game')
  }


  preload() {
    this.load.image('background', 'assets/PNG/Background/bg_layer1.png')
    this.load.image('platform', 'assets/PNG/Environment/ground_grass.png')
    this.load.image('bunny-stand', 'assets/PNG/Players/bunny1_stand.png')
    this.load.image('carrot', 'assets/PNG/Items/carrot.png')
    this.load.image('bunny-jump', 'assets/PNG/Players/bunny1_jump.png')

    this.load.image('powerup', 'assets/PNG/Items/powerup_bunny.png')
    this.load.audio('jump', 'assets/sfx/phaseJump1.ogg')
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.add.image(240, 320, 'background')
      .setScrollFactor(1, 0)

    //this.physics.add.image(240,320, 'bunny-stand').setScale(0.5)
    //this.physics.add.image(240, 320, 'platform').setScale(0.5)
    this.createPlatforms()
    this.createBunnySprite()
    this.createCarrots();
    this.createPontuationIndicator();
    this.createDraggablePowerUp();
    this.setupCollisions()
    this.setupCamera()
  }

  init() {
    this.carrotsCollected = 0;
  }

  update() {
    this.handlePlayerMoves()
    this.reusePlatforms()
    this.horizontalWrap(this.player)
    this.handleFallDown();
  }

  handleFallDown() {
    const bottomPlatform: Phaser.Physics.Arcade.Image = this.findBottomMostPlatform();
    if (this.player.body.y > bottomPlatform.y) {
      this.scene.start('game-over')
    }
  }

  findBottomMostPlatform(): Phaser.Physics.Arcade.Image {
    const platforms = this.platforms.getChildren() as Array<Phaser.Physics.Arcade.Image>;
    let bottomPlatform = platforms[0];
    for (let i = 1; i < platforms.length; i++) {
      const platform = platforms[i];
      if (platform.y < bottomPlatform.y) {
        continue
      }
      bottomPlatform = platform
    }
    return bottomPlatform;
  }

  horizontalWrap(sprite: Phaser.Physics.Arcade.Sprite) {
    const halfWidth = sprite.displayWidth * 0.5
    const gameWidth = this.scale.width
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth
    }
    if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth
    }
  }

  reusePlatforms() {
    this.platforms.children.iterate((child: Phaser.Physics.Arcade.Image) => {
      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        (platform.body as Physics.Arcade.StaticBody).updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    })
  }

  addCarrotAbove(sprite: Phaser.GameObjects.Image) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, 'carrot');
    carrot.body.checkCollision.up = false;
    this.add.existing(carrot);
    carrot.body.setSize(carrot.width, carrot.height);
    carrot.setActive(true);
    carrot.setVisible(true);
    this.add.existing(carrot);
    this.physics.world.enable(carrot);
    return carrot;
  }

  handlePlayerMoves() {
    this.onTouchDownPlayerJump()
    this.onLeftRightKeysMovePlayer();
    this.onUpPressedJumpTaller()
  }

  onTouchDownPlayerJump() {
    const touchingDown = this.player.body.touching.down
    if (touchingDown) {
      this.player.setVelocityY(-300)
      this.sound.play('jump');
      this.player.setTexture('bunny-jump')
    }
    if (this.player.body.velocity.y > 0 && this.player.texture.key !== 'bunny-stand') {
      this.player.setTexture('bunny-stand')
    }
  }

  onLeftRightKeysMovePlayer() {
    let velocityX = 0;
    if (this.cursors.left.isDown)
      velocityX = -200
    else if (this.cursors.right.isDown)
      velocityX = 200
    this.player.setVelocityX(velocityX)
  }

  onUpPressedJumpTaller() {
    const touchingDown = this.player.body.touching.down
    if (touchingDown) {
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-350);
      }
    }
  }

  createPontuationIndicator() {
    const style = { color: "#000", fontSize: 24 }
    this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
  }

  createDraggablePowerUp() {
    const powerup = this.physics.add.staticSprite(0, 0, 'powerup');
    // const body = powerup.body as Phaser.Physics.Arcade.Body;
    // body.setAllowGravity(false);

    const container = this.add.container(100, 100, [powerup]);
    container.setSize(powerup.width, powerup.height)
    container.setInteractive();
    this.input.setDraggable(container);
    this.input.on('drag', (pointer: string, obj: Phaser.Physics.Arcade.Body, x: number, y: number) => {
      obj.y = y
      obj.x = x
    })
    this.powerup = powerup;
  }

  createPlatforms() {
    const platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;
      const platform = platforms.create(x, y, 'platform');
      platform.scale = 0.5;
      const body = platform.body
      body.updateFromGameObject()
    }
    this.platforms = platforms;
  }

  createBunnySprite() {
    this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'bunny-stand')
      .setScale(0.5)
    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.right = false
    this.player.body.checkCollision.left = false
  }

  createCarrots() {
    this.carrots = this.physics.add.group({
      classType: Carrot
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.platforms, this.carrots);
    this.physics.add.collider(this.platforms, this.player);
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this
    )
    this.physics.add.overlap(
      this.player,
      this.powerup,
      this.handlePowerup,
      undefined,
      this
    )
  }

  handleCollectCarrot(player: Phaser.GameObjects.GameObject, carrot: Phaser.GameObjects.GameObject) {
    this.carrots.killAndHide(carrot);
    const localCarrot = carrot as Phaser.GameObjects.GameObject
    this.physics.world.disableBody(localCarrot.body as Phaser.Physics.Arcade.Body);
    this.carrotsCollected++
    this.carrotsCollectedText.text = `Carrots: ${this.carrotsCollected}`
  }

  handlePowerup(player: Phaser.GameObjects.GameObject, powerup: Phaser.GameObjects.GameObject) {
    const localPlayer = player as Phaser.Physics.Arcade.Sprite
    localPlayer.setScale(localPlayer.scale + 0.003)
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(800 * 1.5);
  }
}
