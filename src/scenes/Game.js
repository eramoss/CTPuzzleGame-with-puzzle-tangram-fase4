import Phaser from '../lib/phaser.js'
import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {

  player
  platforms
  cursors
  carrots
  carrotsCollected = 0
  carrotsCollectedText

  constructor() {
    super('game')
  }


  preload() {
    this.load.image('background', 'assets/PNG/Background/bg_layer1.png')
    this.load.image('platform', 'assets/PNG/Environment/ground_grass.png')
    this.load.image('bunny-stand', 'assets/PNG/Players/bunny1_stand.png')
    this.load.image('carrot', 'assets/PNG/Items/carrot.png')
    this.load.image('bunny-jump', 'assets/PNG/Players/bunny1_jump.png')
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
    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.body.y > bottomPlatform.y) {
      this.scene.start('game-over')
    }
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
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

  horizontalWrap(sprite) {
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
    this.platforms.children.iterate(child => {
      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    })
  }

  addCarrotAbove(sprite) {
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
  }

  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
    this.carrotsCollected++
    this.carrotsCollectedText.text = `Carrots: ${this.carrotsCollected}`
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);
  }
}
