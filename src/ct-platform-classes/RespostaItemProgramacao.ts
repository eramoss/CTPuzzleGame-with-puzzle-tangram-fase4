import { Comando } from "./MecanicaRope"

export class RespostaItemProgramacao {

  comandosUtilizados: string[] = []
  tempoInicio: number
  tempoEmSegundos: number
  tentativas: Comando[][] = []
  pulouFase: boolean
  contadorUsoLixeira: number = 0
  contadorReinicioFase: number = 0

  adicionarTentativa(comandosUtilizados: Comando[]) {
    this.comandosUtilizados = comandosUtilizados
    this.tentativas.push(comandosUtilizados)
  }

  countTrashUse() {
    this.contadorUsoLixeira ++
  }

  countRestartUse() {
    this.contadorReinicioFase ++
  }
}
