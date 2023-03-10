import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestFactory } from '@nestjs/core';
import * as WebSocket from 'ws';
import { AppModule } from '../src/app.module';
import { WinLoseState } from '../src/minesweeper/gameState';
import { CellState } from '../src/minesweeper/cell';

describe('WebSocket Gateway', () => {
  let app: INestApplication;
  let ws: WebSocket;

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

  it('when cell is unopened then open should be opened', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
    });

    let gameInfoCount = 0;
    ws.on('message', (message) => {
      const event = JSON.parse(message.toString());
      // expect(event.event).toBe("gameInfo");

      switch (event.event) {
        case 'pong':
          gameInfo();
          break;
        case 'gameInfo':
          gameInfoCount++;
          switch (gameInfoCount) {
            case 1:
              // console.log(`gameInfo: ${gameInfoCount}`);
              // console.log(event.data);
              // console.log(event.data.cells[0][0].state === CellState.UNOPENED);
              expect(event.data.cells[0][0].state).toBe(CellState.UNOPENED);
              open(0, 0);
              break;
            case 2:
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
});
