export enum CellState {
  unopened,
  opened,
  flagged,
}

export class Cell {
  x: number;
  y: number;
  mine: boolean;
  number: number;
  state: CellState;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.mine = false;
    this.number = 0;
    this.state = CellState.unopened;
  }
}
