import { Cell, CellState } from './cell';

enum WinLoseState {
  NONE,
  WIN,
  LOSE,
}

class Size {
  x: number;
  y: number;
}

export class Board {
  cells: Cell[][];
  size: Size;
  unopenedCells: number;
  isPlay: boolean;
  winLose: WinLoseState;

  constructor() {
    this.isPlay = false;
    this.winLose = WinLoseState.NONE;
  }

  start() {
    if (this.isPlay) {
      return;
    }

    this.size = new Size();
    this.size.x = 5;
    this.size.y = 3;

    this.generateCells();
    this.generateMine();
    this.generateNumber();

    this.isPlay = true;

    console.log(`start`);
  }

  open(x: number, y: number) {
    if (this.isPlay === false) {
      return;
    }

    console.log(`x:${x}, y:${y}`);
    const cell = this.cells[y][x];
    if (cell === undefined) {
      return;
    }

    if (cell.state !== CellState.unopened) {
      return;
    }

    cell.state = CellState.opened;
    this.unopenedCells--;

    if (cell.mine) {
      this.isPlay = false;
      this.winLose = WinLoseState.LOSE;
      console.log('you lose');
    }

    if (this.unopenedCells === 0) {
      this.isPlay = false;
      this.winLose = WinLoseState.WIN;
      console.log('you win');
    }
  }

  flag(x: number, y: number) {
    if (this.isPlay === false) {
      return;
    }

    const cell = this.cells[y][x];
    if (cell === undefined) {
      return;
    }

    if (cell.state !== CellState.unopened) {
      return;
    }

    cell.state = CellState.flagged;
  }

  // output() {
  //   for (let y = 0; y < this.size.y; y++) {
  //     let line = '';
  //     for (let x = 0; x < this.size.x; x++) {
  //       const cell = this.cells[y][x];
  //       // let symbol = cell.mine ? 'X' : cell.number;
  //       let symbol;

  //       if (cell.state === CellState.unopened) {
  //         symbol = '.';
  //       } else if (cell.state === CellState.flagged) {
  //         symbol = '!';
  //       } else {
  //         symbol = cell.mine ? 'X' : cell.number;
  //       }

  //       line = line + symbol;
  //     }
  //     console.log(`${line}`);
  //   }
  //   console.log('---------');
  // }

  display() {
    for (let y = 0; y < this.size.y; y++) {
      let line = '';
      for (let x = 0; x < this.size.x; x++) {
        const cell = this.cells[y][x];
        // let symbol = cell.mine ? 'X' : cell.number;
        let symbol;

        if (cell.state === CellState.unopened) {
          symbol = '.';
        } else if (cell.state === CellState.flagged) {
          symbol = '!';
        } else {
          symbol = cell.mine ? 'X' : cell.number;
        }

        line = line + symbol;
      }
      console.log(`${line}`);
    }
    console.log('---------');
  }

  private generateCells() {
    this.cells = [];
    for (let y = 0; y < this.size.y; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.size.x; x++) {
        this.cells[y][x] = new Cell(x, y);
      }
    }
  }

  private generateMine() {
    this.cells[0][2].mine = true;
    this.cells[0][3].mine = true;
    this.cells[1][1].mine = true;
    this.cells[2][4].mine = true;

    this.unopenedCells = this.size.x * this.size.y;
    this.unopenedCells = this.unopenedCells - 4;
  }

  private generateNumber() {
    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        // console.log(`${x}:${y}`);
        this.calculateNumber(x, y);
      }
    }
  }

  private calculateNumber(x: number, y: number) {
    let number = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (
          x + dx >= 0 &&
          y + dy >= 0 &&
          x + dx < this.size.x &&
          y + dy < this.size.y
        ) {
          // console.log(`${dx}:${dy} => ${x + dx}:${y + dy}`);
          const cell = this.cells[y + dy][x + dx];
          if (cell && cell.mine) {
            number++;
          }
        }
      }
    }
    this.cells[y][x].number = number;
    // console.log(`${x}:${y} => ${number}`);
  }
}
