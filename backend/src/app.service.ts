import { Injectable } from '@nestjs/common';
import { Board } from './minesweeper/board';

@Injectable()
export class AppService {
  minesweeper: Board;
  constructor() {
    this.minesweeper = new Board();
    this.minesweeper.start();
    // this.minesweeper.display();
    // this.minesweeper.open(0, 1);
    // this.minesweeper.display();
    // this.minesweeper.flag(1, 1);
    // this.minesweeper.display();
    // this.minesweeper.open(1, 1);
    // this.minesweeper.display();
    // this.minesweeper.open(3, 1);
    // this.minesweeper.display();
    // this.minesweeper.open(1, 0);
    // this.minesweeper.display();

    // this.minesweeper.open(0, 0);
    // this.minesweeper.display();
    // this.minesweeper.open(4, 0);
    // this.minesweeper.display();
    // this.minesweeper.open(4, 1);
    // this.minesweeper.display();
    // this.minesweeper.open(2, 1);
    // this.minesweeper.display();
    // this.minesweeper.open(0, 2);
    // this.minesweeper.display();
    // this.minesweeper.open(1, 2);
    // this.minesweeper.display();
    // this.minesweeper.open(2, 2);
    // this.minesweeper.display();
    // this.minesweeper.open(3, 2);
    // this.minesweeper.display();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
