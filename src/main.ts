// Docs
// https://photonstorm.github.io/phaser3-docs/index.html
// Kenney Assets
// https://kenney.nl/assets/digital-audio

import Phaser from 'phaser'
import Game from './scenes/Game'
import GameOver from './scenes/GameOver'

//https://www.joshmorony.com/how-to-scale-a-game-for-all-device-sizes-in-phaser
let width = window.innerWidth * window.devicePixelRatio
let height = window.innerHeight * window.devicePixelRatio

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: width,
  height: height,
  scene: [Game, GameOver],
  render: {
    transparent: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0
      },
      //debug: true
    }
  }
})
