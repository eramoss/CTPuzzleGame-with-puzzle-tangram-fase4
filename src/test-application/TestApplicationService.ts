import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import TestApplication, { Participation } from "./TestApplication";

export default class TestApplicationService {

  constructor(private gameParams: GameParams) {
    localStorage.setItem("gameParams", JSON.stringify(gameParams))
  }

  async saveCurrentPlayingPhase(id: number) {
    localStorage.setItem('currentPlayingPhase', id + '');
    let participation = this.getParticipation()
    participation.lastVisitedItemId = id;
    fetch(this.gameParams.baseUrl + '/participations/save-progress', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(participation)
    })
  }

  async getTestApplication(): Promise<TestApplication> {
    const participation = this.getParticipation();
    return participation.application
  }

  async participateInTheTest(user: User) {
    try {
      let response = await fetch(this.gameParams.baseUrl + '/test-applications/participate-in-the-test/' + this.gameParams.applicationHash,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
        })
      let participation = (await response.json()) as Participation
      this.saveParticipation(participation)
    } catch (e) {
      Logger.error(e);
    }
  }

  async saveFinishedDate() {
    let participation = this.getParticipation();
    let response = await fetch(this.gameParams.baseUrl + '/participations/finish/' + participation.id)
  }

  saveParticipation(participation: Participation) {
    localStorage.setItem("participation", JSON.stringify(participation))
  }

  getParticipation(): Participation {
    let participation = new Participation()
    let participationJson = localStorage.getItem("participation")
    if (participationJson) {
      participation = JSON.parse(participationJson) as Participation
    }
    return participation;
  }

  async instantiateItem<T>(itemNumber: any): Promise<T> {
    const response = await fetch(this.gameParams.baseUrl + '/items/instantiate/' + itemNumber);
    let item = await response.json();
    return item as T;
  }
}
