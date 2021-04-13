import { Comando } from "./MecanicaRope"

export class RespostaItemProgramacao {

  comandosUtilizados: string[] = []
  tempoEmSegundos: number
  tentativas: Comando[][] = []
  pulouFase: boolean

  adicionarTentativa(comandosUtilizados: Comando[]) {
    this.comandosUtilizados = comandosUtilizados
    this.tentativas.push(comandosUtilizados)
  }
}
