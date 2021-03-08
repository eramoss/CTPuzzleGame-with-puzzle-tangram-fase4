import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, setItem } from "../utils/storage";
import TestApplication, { Participation } from "./TestApplication";

export default class TestApplicationService {

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
  }

  async saveCurrentPlayingPhase(id: number) {
    if (this.gameParams.isTestApplication()) {
      setItem('currentPlayingPhase', id + '');
      let participation = this.getParticipation()
      participation.lastVisitedItemId = id;
      PUT(this.gameParams.baseUrl + '/participations/save-progress', participation)
    }
  }

  async getTestApplication(): Promise<TestApplication> {
    const participation = this.getParticipation();
    return participation.application
  }

  async participateInTheTest(user: User) {
    try {
      let response = await POST(
        this.gameParams.baseUrl + '/test-applications/participate-in-the-test/' + this.gameParams.applicationHash,
        user
      )
      let participation = (await response.json()) as Participation
      this.saveParticipation(participation)
    } catch (e) {
      Logger.error(e);
    }
  }

  async saveFinishedDate() {
    let participation = this.getParticipation();
    let response = await POST(this.gameParams.baseUrl + '/participations/finish/' + participation.id)
  }

  saveParticipation(participation: Participation) {
    setItem("participation", participation)
  }

  getParticipation(): Participation {
    let participation = getItem<Participation>("participation")
    if (!participation) {
      participation = new Participation()
    }
    return participation;
  }

  async instantiateItem<T>(itemNumber: any): Promise<T> {
    const response = await GET(this.gameParams.baseUrl + '/items/instantiate/' + itemNumber);
    let item = await response.json();
    return item as T;
  }
}
