
export type Obstaculo = "coin" | "block" | "null" | "battery" | 'rope'
export type Mapa = "tile" | "null"
export type Face = "up" | "down" | "right" | "left"
export type Comando = "UP" | "DOWN" | "RIGHT" | "LEFT"

export class MecanicaRope {
  mapa!: Mapa[][];
  obstaculos!: Obstaculo[][];
  face!: Face;
  x: number = 0;
  y: number = 0;
  comandosEsperados!: Comando[];
  tempoEsperado!: number
  tentativasEsperadas!: number
  nivelBateria: number = 10
  custoBateriaEmCadaMovimento: number = 1
  ganhoBateriaAoCapturarPilha: number = 1
  acoesTutorial:AcaoTutorial[] = []
}

type Acao = "click" | "drag"
type Elemento = "btn-step"
class AcaoTutorial {
    acao!:Acao
    elemento!:Elemento
    frase!:string
}
