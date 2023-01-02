export enum WinLoseState {
  NONE,
  WIN,
  LOSE,
}

export class GameState {
  isPlay: boolean;
  winLose: WinLoseState;

  constructor() {
    this.isPlay = false;
    this.winLose = WinLoseState.NONE;
  }
}
