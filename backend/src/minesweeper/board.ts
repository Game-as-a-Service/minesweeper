import { Cell, CellState } from './cell';
import { GameState, WinLoseState } from './gameState';
import { Level } from './level';

class Size {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class LevelConfig {
  size: Size;
  mineCount: number;

  constructor(size: Size, mineCount: number) {
    this.size = size;
    this.mineCount = mineCount;
  }
}

const LevelConfigMap: Map<Level, LevelConfig> = new Map<Level, LevelConfig>();
LevelConfigMap.set(Level.BEGINNER, new LevelConfig(new Size(9, 9), 10));
LevelConfigMap.set(Level.INTERMEDIATE, new LevelConfig(new Size(16, 16), 40));
LevelConfigMap.set(Level.EXPERT, new LevelConfig(new Size(30, 16), 99));

export class Board {
  cells: Cell[][];
  levelConfig: LevelConfig;
  // size: Size;
  // mineCount: number;
  unopenedCells: number;
  gameState: GameState;

  constructor() {
    this.gameState = new GameState();
  }

  start(level: Level = Level.BEGINNER) {
    // if (this.gameState.isPlay) {
    //   return;
    // }

    this.levelConfig = LevelConfigMap.get(level);

    // this.size = new Size(9, 9);
    // this.size = levelConfig.size;
    // this.mineCount = levelConfig.mineCount;

    console.log(level);

    this.generateCells();
    this.generateMine();
    this.generateNumber();

    this.gameState.isPlay = true;
    this.gameState.winLose = WinLoseState.NONE;

    console.log(`start`);
  }

  open(x: number, y: number) {
    if (this.gameState.isPlay === false) {
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

    if (cell.mine) {
      this.gameState.isPlay = false;
      this.gameState.winLose = WinLoseState.LOSE;
      console.log('you lose');
      return;
    }

    this.unopenedCells--;
    if (this.unopenedCells === 0) {
      this.gameState.isPlay = false;
      this.gameState.winLose = WinLoseState.WIN;
      console.log('you win');
    }

    if (cell.number === 0) {
      this.autoOpen(cell);
    }
  }

  flag(x: number, y: number) {
    if (this.gameState.isPlay === false) {
      return;
    }

    const cell = this.cells[y][x];
    if (cell === undefined) {
      return;
    }

    if (cell.state === CellState.opened) {
      return;
    }

    if (cell.state === CellState.unopened) {
      cell.state = CellState.flagged;
    } else if (cell.state === CellState.flagged) {
      cell.state = CellState.unopened;
    }
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
    for (let y = 0; y < this.levelConfig.size.y; y++) {
      let line = '';
      for (let x = 0; x < this.levelConfig.size.x; x++) {
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

  private autoOpen(cell: Cell) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (
          cell.x + dx >= 0 &&
          cell.y + dy >= 0 &&
          cell.x + dx < this.levelConfig.size.x &&
          cell.y + dy < this.levelConfig.size.y
        ) {
          this.open(cell.x + dx, cell.y + dy);
        }
      }
    }
  }

  private generateCells() {
    this.cells = [];
    for (let y = 0; y < this.levelConfig.size.y; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.levelConfig.size.x; x++) {
        this.cells[y][x] = new Cell(x, y);
      }
    }
  }

  private generateMine() {
    // this.manualMine();
    this.randomMine(this.levelConfig.mineCount);
  }

  private randomMine(count: number) {
    for (let i = 0; i < count; ) {
      const x = this.getRandomIntInclusive(0, this.levelConfig.size.x - 1);
      const y = this.getRandomIntInclusive(0, this.levelConfig.size.y - 1);

      if (this.cells[y][x].mine === false) {
        this.cells[y][x].mine = true;
        i++;
      }
    }

    this.unopenedCells = this.levelConfig.size.x * this.levelConfig.size.y;
    this.unopenedCells = this.unopenedCells - count;
  }

  private getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  private manualMine() {
    this.cells[0][2].mine = true;
    this.cells[0][3].mine = true;
    this.cells[1][1].mine = true;
    this.cells[2][4].mine = true;

    this.unopenedCells = this.levelConfig.size.x * this.levelConfig.size.y;
    this.unopenedCells = this.unopenedCells - 4;
  }

  private generateNumber() {
    for (let y = 0; y < this.levelConfig.size.y; y++) {
      for (let x = 0; x < this.levelConfig.size.x; x++) {
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
          x + dx < this.levelConfig.size.x &&
          y + dy < this.levelConfig.size.y
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
