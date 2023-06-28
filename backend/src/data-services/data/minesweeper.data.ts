import { CellState } from '../../minesweeper/cell';
import { WinLoseState } from '../../minesweeper/gameState';
import { Size } from '../../minesweeper/size';

export type MinesweeperData = {
  gameId: string;
  playerId: number;
  gameState: GameState;
  board: Board;
  levelConfig: LevelConfig;
};

type GameState = {
  isPlay: boolean;
  winLose: WinLoseState;
  displayMineCount: number;
};

type Board = {
  cells: Cell[][];
  unopenedCells: number;
  flagCount: number;
};

type Cell = {
  x: number;
  y: number;
  mine: boolean;
  number: number;
  state: CellState;
};

type LevelConfig = {
  size: Size;
  mineCount: number;
};
