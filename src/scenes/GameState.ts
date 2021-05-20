import { Comando } from "../ct-platform-classes/MecanicaRope";
import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao"
import { Logger } from "../main"
import { getItem, getTypedItem, setItem } from "../utils/storage"

export default class GameState {

  initializeResponse(itemNumber: number) {
    if (itemNumber != this.getItemNumber()) {
      this.setItemNumber(itemNumber);
      let resposta = new RespostaItemProgramacao()
      resposta.tempoEmSegundos = -1
      resposta.contadorUsoLixeira = 0
      this.setResponse(resposta);
    }
    this.initializeStartTime()
  }

  initializeStartTime() {
    //alert('initialize start time')
    let resposta = this.getResponse()
    if (!resposta) {
      resposta = new RespostaItemProgramacao()
    }
    resposta.tempoInicio = this.getTimeInSeconds()
    this.setResponse(resposta);
  }

  isBackgroundMusicEnabled() {
    return getItem('isBackgroundMusicEnabled', true)
  }

  setBackgroundMusicEnabled(enabled: boolean = true) {
    setItem('isBackgroundMusicEnabled', enabled)
  }

  setSpeedFactor(speed: number) {
    setItem('speedFactor', speed)
  }

  getSpeedFactor(): number {
    return getItem<number>('speedFactor', 1)
  }

  isSpeedFactorActivated(): boolean {
    return this.getSpeedFactor() == 2
  }

  calculateTimeSpent() {
    let response = this.getResponse();
    if (response) {
      response.tempoEmSegundos = Math.floor(this.getTimeInSeconds() - response.tempoInicio)
      this.setResponse(response)
    }
  }

  getResponseToSend(): { itemId: number, response: RespostaItemProgramacao } {
    let response = this.getResponse();
    const responseToSend = {
      itemId: this.getItemNumber(),
      response
    }
    Logger.info('ResponseToSend', JSON.stringify(responseToSend));
    return responseToSend
  }

  registerGiveUp() {
    const response = this.getResponse();
    response.pulouFase = true
    this.setResponse(response)
  }

  registerTrashUse() {
    let response = this.getResponse()
    response.countTrashUse()
    this.setResponse(response)
  }

  registerRestartUse() {
    let response = this.getResponse()
    response.countRestartUse()
    this.setResponse(response)
  }

  registerAddedCommands(addedCommands: string[]) {
    this.log('GAME_STATE register coding', addedCommands);
    let response = this.getResponse();
    response.adicionarTentativa(addedCommands.map(it => {
      it = it.replace('arrow-', '');
      it = it.toUpperCase();
      return it.toUpperCase() as Comando
    }));
    this.setResponse(response);
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
    return getItem('itemNumber', 0);
  }

  private log(...arg0: any[]) {
    Logger.log(['GAME_STATE'].concat(arg0).join(' '))
  }
}
