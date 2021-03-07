export default class GameParams {

  constructor(params: URLSearchParams) {
    this.operation = params.get('op');
    this.baseUrl = params.get('baseUrl')
    this.applicationHash = params.get('hash')
    this.testItemNumber = parseInt(params.get('testItemNumber'));
  }

  operation: string
  testItemNumber: number
  baseUrl: string
  applicationHash: string

  isPlaygroundTest(): boolean {
    return this.operation == 'playground'
  }

  isTestApplication(): boolean {
    return this.operation == 'application'
  }

}
