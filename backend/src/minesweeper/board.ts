import { Cell, CellState } from './cell';
import { Game } from './game';
import { WinLoseState } from './gameState';
import { LevelConfig } from './levelConfig';

export class Board {
  game: Game;
  cells: Cell[][];
  unopenedCells: number;
  flagCount: number;

  constructor(game: Game) {
    this.game = game;
  }

  init() {
    this.flagCount = 0;

    this.generateCells();
    this.generateMine(this.game.levelConfig);
    this.generateNumber(this.game.levelConfig);
  }

  open(x: number, y: number) {
    if (this.game.gameState.isPlay === false) {
      return;
    }

    // console.log(`x:${x}, y:${y}`);
    const cell = this.cells[y][x];
    if (cell === undefined) {
      return;
    }

    if (cell.state !== CellState.UNOPENED) {
      return;
    }

    cell.state = CellState.OPENED;

    if (cell.mine) {
      this.game.gameState.isPlay = false;
      this.game.gameState.winLose = WinLoseState.LOSE;
      console.log('you lose');
      return;
    }

    this.unopenedCells--;
    if (this.unopenedCells === 0) {
      this.game.gameState.isPlay = false;
      this.game.gameState.winLose = WinLoseState.WIN;
      console.log('you win');
    }

    if (cell.number === 0) {
      this.autoOpen(cell);
    }
  }

  flag(x: number, y: number) {
    if (this.game.gameState.isPlay === false) {
      return;
    }

    const cell = this.cells[y][x];
    if (cell === undefined) {
      return;
    }

    if (cell.state === CellState.OPENED) {
      return;
    }

    if (cell.state === CellState.UNOPENED) {
      cell.state = CellState.FLAGGED;
      this.flagCount++;
    } else if (cell.state === CellState.FLAGGED) {
      cell.state = CellState.UNOPENED;
      this.flagCount--;
    }

    this.game.gameState.displayMineCount =
      this.game.levelConfig.mineCount - this.flagCount;
  }

  chording(x: number, y: number) {
    if (this.game.gameState.isPlay === false) {
      return;
    }

    const cell = this.cells[y][x];
    if (cell.state === CellState.UNOPENED) {
      return;
    }

    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (
          cell.x + dx >= 0 &&
          cell.y + dy >= 0 &&
          cell.x + dx < this.game.levelConfig.size.x &&
          cell.y + dy < this.game.levelConfig.size.y
        ) {
          if (this.cells[y + dy][x + dx].state === CellState.FLAGGED) {
            flagCount++;
          }
        }
      }
    }

    if (flagCount === cell.number) {
      this.autoOpen(cell);
    }
  }

  display() {
    for (let y = 0; y < this.game.levelConfig.size.y; y++) {
      let line = '';
      for (let x = 0; x < this.game.levelConfig.size.x; x++) {
        const cell = this.cells[y][x];
        // let symbol = cell.mine ? 'X' : cell.number;
        let symbol;

        if (cell.state === CellState.UNOPENED) {
          symbol = '.';
        } else if (cell.state === CellState.FLAGGED) {
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
          cell.x + dx < this.game.levelConfig.size.x &&
          cell.y + dy < this.game.levelConfig.size.y
        ) {
          this.open(cell.x + dx, cell.y + dy);
        }
      }
    }
  }

  private generateCells() {
    this.cells = [];
    for (let y = 0; y < this.game.levelConfig.size.y; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.game.levelConfig.size.x; x++) {
        this.cells[y][x] = new Cell(x, y);
      }
    }
  }

  private generateMine(config: LevelConfig) {
    // this.manualMine(config);
    this.randomMine(config);
  }

  private randomMine(config: LevelConfig) {
    for (let i = 0; i < config.mineCount; ) {
      const x = this.getRandomIntInclusive(0, config.size.x - 1);
      const y = this.getRandomIntInclusive(0, config.size.y - 1);

      if (this.cells[y][x].mine === false) {
        this.cells[y][x].mine = true;
        i++;
      }
    }

    this.unopenedCells = config.size.x * config.size.y;
    this.unopenedCells = this.unopenedCells - config.mineCount;
  }

  private getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  private manualMine(config: LevelConfig) {
    this.cells[0][2].mine = true;
    this.cells[0][3].mine = true;
    this.cells[1][1].mine = true;
    this.cells[2][4].mine = true;

    this.unopenedCells = config.size.x * config.size.y;
    this.unopenedCells = this.unopenedCells - 4;
  }

  private generateNumber(config: LevelConfig) {
    for (let y = 0; y < config.size.y; y++) {
      for (let x = 0; x < config.size.x; x++) {
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
          x + dx < this.game.levelConfig.size.x &&
          y + dy < this.game.levelConfig.size.y
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
