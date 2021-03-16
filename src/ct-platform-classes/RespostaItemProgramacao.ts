export class RespostaItemProgramacao {

  caminhoPercorrido: Array<{ x: number, y: number }>
  comandosUtilizados: string[] = []
  tempoEmSegundos: number
  tentativas: number = 0

  adicionarTentativa(comandosUtilizados: string[]) {
    this.comandosUtilizados = comandosUtilizados
    this.tentativas++
  }
}
