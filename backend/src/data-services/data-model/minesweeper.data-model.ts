import DataModel from './data-model';
import { MinesweeperData } from '../data/minesweeper.data';
import { Minesweeper } from '../../minesweeper/minesweeper';
import { Board } from '../../minesweeper/board';

export default class MinesweeperDataModel
  implements DataModel<Minesweeper, MinesweeperData>
{
  toData(domain: Minesweeper): MinesweeperData {
    const data: MinesweeperData = {
      gameId: domain.gameId,
      gameState: domain.gameState,
      board: {
        cells: domain.board.cells,
        unopenedCells: domain.board.unopenedCells,
        flagCount: domain.board.flagCount,
      },
      levelConfig: domain.levelConfig,
    };

    return data;
  }

  toDomain(data: MinesweeperData): Minesweeper {
    const domain = new Minesweeper();
    domain.gameId = data.gameId;
    domain.gameState = data.gameState;
    domain.board = new Board(domain);
    domain.board.cells = data.board.cells;
    domain.board.unopenedCells = data.board.unopenedCells;
    domain.board.flagCount = data.board.flagCount;
    domain.levelConfig = data.levelConfig;

    return domain;
  }
}
