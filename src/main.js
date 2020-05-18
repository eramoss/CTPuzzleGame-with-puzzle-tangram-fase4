// Docs
// https://photonstorm.github.io/phaser3-docs/index.html
// Kenney Assets
// https://kenney.nl/assets/digital-audio

import Phaser from './lib/phaser.js'

import Game from './scenes/Game.js'
import GameOver from './scenes/GameOver.js'

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: [Game, GameOver],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 200
      },
      debug: true
    }
  }
})
