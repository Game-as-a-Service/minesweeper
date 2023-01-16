export enum WinLoseState {
  NONE,
  WIN,
  LOSE,
}

export class GameState {
  isPlay: boolean;
  winLose: WinLoseState;
  displayMineCount: number;

  constructor() {
    this.isPlay = false;
    this.winLose = WinLoseState.NONE;
    this.displayMineCount = 88;
  }
}
