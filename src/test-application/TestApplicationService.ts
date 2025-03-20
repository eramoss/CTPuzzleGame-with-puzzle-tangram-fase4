import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, getTypedItem, setItem } from "../utils/storage";
import {
  getDefaultPlatformApiUrl,
  isAndroidAmbient,
  replaceUserUuidTokenByUserHash,
} from "../utils/Utils";
import {
  PreparedParticipation,
  TestApplication,
  TestItem,
  UrlHelper,
  UrlToSendProgress,
} from "./TestApplication";

export default class TestApplicationService {
  async disableQuiz() {
    const participation = this.participation;
    if (participation) {
      participation.urlToEndOfTestQuiz.url = null;
      this.setParticipation(participation);
    }
  }

  constructor(private gameParams: GameParams) {
    Logger.info("LOADED GAME PARAMS", gameParams);
    setItem("gameParams", gameParams);
  }

  isTestApplication() {
    return this.getGameParams()?.isTestApplication();
  }

  isAutoTesting() {
    return this.getGameParams().isAutomaticTesting();
  }

  isPlayground() {
    return this.getGameParams()?.isPlaygroundTest();
  }

  getPublicTestApplications(): TestApplication[] {
    return getItem("public-test-applications") as TestApplication[];
  }

  getGameParams(): GameParams {
    return getTypedItem(GameParams, "gameParams");
  }

  getCurrentPhaseString(testItemId: number): string {
    const participation = this.participation;
    let phaseString = "";
    if (participation) {
      const items = participation?.test?.items;
      if (items) {
        let item = items.find((item) => item.id == testItemId);
        if (item) {
          const currentIndex = items.indexOf(item);
          if (currentIndex > -1) {
            phaseString = `Fase ${currentIndex + 1}/${items.length}`;
          }
        }
      }
    }
    return phaseString;
  }

  get participation(): PreparedParticipation {
    return getTypedItem(PreparedParticipation, "participation");
  }

  getNonCompletedTestItems(): TestItem[] {
    return this.participation.test.items.filter((i) => !i.hasResponse);
  }

  async saveUserSource() {
    if (this.gameParams.isTestApplication()) {
      let part = this.participation;
      PUT(part.urlToSendSource?.url, {
        participationId: part.participationId,
        source: `(${
          isAndroidAmbient() ? "MOBILE" : document?.referrer + " COMPUTADOR"
        })`,
      });
    }
  }

  async loadPublicApplications(): Promise<TestApplication[]> {
    let url = getDefaultPlatformApiUrl(this.gameParams);
    let testApplications = [];
    try {
      let name = "PROGRAMAÇÃO ROPE";
      let response = await GET(
        `${url}/test-applications/public/getPuplicApplicationsByMechanicName/${name}`
      );
      testApplications = await response.json();
    } catch (e) {
      Logger.error(
        "Did not succeded on load public test applications from ",
        url
      );
    }
    return testApplications;
  }

  setTestApplications(testApplications: TestApplication[]) {
    setItem("public-test-applications", testApplications);
  }

  async loadApplicationFromDataUrl(user: User) {
    try {
      let urlToGetTestApplication = this.gameParams.dataUrl;
      const urlAlreadyHasUserHash = /.*\/data\/[\w-]+\/[\w-]+/.test(
        this.gameParams.dataUrl
      );
      if (!urlAlreadyHasUserHash) {
        urlToGetTestApplication = replaceUserUuidTokenByUserHash(
          this.gameParams.dataUrl,
          user.hash
        );
      }
      let response = await GET(urlToGetTestApplication);
      let participation = (await response.json()) as PreparedParticipation;
      this.setParticipation(participation);
    } catch (e) {
      Logger.error(e);
    }
  }

  setParticipation(participation: PreparedParticipation) {
    setItem("participation", participation);
  }

  async sendResponse(
    itemId: number,
    response: RespostaItemProgramacao
  ): Promise<{ next: string }> {
    const url = this.addItemId(this.participation.urlToSendResponses, itemId);
    return (await POST(url, response)).json();
  }

  async instantiatePlaygroundItem<T>(): Promise<T> {
    let url = this.gameParams.urlToInstantiateItem;
    if (!url) {
      url = this.addItemId(
        this.participation.urlToInstantiateItem,
        this.gameParams.testItemId
      );
    }
    const response = await GET(url);
    let res = await response.json();
    return res.json as T;
  }

  private addItemId(url: UrlHelper, itemId: number) {
    return url.url.replace("{item_id}", itemId.toString());
  }
}
