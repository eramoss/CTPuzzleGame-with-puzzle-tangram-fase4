export default class GameParams {
  urlToInstantiateItem: string;
  testItemId: number;
  operation: string;
  participationId: string;
  dataUrl: string;
  puzzleUrl: string;

  constructor(params: URLSearchParams) {
    if (params) {
      this.operation = params.get("op");
      this.dataUrl = params.get("dataUrl");
      this.testItemId = params.get("testItemId") as unknown as number;
      this.participationId = params.get("participationId");
      this.puzzleUrl = params.get("puzzleUrl");
      this.urlToInstantiateItem = params.get("urlToInstantiateItem");
    }
  }

  isAutomaticTesting() {
    return this.operation == "testing";
  }

  isPlaygroundTest(): boolean {
    return this.operation == "playground";
  }

  isTestApplication(): boolean {
    return this.operation == "application";
  }

  isItemToPlay(): boolean {
    return this.operation == "play";
  }
}
