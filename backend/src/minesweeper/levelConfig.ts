import { Size } from './size';

export class LevelConfig {
  size: Size;
  mineCount: number;

  constructor(size: Size, mineCount: number) {
    this.size = size;
    this.mineCount = mineCount;
  }
}
