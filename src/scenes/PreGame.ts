import Phaser from 'phaser';
import Button from '../controls/Button';
import AlignGrid from '../geom/AlignGrid';
import Sounds from '../sounds/Sounds';
import Keyboard from '../controls/Keyboard';
import GameParams from '../settings/GameParams';
import UserRepository from '../user/UserRepository';
import User from '../user/User';
import TestApplicationService from '../test-application/TestApplicationService';

let globalSounds: Sounds

export default class PreGame extends Phaser.Scene {

  sounds: Sounds
  playBtn: Button
  testNumberObject: Phaser.GameObjects.Text
  testNumberValue: string = ''
  keyboard: Keyboard
  userRepository: UserRepository
  gameParams: GameParams;
  testApplicationService: TestApplicationService;

  constructor() {
    super('pre-game');
    this.sounds = new Sounds();
    this.keyboard = new Keyboard();

    const params = new URLSearchParams(window.location.search);
    this.gameParams = new GameParams(params);
    this.testApplicationService = new TestApplicationService(this.gameParams)
    this.userRepository = new UserRepository()
  }

  preload() {
    this.load.image('test-box', 'assets/ct/pregame/test-game-box.png');
    this.load.image('test-box-clear', 'assets/ct/pregame/test-game-box-clear.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.spritesheet('play-btn', 'assets/ct/pregame/play-button.png', { frameWidth: 400, frameHeight: 152 });
    this.sounds.preload(this);
    this.keyboard.preload(this);
  }

  create() {
    this.sounds.create();
    globalSounds = this.sounds;

    let grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );

    grid.addImage(0, 0, 'background', grid.cols, grid.rows);

    const cell = grid.getCell(10, 6);
    this.testNumberObject = this.add.text(cell.x, cell.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setScale(grid.scale)
      .setFontStyle('bold')
      .setFontSize(100)
      .setAlign('center')
      .setDepth(1001)
      .setTint(0xffffff);

    let testBox = grid.addImage(9, 4, 'test-box', 8).setInteractive();
    let testBoxClear = grid.addImage(15.5, 6, 'test-box-clear', 1).setInteractive();
    testBoxClear.setVisible(false);

    this.keyboard.create();
    this.keyboard.hide();
    this.keyboard.onClick = (value: string) => {
      if (this.testNumberValue.length <= 5) {
        testBoxClear.setVisible(true);
        this.testNumberValue += value;
        this.testNumberObject.setText(this.testNumberValue);
      }
    }

    testBoxClear.on('pointerup', () => {
      this.testNumberValue = '';
      this.testNumberObject.setText('');
      testBoxClear.setVisible(false);
    })

    testBox.on('pointerup', () => {
      this.keyboard.show()
    })

    this.playBtn = new Button(this, this.sounds, 0, 0, 'play-btn', () => {
      this.sounds.click();
      this.scene.start('game')
    })
    grid.placeAt(10, 10.7, this.playBtn.sprite, 6);

    this.testNumberObject.setText((this.gameParams.testItemNumber || '') + '');

    if (this.gameParams.isTestApplication()) {
      let user: User = this.userRepository.getOrCreateGuestUser();
      this.testApplicationService.participateInTheTest(user);
    }

    //if (this.gameParams.isPlaygroundTest()) {
      this.scene.start('game', this.gameParams)
    //}
  }
}

export { globalSounds }
