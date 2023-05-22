import { Minesweeper } from './minesweeper';
import { WinLoseState } from './gameState';

describe('minesweeper', () => {
  let game: Minesweeper;

  beforeEach(async () => {
    game = new Minesweeper();
  });

  describe('root', () => {
    it('when new Game winlose should be NONE', () => {
      expect(game.gameState.winLose).toBe(WinLoseState.NONE);
    });
  });
});
