export class RespostaItemProgramacao {

  caminhoPercorrido: Array<{ x: number, y: number }>
  comandosUtilizados: string[] = []
  tempoEmSegundos: number

  adicionarTentativa(comandosUtilizados: string) {
    this.comandosUtilizados.push(comandosUtilizados);
  }
}
