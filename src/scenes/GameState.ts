import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao"
import { Logger } from "../main"
import { getItem, getTypedItem, setItem } from "../utils/storage"

export default class GameState {

  playingTimerInSeconds: number = 0
  swapBlocksCount: number = 0

  getResponseToSend(): { itemId: number, response: RespostaItemProgramacao } {
    return {
      itemId: this.getItemNumber(),
      response: this.getResponse()
    }
  }

  registerCodingState(codeState: string) {
    this.log('GAME_STATE register coding', codeState);
    let response = this.getResponse();
    response.adicionarTentativa(codeState);
    this.setResponse(response);
  }

  initializeResponse(itemNumber: number) {
    this.log('initialize')
    this.setItemNumber(itemNumber);
    this.setResponse(new RespostaItemProgramacao())
  }

  onStartPhase() {
    this.playingTimerInSeconds = this.getTimeInSeconds()
  }

  onCompletePhase() {
    this.playingTimerInSeconds = this.getTimeInSeconds() - this.playingTimerInSeconds
  }

  getTimeInSeconds(): number {
    return new Date().getTime() / 1000
  }

  setResponse(respostaItemProgramacao: RespostaItemProgramacao) {
    setItem('response', respostaItemProgramacao)
  }

  getResponse(): RespostaItemProgramacao {
    return getTypedItem(RespostaItemProgramacao, 'response')
  }

  setItemNumber(itemNumber: number) {
    setItem('itemNumber', itemNumber)
  }

  getItemNumber(): number {
    return getItem('itemNumber');
  }

  private log(...arg0: any[]) {
    Logger.log(['GAME_STATE'].concat(arg0).join(' '))
  }
}
