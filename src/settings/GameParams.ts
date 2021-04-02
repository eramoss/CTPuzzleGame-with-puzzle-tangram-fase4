export default class GameParams {

  constructor(params: URLSearchParams) {
    this.operation = params.get('op');
    this.dataUrl = params.get('dataUrl')
    this.urlToInstantiateItem = params.get('urlToInstantiateItem');
  }

  urlToInstantiateItem: string;
  operation: string
  dataUrl: string

  isPlaygroundTest(): boolean {
    return this.operation == 'playground'
  }

  isTestApplication(): boolean {
    return this.operation == 'application'
  }

}
