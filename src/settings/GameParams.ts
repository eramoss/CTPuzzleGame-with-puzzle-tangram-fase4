export default class GameParams {

  constructor(params: URLSearchParams) {
    this.operation = params.get('op');
    this.baseUrl = params.get('baseUrl')
    this.dataUrl = params.get('dataUrl')
    this.applicationHash = params.get('hash')
    this.testItemNumber = parseInt(params.get('testItemNumber'));
  }

  operation: string
  testItemNumber: number
  baseUrl: string
  dataUrl: string
  applicationHash: string

  isPlaygroundTest(): boolean {
    return this.operation == 'playground'
  }

  isTestApplication(): boolean {
    return this.operation == 'application'
  }

}
