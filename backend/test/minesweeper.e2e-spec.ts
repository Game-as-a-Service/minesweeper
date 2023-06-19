// [Testing Asynchronous Code · Jest](https://jestjs.io/docs/asynchronous)
// [Promise - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
// [Using promises - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from '../src/app.module';
import * as WebSocket from 'ws';
import { WinLoseState } from '../src/minesweeper/gameState';
import { Cell, CellState } from '../src/minesweeper/cell';
import { Minesweeper } from '../src/minesweeper/minesweeper';
import { randomUUID } from 'crypto';
import { MinesweeperData } from '../src/data-services/data/minesweeper.data';
import { LevelConfig } from '../src/minesweeper/levelConfig';
import { DataServices } from '../src/data-services/data-services.service';

// [TypeScript Promise - Scaler Topics](https://www.scaler.com/topics/typescript/typescript-promise/)
describe('Asynchronous WebSocket Code', () => {
  let app: INestApplication;
  let ws: WebSocket;

  let dataServices: DataServices;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableShutdownHooks();

    dataServices = app.get(DataServices);

    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  // beforeEach(() => {});

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

  const gameInfo = (gameId: string = undefined) => {
    sendData('gameInfo', { gameId });
  };

  const open = (gameId: string, x: number, y: number) => {
    const data = {
      gameId,
      x,
      y,
    };

    sendData('open', data);
  };

  const flag = (gameId: string, x: number, y: number) => {
    const data = {
      gameId,
      x,
      y,
    };

    sendData('flag', data);
  };

  const onWsOpen = () => {
    ws = new WebSocket('ws://localhost:3000');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<void>(function (resolve, reject) {
      ws.on('open', () => {
        resolve();
      });
    });
  };

  const onWsMessage = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<any>(function (resolve, reject) {
      ws.on('message', (message) => {
        const event = JSON.parse(message.toString());
        resolve(event);
      });
    });
  };

  // 基本 websocket ping pong
  it('ping pong', async () => {
    await onWsOpen();
    ping();
    const event = await onWsMessage();
    expect(event.event).toBe('pong');
  });

  it('遊戲開始後，gameState 應該是 NONE', async () => {
    await onWsOpen();
    gameInfo();
    const event = await onWsMessage();
    expect(event.data.gameState.winLose).toBe(WinLoseState.NONE);
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置還沒踩過且沒有插旗', async () => {
    await onWsOpen();
    gameInfo();

    // given
    // 這個位置還沒踩過且沒有插旗
    let event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);

    // when
    // 玩家踩地雷
    open(event.data.gameId, 0, 0);

    // then
    // 這一格被踩過
    event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.OPENED);
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置已經被踩過', async () => {
    await onWsOpen();
    gameInfo();

    let event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);

    // given
    // 這個位置已經被踩過
    open(event.data.gameId, 0, 0);
    event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.OPENED);

    // when
    // 玩家踩地雷
    open(event.data.gameId, 0, 0);

    // then
    // 沒有變化
    event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.OPENED);
  });

  it('只能踩還沒有踩過且沒有插旗的格子 - 這個位置已經被插旗', async () => {
    await onWsOpen();
    gameInfo();

    let event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);

    // given
    // 這個位置已經被插旗
    flag(event.data.gameId, 0, 0);
    event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.FLAGGED);

    // when
    // 玩家踩地雷
    open(event.data.gameId, 0, 0);

    // then
    // 沒有變化
    event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.FLAGGED);
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

  /**
   * 3 x 3，只有 1 個地雷，要自己設定地雷位置
   */
  const initData = (): MinesweeperData => {
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

    return data;
  };

  it('踩到地雷遊戲結束', async () => {
    // Given
    const data = initData();

    // 在 0, 0 放地雷
    data.board.cells[0][0].mine = true;

    const domain: Minesweeper =
      dataServices.minesweeperDataModel.toDomain(data);
    await dataServices.minesweeperRepository.save(domain);

    await onWsOpen();
    gameInfo(domain.gameId);

    let event = await onWsMessage();
    expect(event.data.gameState.winLose).toBe(WinLoseState.NONE);

    // When
    // 玩家踩地雷
    open(event.data.gameId, 0, 0);

    // Then
    // 遊戲結束
    event = await onWsMessage();
    expect(event.data.gameState.winLose).toBe(WinLoseState.LOSE);
  });

  it('沒踩到地雷會知道附近有多少地雷', async () => {
    // Given
    const data = initData();

    // 在 0, 0 放地雷
    data.board.cells[0][1].mine = true;
    data.board.cells[0][0].number = 1;

    const domain: Minesweeper =
      dataServices.minesweeperDataModel.toDomain(data);
    await dataServices.minesweeperRepository.save(domain);

    await onWsOpen();
    gameInfo(domain.gameId);

    // When
    // 玩家踩地雷
    let event = await onWsMessage();
    open(event.data.gameId, 0, 0);

    // Then
    // 該格會知道附近有多少地雷
    event = await onWsMessage();
    expect(event.data.cells[0][0].number).toBe(1);
  });

  it('沒踩到地雷且附近也沒有地雷，自動踩附近的所有位置', async () => {
    // Given
    const data = initData();

    // 在 2, 2 放地雷
    data.board.cells[2][2].mine = true;

    const domain: Minesweeper =
      dataServices.minesweeperDataModel.toDomain(data);
    await dataServices.minesweeperRepository.save(domain);

    await onWsOpen();
    gameInfo(domain.gameId);

    let event = await onWsMessage();
    expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);
    expect(event.data.cells[0][1].state).toBe(CellState.UNOPENED);

    // When
    // 玩家踩地雷
    open(event.data.gameId, 0, 0);

    // Then
    // 自動踩附近的所有位置
    event = await onWsMessage();
    for (let y = 0; y < data.levelConfig.size.y; y++) {
      for (let x = 0; x < data.levelConfig.size.x; x++) {
        if (x !== 2 && y !== 2) {
          expect(event.data.cells[y][x].state).toBe(CellState.OPENED);
        }
      }
    }
  });
});
