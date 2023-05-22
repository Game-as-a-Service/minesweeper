import { Minesweeper } from '../minesweeper/minesweeper';
import IRepository from './repository.interface';

export class OpenUseCase {
  constructor(minesweeperRepository: IRepository<Minesweeper>) {
    this.minesweeperRepository = minesweeperRepository;
  }

  private minesweeperRepository: IRepository<Minesweeper>;

  async execute(gameId: string, x: number, y: number) {
    const game = await this.minesweeperRepository.findById(gameId);
    game.open(x, y);
    await this.minesweeperRepository.save(game);
    return;
  }
}
