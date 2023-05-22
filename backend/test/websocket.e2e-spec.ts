import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestFactory } from '@nestjs/core';
import * as WebSocket from 'ws';
import { AppModule } from '../src/app.module';
import { WinLoseState } from '../src/minesweeper/gameState';
import { Cell, CellState } from '../src/minesweeper/cell';
import { randomUUID } from 'crypto';
import { MinesweeperData } from '../src/data-services/data/minesweeper.data';
import { LevelConfig } from '../src/minesweeper/levelConfig';
import { MinesweeperRepository } from '../src/data-services/minesweeper-repository';
import MinesweeperDao from '../src/data-services/dao/minesweeper.dao';
import MinesweeperDataModel from '../src/data-services/data-model/minesweeper.data-model';
import { Minesweeper } from '../src/minesweeper/minesweeper';

describe('WebSocket Gateway', () => {
  let app: INestApplication;
  let ws: WebSocket;

  // TODO 暫時放這邊
  const minesweeperDao = new MinesweeperDao();
  const minesweeperDataModel = new MinesweeperDataModel();
  const minesweeperRepository = new MinesweeperRepository(
    minesweeperDao,
    minesweeperDataModel,
  );

  // beforeAll((done) => {
  //   NestFactory.create(AppModule).then((a) => {
  //     app = a;
  //     a.useWebSocketAdapter(new WsAdapter(a));
  //     a.listen(3000, done());
  //   });
  // });

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableShutdownHooks();
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    ws = new WebSocket('ws://localhost:3000');
  });

  afterEach((done) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.on('close', () => done());
      ws.close();
    } else {
      done();
    }
  });

  const sendData = (event: string, eventData: object) => {
    const data = JSON.stringify({
      event: event,
      data: JSON.stringify(eventData),
    });
    ws.send(data);
  };

  const ping = () => {
    sendData('ping', {});
  };

  const gameInfo = () => {
    sendData('gameInfo', {});
  };

  const open = (x: number, y: number) => {
    const data = {
      x,
      y,
    };

    sendData('open', data);
  };

  const flag = (x: number, y: number) => {
    const data = {
      x,
      y,
    };

    sendData('flag', data);
  };

  // 基本 websocket ping pong
  it('ping pong', (done) => {
    ws.on('open', () => {
      ping();
    });

    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());
      expect(event.event).toBe('pong');
      done();
    });
  });

  // 基本遊戲狀態
  it('when game start then gameState should be NONE', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
    });

    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());
      // expect(event.event).toBe("gameInfo");

      switch (event.event) {
        case 'pong':
          const data = JSON.stringify({ event: 'gameInfo', data: {} });
          ws.send(data);
          break;
        case 'gameInfo':
          expect(event.data.gameState.winLose).toBe(WinLoseState.NONE);
          done();
          break;
        default:
          break;
      }
    });
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置還沒踩過且沒有插旗', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
    });

    let gameInfoCount = 0;
    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());

      switch (event.event) {
        case 'pong':
          gameInfo();
          break;
        case 'gameInfo':
          gameInfoCount++;
          switch (gameInfoCount) {
            case 1:
              // given
              // 這個位置還沒踩過且沒有插旗
              // console.log(`gameInfo: ${gameInfoCount}`);
              // console.log(event.data);
              // console.log(event.data.cells[0][0].state === CellState.UNOPENED);
              expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);

              // when
              // 玩家踩地雷
              open(0, 0);
              break;
            case 2:
              // then
              // 這一格被踩過
              expect(event.data.cells[0][0].state).toBe(CellState.OPENED);
              done();
              break;
            default:
              throw new Error(`unhandled case`);
          }
          break;
        default:
          throw new Error(`unhandled case`);
      }
    });
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置已經被踩過', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
    });

    let gameInfoCount = 0;
    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());

      switch (event.event) {
        case 'pong':
          gameInfo();
          break;
        case 'gameInfo':
          gameInfoCount++;
          switch (gameInfoCount) {
            case 1:
              expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);
              open(0, 0);
              break;
            case 2:
              // given
              // 這個位置已經被踩過
              expect(event.data.cells[0][0].state).toBe(CellState.OPENED);

              // when
              // 玩家踩地雷
              open(0, 0);
              break;
            case 3:
              // then
              // 沒有變化
              expect(event.data.cells[0][0].state).toBe(CellState.OPENED);
              done();
              break;
            default:
              throw new Error(`unhandled case`);
          }
          break;
        default:
          throw new Error(`unhandled case`);
      }
    });
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置已經被插旗', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
    });

    let gameInfoCount = 0;
    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());

      switch (event.event) {
        case 'pong':
          gameInfo();
          break;
        case 'gameInfo':
          gameInfoCount++;
          switch (gameInfoCount) {
            case 1:
              expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);
              flag(0, 0);
              break;
            case 2:
              // given
              // 這個位置已經被插旗
              expect(event.data.cells[0][0].state).toBe(CellState.FLAGGED);

              // when
              // 玩家踩地雷
              open(0, 0);
              break;
            case 3:
              // then
              // 沒有變化
              expect(event.data.cells[0][0].state).toBe(CellState.FLAGGED);
              done();
              break;
            default:
              throw new Error(`unhandled case`);
          }
          break;
        default:
          throw new Error(`unhandled case`);
      }
    });
  });

  const generateCells = (levelConfig: LevelConfig): Cell[][] => {
    const cells = [];
    for (let y = 0; y < levelConfig.size.y; y++) {
      cells[y] = [];
      for (let x = 0; x < levelConfig.size.x; x++) {
        cells[y][x] = new Cell(x, y);
      }
    }
    return cells;
  };

  // TODO 可以透過 Bug 找到有地雷的格子，但是修正之後正常的情況應該怎麼做？
  it('踩到地雷遊戲結束', (done) => {
    // Given
    const levelConfig = {
      size: {
        x: 3,
        y: 3,
      },
      mineCount: 1,
    };

    const data: MinesweeperData = {
      gameId: randomUUID(),
      gameState: {
        isPlay: true,
        winLose: WinLoseState.NONE,
        displayMineCount: levelConfig.mineCount,
      },
      board: {
        cells: generateCells(levelConfig),
        unopenedCells:
          levelConfig.size.x * levelConfig.size.y - levelConfig.mineCount,
        flagCount: 0,
      },
      levelConfig,
    };

    const domain: Minesweeper = minesweeperDataModel.toDomain(data);
    minesweeperRepository.save(domain);

    ws.on('open', () => {
      done();
    });
  });

  // TODO 同上，這種預先設計的情況應該怎麼處理？
  it('沒踩到地雷會知道附近有多少地雷', (done) => {
    ws.on('open', () => {
      done();
    });
  });

  // TODO 同上
  it('沒踩到地雷且附近也沒有地雷，自動踩附近的所有位置', (done) => {
    ws.on('open', () => {
      done();
    });
  });
});
