import Phaser, { Physics } from 'phaser'

export default class Game extends Phaser.Scene {

  private tiles: Physics.Arcade.StaticGroup
  private player: Physics.Arcade.Sprite

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('tile', 'assets/inkscape/tile.png');
    this.load.image('player', 'assets/PNG/Players/bunny1_stand.png');
  }

  create() {
    this.tiles = this.physics.add.staticGroup();
    const matrixLength = 8;
    for (let x = 1; x < matrixLength; x++) {
      for (let y = 1; y < matrixLength; y++) {
        const tile = this.tiles.get(x * 60, y * 60, 'tile') as Physics.Arcade.Sprite;
        tile.setSize(60, 60);
        tile.setScale(0.3);
      }
    }

    this.player = this.physics.add.sprite(61, 61, 'player');
    this.player.setScale(0.3);
  }

  init() {
    // this.player.setVelocityY(100);
  }

  update() {
    if(this.player.body.velocity.y == 0){
      this.player.setVelocityY(1);
    }
  }
}
