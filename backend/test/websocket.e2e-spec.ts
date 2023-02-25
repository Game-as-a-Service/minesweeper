import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestFactory } from '@nestjs/core';
import * as WebSocket from 'ws';
import { AppModule } from '../src/app.module';
import { WinLoseState } from '../src/minesweeper/gameState';

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

  it('ping pong', (done) => {
    ws.on('open', () => {
      const data = JSON.stringify({ event: 'ping', data: {} });
      ws.send(data);
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
});
