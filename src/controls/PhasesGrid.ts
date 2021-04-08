import { Scene } from "phaser";
import AlignGrid from "../geom/AlignGrid";
import { globalSounds } from "../scenes/PreGame";
import { TestApplication } from "../test-application/TestApplication";
import UserRepository from "../user/UserRepository";
import Button from "./Button";

export default class PhasesGrid {
  scene: Scene;
  grid: AlignGrid;
  userRepository: UserRepository;

  onRequestPlay: (gameUrl: string) => void

  constructor(scene: Scene, grid: AlignGrid, userRepository: UserRepository) {
    this.scene = scene;
    this.grid = grid;
    this.userRepository = userRepository;
  }

  emitGameUrl(testApplication: TestApplication) {
    let userUuid = this.userRepository.getOrCreateGuestUser().hash;
    let gameUrl = testApplication?.url?.replace(
      "<user_uuid>",
      userUuid
    );
    this.onRequestPlay(gameUrl)
    globalSounds.drag()
  }

  setApplications(testApplications: TestApplication[]) {
    let btnPlays: Button[] = []
    let scale = this.grid.scale;
    testApplications.forEach((testApplication: TestApplication, index: number) => {
      let cell = this.grid.getCell(10, index);
      let btn = new Button(this.scene, globalSounds,
        cell.x,
        this.grid.cellHeight * 4 + cell.y * 3,
        'yellow-btn',
        () => {
          this.emitGameUrl(testApplication)
          btn.disable()
          setTimeout(() => {
            btn.enable()
          }, 4000);
        }
      )
      btnPlays.push(btn)
      let name = testApplication.name;
      btn.setFontSize(30);
      btn.setScale(scale)
      btn.setText(name);
      btn.ajustTextPosition(20, 25)
    })
  }
}
