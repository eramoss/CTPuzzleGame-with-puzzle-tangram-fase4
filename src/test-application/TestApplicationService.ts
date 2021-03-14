import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, setItem } from "../utils/storage";
import { PreparedParticipation, Test, TestItem, UrlToSendProgress } from "./TestApplication";

export default class TestApplicationService {

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
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

  async sendResponse(itemId: number, itemResponse: RespostaItemProgramacao) {
    let url = this.getParticipation().urlToSendResponses.url;
    url = url.replace('<item_id>', itemId + '');
    let response = await POST(url, itemResponse);
  }


  async instantiateItem<T>(itemNumber: any): Promise<T> {
    const response = await GET(this.gameParams.urlToInstantiateItem);
    let item = await response.json();
    return item as T;
  }
}
