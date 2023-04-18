import { Board } from './board';
import { GameState, WinLoseState } from './gameState';
import { Level } from './level';
import { LevelConfig } from './levelConfig';
import { Size } from './size';

const LevelConfigMap: Map<Level, LevelConfig> = new Map<Level, LevelConfig>();
LevelConfigMap.set(Level.BEGINNER, new LevelConfig(new Size(9, 9), 10));
LevelConfigMap.set(Level.INTERMEDIATE, new LevelConfig(new Size(16, 16), 40));
LevelConfigMap.set(Level.EXPERT, new LevelConfig(new Size(30, 16), 99));

export class Game {
  gameState: GameState;
  board: Board;
  levelConfig: LevelConfig;

  constructor() {
    this.gameState = new GameState();
    this.board = new Board(this);
  }

  start(level: Level = Level.BEGINNER) {
    this.levelConfig = LevelConfigMap.get(level);

    this.board.init();

    this.gameState.isPlay = true;
    this.gameState.winLose = WinLoseState.NONE;
    this.gameState.displayMineCount = this.levelConfig.mineCount;

    // console.log(`start`);
  }

  open(x: number, y: number) {
    this.board.open(x, y);
  }

  flag(x: number, y: number) {
    this.board.flag(x, y);
  }

  chording(x: number, y: number) {
    this.board.chording(x, y);
  }
}
