import { Minesweeper } from '../minesweeper/minesweeper';
import IRepository from './repository.interface';
import { randomUUID } from 'crypto';
import { Level } from '../minesweeper/level';

export class StartUseCase {
  constructor(minesweeperRepository: IRepository<Minesweeper>) {
    this.minesweeperRepository = minesweeperRepository;
  }

  private minesweeperRepository: IRepository<Minesweeper>;

  async execute(playerId?: number, level: Level = Level.BEGINNER) {
    const game = new Minesweeper();
    game.gameId = randomUUID();
    game.playerId = playerId;
    game.start(level);
    await this.minesweeperRepository.save(game);
    return game.gameId;
  }
}
