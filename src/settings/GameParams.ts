export default class GameParams {
  operation: string
  testItemNumber: string
  baseUrl: string
  applicationHash: string

  isPlaygroundTest(): boolean {
    return this.operation == 'playground'
  }

  isTestApplication(): boolean {
    return this.operation == 'application'
  }

}
