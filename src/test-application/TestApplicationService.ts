import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, getTypedItem, setItem } from "../utils/storage";
import { PreparedParticipation, TestItem, UrlToSendProgress } from "./TestApplication";

export default class TestApplicationService {

  isTestApplication() {
    return this.getGameParams()?.isTestApplication()
  }

  isPlayground() {
    return this.getGameParams()?.isPlaygroundTest()
  }

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
  }

  getGameParams(): GameParams {
    return getTypedItem(GameParams, 'gameParams');
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

  async getApplicationData(user: User) {
    try {
      let response = await GET(this.gameParams.dataUrl.replace('<user_uuid>', user.hash))
      let participation = (await response.json()) as PreparedParticipation
      setItem("participation", participation)
    } catch (e) {
      Logger.error(e);
    }
  }

  getParticipation(): PreparedParticipation {
    return getItem<PreparedParticipation>("participation")
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
    return nonCompletedItems;
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
