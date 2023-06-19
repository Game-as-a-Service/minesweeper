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

@WebSocketGateway()
export class WsGateway implements OnApplicationShutdown {
  @WebSocketServer()
  server: Server;
  clientList: any[];
  isAliveTimer: NodeJS.Timer = undefined;

  constructor(
    private readonly dataServices: DataServices,
    private readonly useCaseService: UseCaseService,
  ) {
    this.clientList = [];

    this.isAliveTimer = setInterval(() => {
      this.server.clients.forEach(function each(ws: any) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
      });
    }, 1000 * 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onApplicationShutdown(signal?: string) {
    clearInterval(this.isAliveTimer);
  }

  async handleConnection(client: any) {
    this.clientList.push(client);
  }

  handleDisconnect(client) {
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
  async onGameInfo(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  async onOpen(client: any, data: string): Promise<WsResponse<object>> {
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
