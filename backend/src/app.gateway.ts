import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { AppService } from './app.service';
import { Board } from './minesweeper/board';

@WebSocketGateway()
export class WsGateway {
  @WebSocketServer()
  server: Server;
  clientList: any[];

  constructor(private readonly appService: AppService) {
    this.clientList = [];

    setInterval(() => {
      this.server.clients.forEach(function each(ws: any) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
      });
    }, 1000 * 10);
  }

  handleConnection(client: any) {
    client.game = new Board();
    client.game.start();
    this.clientList.push(client);
  }

  handleDisconnect(client) {
    if (client.game) {
      delete client.game;
    }

    const index = this.clientList.indexOf(client, 0);
    if (index > -1) {
      this.clientList.splice(index, 1);
    }
  }

  @SubscribeMessage('ping')
  onPing(client: any, data: any): WsResponse<object> {
    client.isAlive = true;
    return { event: 'pong', data };
  }

  // client send: {"event":"board","data":""}
  @SubscribeMessage('gameInfo')
  // onBoard(client: any, data: any): WsResponse<object> {
  onBoard(client: any): WsResponse<object> {
    if (client.game === undefined) {
      console.log(`client.game is undefined`);
      return;
    }

    return this.gameInfo(client.game);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  onOpen(client: any, data: string): WsResponse<object> {
    if (client.game === undefined) {
      console.log(`client.game is undefined`);
      return;
    }

    const input = JSON.parse(data);
    // console.log(`open: ${input}`);
    // console.log(`miinesweeper: ${this.appService.minesweeper.unopenedCells}`)
    client.game.open(input.x, input.y);

    return this.gameInfo(client.game);
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  onFlag(client: any, data: string): WsResponse<object> {
    if (client.game === undefined) {
      console.log(`client.game is undefined`);
      return;
    }

    const input = JSON.parse(data);
    client.game.flag(input.x, input.y);

    return this.gameInfo(client.game);
  }

  // client send: {"event":"chording","data":"{x: 0, y: 1}"}
  @SubscribeMessage('chording')
  onChording(client: any, data: string): WsResponse<object> {
    if (client.game === undefined) {
      console.log(`client.game is undefined`);
      return;
    }

    const input = JSON.parse(data);
    client.game.chording(input.x, input.y);

    return this.gameInfo(client.game);
  }

  // client send: {"event":"open","data":"{level: 0}"}
  @SubscribeMessage('start')
  onStart(client: any, data: string): WsResponse<object> {
    if (client.game === undefined) {
      console.log(`client.game is undefined`);
      return;
    }

    const input = JSON.parse(data);
    // console.log(`${input.level}`);
    client.game.start(input.level);

    return this.gameInfo(client.game);
  }

  gameInfo(game: Board) {
    const data = {
      clientCount: this.clientList.length,
      gameState: game.gameState,
      cells: game.cells,
    };

    return { event: 'gameInfo', data };
  }
}
