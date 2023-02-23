import { Game } from "./game";
import { WinLoseState } from "./gameState";

describe('minesweeper', () => {
  let game: Game;

  beforeEach(async () => {
    game = new Game();
  });

  describe('root', () => {
    it('when new Game winlose should be NONE', () => {
      expect(game.gameState.winLose).toBe(WinLoseState.NONE);
    });
  });
});
