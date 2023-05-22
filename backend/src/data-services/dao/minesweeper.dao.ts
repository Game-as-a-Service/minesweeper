import { MinesweeperData } from '../data/minesweeper.data';
import { Dao } from './dao';

export default class MinesweeperDao implements Dao<MinesweeperData> {
  gameMap: Map<string, MinesweeperData> = new Map();

  async findById(id: string): Promise<MinesweeperData> {
    const game = this.gameMap.get(id);

    return game;
  }

  async save(game: MinesweeperData) {
    this.gameMap.set(game.gameId, game);
  }
}
