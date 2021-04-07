import Phaser from 'phaser';
import Button from '../controls/Button';
import AlignGrid from '../geom/AlignGrid';
import Sounds from '../sounds/Sounds';
import Keyboard from '../controls/Keyboard';
import GameParams from '../settings/GameParams';
import UserRepository from '../user/UserRepository';
import User from '../user/User';
import TestApplicationService from '../test-application/TestApplicationService';
import { isAndroidAmbient } from '../utils/Utils';
import { Logger } from '../main';
import PhasesGrid from '../controls/PhasesGrid';
import { Loading } from '../controls/Loading';

let globalSounds: Sounds

export default class PreGame extends Phaser.Scene {

  sounds: Sounds
  playBtn: Button
  inputObject: Phaser.GameObjects.Text
  testNumberValue: string = ''
  keyboard: Keyboard
  userRepository: UserRepository
  gameParams: GameParams;
  testApplicationService: TestApplicationService;
  grid: AlignGrid;
  phasesGrid: PhasesGrid
  loading: Loading;

  constructor() {
    super('pre-game');
    this.sounds = new Sounds();
    this.keyboard = new Keyboard();
    this.userRepository = new UserRepository()

    let queryParams = window.location.search
    if (isAndroidAmbient()) {
      //@ts-ignore
      queryParams = window.search
    }
    this.initializeGameParams(queryParams);
  }

  private initializeGameParams(queryParams: string) {
    Logger.info('Loaded params = ' + queryParams);
    const params = new URLSearchParams(queryParams);
    this.gameParams = new GameParams(params);
    this.testApplicationService = new TestApplicationService(this.gameParams);
  }

  preload() {
    this.load.image('test-box', 'assets/ct/pregame/test-game-box.png');
    this.load.image('test-box-clear', 'assets/ct/pregame/test-game-box-clear.png');
    this.load.image('background', 'assets/ct/radial_gradient.png');
    this.load.image('big-rope', 'assets/ct/big_rope.png');
    this.load.spritesheet('play-btn', 'assets/ct/pregame/play-button.png', { frameWidth: 400, frameHeight: 152 });
    this.load.spritesheet('yellow-btn', 'assets/ct/pregame/yellow_btn.png', { frameWidth: 678, frameHeight: 99 });
    this.sounds.preload(this);
    this.keyboard.preload(this);
  }

  async create() {
    this.sounds.create();
    globalSounds = this.sounds;


    this.grid = new AlignGrid(
      this, 26, 22,
      this.game.config.width as number,
      this.game.config.height as number
    );
    this.grid.addImage(0, 0, 'background', this.grid.cols, this.grid.rows);
    this.grid.addImage(18, 10, 'big-rope', 6);

    this.loading = new Loading(this, this.grid);
    this.phasesGrid = new PhasesGrid(this, this.grid, this.userRepository);

    this.phasesGrid.onRequestPlay = async (gameUrl: string) => {
      this.loading.show();
      this.initializeGameParams(gameUrl.split('?')[1])
      await this.loadTestApplication();
      this.startGame()
    }

    let isTestApplication = this.gameParams.isTestApplication()
    let foundPublicApplications = false;
    if (!isTestApplication) {
      foundPublicApplications = await this.searchPublicApplications();
    }

    this.loadTestApplication()

    if (!foundPublicApplications || this.gameParams.isPlaygroundTest()) {
      this.startGame()
    }
  }

  private async searchPublicApplications(): Promise<boolean> {
    let foundPublicApplications = false;
    foundPublicApplications = await this.testApplicationService.loadPublicApplications();
    if (foundPublicApplications) {
      this.phasesGrid.setApplications(this.testApplicationService.getPublicTestApplications());
    }
    return foundPublicApplications;
  }

  async loadTestApplication() {
    if (this.gameParams.isTestApplication()) {
      let user: User = this.userRepository.getOrCreateGuestUser();
      await this.testApplicationService.loadApplicationFromDataUrl(user);
    }
  }

  createPlayButtonArea() {
    const cell = this.grid.getCell(10, 5);
    this.inputObject = this.add.text(cell.x, cell.y, '', {
      fontFamily: 'Dyuthi, arial',
    })
      .setScale(this.grid.scale)
      .setFontStyle('bold')
      .setFontSize(100)
      .setAlign('center')
      .setDepth(1001)
      .setTint(0xffffff);

    let testBox = this.grid.addImage(9, 3, 'test-box', 8).setInteractive();
    let testBoxClear = this.grid.addImage(15.5, 5, 'test-box-clear', 1).setInteractive();
    testBoxClear.setVisible(false);

    this.keyboard.create();
    this.keyboard.hide();
    this.keyboard.onClick = (value: string) => {
      if (this.testNumberValue.length <= 5) {
        testBoxClear.setVisible(true);
        this.testNumberValue += value;
        this.inputObject.setText(this.testNumberValue);
      }
    }

    testBoxClear.on('pointerup', () => {
      this.testNumberValue = '';
      this.inputObject.setText('');
      testBoxClear.setVisible(false);
    })

    testBox.on('pointerup', () => {
      this.keyboard.show()
    })

    this.playBtn = new Button(this, this.sounds, 0, 0, 'play-btn', () => {
      this.sounds.click();
      this.startGame();
    })
    this.grid.placeAt(10, 9.7, this.playBtn.sprite, 6);


  }

  startGame() {
    this.scene.start('game', this.gameParams)
  }
}


export { globalSounds }
