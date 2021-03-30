import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao"
import { Logger } from "../main"
import { getItem, getTypedItem, setItem } from "../utils/storage"

export default class GameState {

  getResponseToSend(): { itemId: number, response: RespostaItemProgramacao } {
    let response = this.getResponse();
    response.tempoEmSegundos = Math.floor(this.getTimeInSeconds() - response.tempoEmSegundos)
    const responseToSend = {
      itemId: this.getItemNumber(),
      response
    }
    Logger.info('ResponseToSend', JSON.stringify(responseToSend));
    return responseToSend
  }

  registerAddedCommands(addedCommands: string[]) {
    this.log('GAME_STATE register coding', addedCommands);
    let response = this.getResponse();
    response.adicionarTentativa(addedCommands.map(it => {
      it = it.replace('arrow-', '');
      it = it.toUpperCase();
      return it.toUpperCase()
    }));
    this.setResponse(response);
  }

  initializeResponse(itemNumber: number) {
    this.log('initialize')
    this.setItemNumber(itemNumber);
    let resposta = new RespostaItemProgramacao()
    resposta.tempoEmSegundos = this.getTimeInSeconds()
    this.setResponse(resposta);
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
