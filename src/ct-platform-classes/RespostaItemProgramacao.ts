import { Comando } from "./MecanicaRope"

export class RespostaItemProgramacao {


  comandosUtilizados: string[] = []
  tempoInicio: number
  tempoEmSegundos: number
  tentativas: Comando[][] = []
  pulouFase: boolean
  contadorUsoLixeira: number = 0
  contadorUsoDebug: number = 0
  contadorUsoPlay: number = 0
  contadorUsoStop: number = 0
  contadorReinicioFase: number = 0

  adicionarTentativa(comandosUtilizados: Comando[]) {
    this.comandosUtilizados = comandosUtilizados
    this.tentativas.push(comandosUtilizados)
  }

  countTrashUse() {
    this.contadorUsoLixeira++
  }

  countRestartUse() {
    this.contadorReinicioFase++
  }

  countStop() {
    this.contadorUsoStop++
  }
  countPlay() {
    this.contadorUsoPlay++
  }
  countDebug() {
    this.contadorUsoDebug++
  }
}
