export enum CellState {
  unopened,
  opened,
  flagged,
}

export class Cell {
  mine: boolean;
  number: number;
  state: CellState;

  constructor() {
    this.mine = false;
    this.number = 0;
    this.state = CellState.unopened;
  }
}
