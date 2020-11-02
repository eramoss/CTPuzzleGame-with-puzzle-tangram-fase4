// Site com sons
// https://www.zapsplat.com/sound-effect-category/cartoon-impacts/

export default class Sounds {

  scene: Phaser.Scene;
  dragSound: Phaser.Sound.BaseSound;
  dropSound: Phaser.Sound.BaseSound;
  hoverSound: Phaser.Sound.BaseSound;
  removeSound: Phaser.Sound.BaseSound;
  errorSound: Phaser.Sound.BaseSound;
  coinSound: Phaser.Sound.BaseSound;
  blockedSound: Phaser.Sound.BaseSound;
  startSound: Phaser.Sound.BaseSound;
  blinkSound: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.dragSound = scene.sound.add('drag');
    this.dropSound = scene.sound.add('drop');
    this.hoverSound = scene.sound.add('hover');
    this.removeSound = scene.sound.add('remove');
    this.errorSound = scene.sound.add('error');
    this.startSound = scene.sound.add('start');
    this.blockedSound = scene.sound.add('blocked');
    this.coinSound = scene.sound.add('coin');
    this.blinkSound = scene.sound.add('blink');
  }


  drag() {
    this.playSound(this.dragSound);
  }

  drop() {
    this.playSound(this.dropSound);
  }

  hover() {
    this.playSound(//this.hoverSound);
  }

  remove() {
    this.playSound(this.removeSound);
  }

  error() {
    this.playSound(this.errorSound);
  }

  coin() {
    this.playSound(this.coinSound);
  }

  start() {
    this.playSound(this.startSound);
  }

  blocked() {
    this.playSound(this.blockedSound);
  }

  stop() {
    //this.blockedSound.play()
  }

  blink() {
    this.blinkSound.play()
  }

  playSound(sound: Phaser.Sound.BaseSound) {
    if (!sound.isPlaying) {
      sound.play()
    }
  }
}
