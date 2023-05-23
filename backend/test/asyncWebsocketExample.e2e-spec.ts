// [Testing Asynchronous Code · Jest](https://jestjs.io/docs/asynchronous)
// [Promise - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
// [Using promises - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from '../src/app.module';
import * as WebSocket from 'ws';
import { WinLoseState } from '../src/minesweeper/gameState';

// [TypeScript Promise - Scaler Topics](https://www.scaler.com/topics/typescript/typescript-promise/)
describe.skip('Asynchronous WebSocket Code', () => {
  let app: INestApplication;
  let ws: WebSocket;

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

  const onWsOpen = () => {
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

  // 基本遊戲狀態
  it('when game start then gameState should be NONE', async () => {
    await onWsOpen();
    ping();
    let event = await onWsMessage();
    expect(event.event).toBe('pong');
    gameInfo();
    event = await onWsMessage();
    expect(event.data.gameState.winLose).toBe(WinLoseState.NONE);
  });
});
