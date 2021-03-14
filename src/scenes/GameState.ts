export default class GameState {

  playingTimerInSeconds: number = 0
  swapBlocksCount: number = 0

  onStartPhase() {
    this.playingTimerInSeconds = this.getTimeInSeconds()
  }

  onCompletePhase() {
    this.playingTimerInSeconds = this.getTimeInSeconds() - this.playingTimerInSeconds
  }

  getTimeInSeconds(): number {
    return new Date().getTime() / 1000
  }
}
