import { Comando } from "./MecanicaRope"

export class RespostaItemProgramacao {

  caminhoPercorrido: Array<{ x: number, y: number }>
  comandosUtilizados: string[] = []
  tempoEmSegundos: number
  tentativas: Comando[][] = []
  pulouFase: boolean

  adicionarTentativa(comandosUtilizados: Comando[]) {
    this.comandosUtilizados = comandosUtilizados
    this.tentativas.push(comandosUtilizados)
  }
}
