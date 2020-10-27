// Docs
// https://photonstorm.github.io/phaser3-docs/index.html
// Kenney Assets
// https://kenney.nl/assets/digital-audio

import Phaser from 'phaser'
import Game from './scenes/Game'
import GameOver from './scenes/GameOver'

let proportionHeightByWidth = 0.58
let width = window.innerWidth * 1
let height = width * proportionHeightByWidth

if (height > window.innerHeight) {
  height = window.innerHeight
  width = height * proportionHeightByWidth * 3
}

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: width,
  height: height,
  fps: {
    smoothStep: true,
    min: 13,
    forceSetTimeOut: true,
    target: 15
  },
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
      debug: false
    }
  }
})
