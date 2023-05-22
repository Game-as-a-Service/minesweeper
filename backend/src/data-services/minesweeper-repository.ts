import { Minesweeper } from '../minesweeper/minesweeper';
import IRepository from '../use-case/repository.interface';
import MinesweeperDao from './dao/minesweeper.dao';
import MinesweeperDataModel from './data-model/minesweeper.data-model';
import { MinesweeperData } from './data/minesweeper.data';

export class MinesweeperRepository implements IRepository<Minesweeper> {
  constructor(
    private _dao: MinesweeperDao,
    private _dataModel: MinesweeperDataModel,
  ) {}

  async findById(id: string): Promise<Minesweeper | null> {
    const data: MinesweeperData = await this._dao.findById(id);
    if (data === null) {
      return null;
    }
    return this._dataModel.toDomain(data) as Minesweeper;
  }

  async save(game: Minesweeper): Promise<void> {
    const data: MinesweeperData = this._dataModel.toData(game);
    await this._dao.save(data);
  }
}
