export enum CellState {
  UNOPENED,
  OPENED,
  FLAGGED,
}

export class Cell {
  x: number;
  y: number;
  mine: boolean;
  number: number;
  state: CellState;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.mine = false;
    this.number = 0;
    this.state = CellState.UNOPENED;
  }
}
