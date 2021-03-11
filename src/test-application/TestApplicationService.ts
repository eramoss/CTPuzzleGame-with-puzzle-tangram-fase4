import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST } from "../utils/internet";
import { getItem, setItem } from "../utils/storage";
import { PreparedParticipation } from "./TestApplication";

export default class TestApplicationService {

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
  }

  async saveCurrentPlayingPhase(id: number) {
    if (this.gameParams.isTestApplication()) {
      setItem('currentPlayingPhase', id + '');
      /* let participation = this.getParticipation()
      participation.lastVisitedItemId = id;
      PUT(this.gameParams.baseUrl + '/participations/public/save-progress', participation) */
    }
  }

  async getApplicationData(user: User) {
    try {
      let response = await GET(this.gameParams.dataUrl.replace('<user_uuid>', user.hash))
      let participation = (await response.json()) as PreparedParticipation
      setItem('test_as_json', participation.testAsJson);
      setItem('url_to_send_responses', participation.urlToSendResponses);
    } catch (e) {
      Logger.error(e);
    }
  }

  async getTest(): Promise<any> {
    return getItem<any>('test_as_json');
  }

  async sendResponse(itemId: number, itemResponse: RespostaItemProgramacao) {
    let url = getItem<any>('url_to_send_responses').url;
    url = url.replace('<item_id>', itemId);
    let response = await POST(url, itemResponse);
  }


  async instantiateItem<T>(itemNumber: any): Promise<T> {
    const response = await GET(this.gameParams.baseUrl + '/items/public/instantiate/' + itemNumber);
    let item = await response.json();
    return item as T;
  }
}
