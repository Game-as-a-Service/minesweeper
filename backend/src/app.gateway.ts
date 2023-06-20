import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Minesweeper } from './minesweeper/minesweeper';
import { OnApplicationShutdown } from '@nestjs/common';
import { DataServices } from './data-services/data-services.service';
import { UseCaseService } from './use-case/use-case.service';
import { WebSocket } from 'ws';
import { JwtService } from '@nestjs/jwt';

interface MyWebSocket extends WebSocket {
  extra: {
    isAlive: boolean;
    account: string;
  };
}

@WebSocketGateway()
export class WsGateway implements OnApplicationShutdown {
  @WebSocketServer()
  server: Server;
  clientList: MyWebSocket[];
  isAliveTimer: NodeJS.Timer = undefined;

  constructor(
    private readonly dataServices: DataServices,
    private readonly useCaseService: UseCaseService,
    private readonly jwtService: JwtService,
  ) {
    this.clientList = [];

    this.isAliveTimer = setInterval(() => {
      this.server.clients.forEach(function each(client: WebSocket) {
        const ws: MyWebSocket = client as MyWebSocket;
        if (ws.extra.isAlive === false) return ws.terminate();
        ws.extra.isAlive = false;
      });
    }, 1000 * 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onApplicationShutdown(signal?: string) {
    clearInterval(this.isAliveTimer);
  }

  async handleConnection(client: MyWebSocket) {
    client.extra = {
      isAlive: true,
      account: '',
    };
    this.clientList.push(client);
  }

  handleDisconnect(client: MyWebSocket) {
    const index = this.clientList.indexOf(client, 0);
    if (index > -1) {
      this.clientList.splice(index, 1);
    }
  }

  @SubscribeMessage('ping')
  onPing(client: MyWebSocket, data: any): WsResponse<object> {
    client.extra.isAlive = true;
    return { event: 'pong', data };
  }

  checkAuth(client: MyWebSocket) {
    if (client.extra.account === '') {
      return false;
    }

    return true;
  }

  // client send: {"event":"login","data":"{token: "abcdef"}"}
  @SubscribeMessage('login')
  async onLogin(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    try {
      const payload = await this.jwtService.verifyAsync(input.token);
      client.extra.account = payload.account;

      return { event: 'login_ack', data: { login: true } };
    } catch (err) {
      return { event: 'auth_fail', data: {} };
    }
  }

  // client send: {"event":"board","data":""}
  @SubscribeMessage('gameInfo')
  async onGameInfo(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  async onOpen(client: any, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    await this.useCaseService.openUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  async onFlag(client: any, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    await this.useCaseService.flagUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"chording","data":"{x: 0, y: 1}"}
  @SubscribeMessage('chording')
  async onChording(client: any, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    await this.useCaseService.chordingUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{level: 0}"}
  @SubscribeMessage('start')
  async onStart(client: any, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    const gameId = await this.useCaseService.startUseCase.execute(input.level);

    return this.gameInfo(gameId);
  }

  async gameInfo(gameId: string) {
    if (gameId === undefined || gameId === null) {
      gameId = await this.useCaseService.startUseCase.execute();
    }

    const game: Minesweeper =
      await this.dataServices.minesweeperRepository.findById(gameId);

    if (game === null) {
      console.log(`game is null`);
      return;
    }

    const data = {
      gameId: gameId,
      clientCount: this.clientList.length,
      gameState: game.gameState,
      cells: game.board.cells,
    };

    return { event: 'gameInfo', data };
  }
}
