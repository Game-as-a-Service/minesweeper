import { Minesweeper } from '../minesweeper/minesweeper';
import IRepository from './repository.interface';

export class ChordingUseCase {
  constructor(minesweeperRepository: IRepository<Minesweeper>) {
    this.minesweeperRepository = minesweeperRepository;
  }

  private minesweeperRepository: IRepository<Minesweeper>;

  async execute(gameId: string, x: number, y: number) {
    const game = await this.minesweeperRepository.findById(gameId);
    game.chording(x, y);
    await this.minesweeperRepository.save(game);
    return;
  }
}
