import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, getTypedItem, setItem } from "../utils/storage";
import { getDefaultPlatformApiUrl, replaceUserUUIDToken } from "../utils/Utils";
import { PreparedParticipation, TestApplication, TestItem, UrlToSendProgress } from "./TestApplication";

export default class TestApplicationService {

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
  }

  isTestApplication() {
    return this.getGameParams()?.isTestApplication()
  }

  isAutoTesting() {
    return this.getGameParams().isAutomaticTesting()
  }

  isPlayground() {
    return this.getGameParams()?.isPlaygroundTest()
  }

  getPublicTestApplications(): TestApplication[] {
    return getItem('public-test-applications') as TestApplication[]
  }

  getGameParams(): GameParams {
    return getTypedItem(GameParams, 'gameParams');
  }

  getParticipation(): PreparedParticipation {
    return getTypedItem(PreparedParticipation, "participation")
  }

  getNonCompletedTestItems(): TestItem[] {
    const participation = this.getParticipation()
    const items = participation.test.items;
    const lastVisitedItemId = participation.lastVisitedItemId;
    const lastVisitedItem = items.find((testItem) => testItem.id == lastVisitedItemId);
    const lastVisitedItemIndex = items.indexOf(lastVisitedItem);
    let nonCompletedItems = items
    if (lastVisitedItemIndex != -1) {
      nonCompletedItems = items.slice(lastVisitedItemIndex)
    }
    if (lastVisitedItemId == -1) {
      nonCompletedItems = []
    }
    return nonCompletedItems;
  }

  async saveCurrentPlayingPhase(itemId: number) {
    let part = this.getParticipation()
    let participationId = part.participationId
    let urlToSendProgress: UrlToSendProgress = part.urlToSendProgress
    if (this.gameParams.isTestApplication()) {
      setItem('currentPlayingPhase', itemId + '');
      let participation = {
        id: participationId,
        lastVisitedItemId: itemId
      }
      PUT(urlToSendProgress.url, participation)
    }
  }

  async loadPublicApplications(): Promise<boolean> {
    let found = false;
    let url = getDefaultPlatformApiUrl(this.gameParams)
    try {
      let name = 'PROGRAMAÇÃO ROPE'
      let response = await GET(`${url}/test-applications/public/getPuplicApplicationsByMechanicName/${name}`)
      let publicTestApplications: TestApplication[] = await response.json()
      Logger.info('publicTestApplications.length', publicTestApplications.length)
      if (publicTestApplications.length) {
        setItem('public-test-applications', publicTestApplications);
        found = true
      }
    } catch (e) {
      Logger.error('Did not succeded on load public test applications from ', url)
    }
    return found
  }

  async loadApplicationFromDataUrl(user: User) {
    try {
      let response = await GET(replaceUserUUIDToken(this.gameParams.dataUrl, user.hash))
      let participation = (await response.json()) as PreparedParticipation
      this.setParticipation(participation)
    } catch (e) {
      Logger.error(e);
    }
  }

  setParticipation(participation: PreparedParticipation) {
    setItem("participation", participation)
  }

  async sendResponse(responseToSend: { itemId: number, response: RespostaItemProgramacao }) {
    let url = this.getParticipation().urlToSendResponses.url;
    Logger.info('sendResponse: url', url)
    url = url.replace('<item_id>', responseToSend.itemId + '');
    Logger.info('sendResponse: url', url)
    Logger.info('sendResponse: response', JSON.stringify(responseToSend.response))
    await POST(url, responseToSend.response);
  }

  async instantiatePlaygroundItem<T>(): Promise<T> {
    const response = await GET(this.gameParams.urlToInstantiateItem);
    let item = await response.json();
    return item as T;
  }
}
