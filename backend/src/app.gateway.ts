import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { AppService } from './app.service';
import { Minesweeper } from './minesweeper/minesweeper';
import { OnApplicationShutdown } from '@nestjs/common';

import MinesweeperDao from './data-services/dao/minesweeper.dao';
import MinesweeperDataModel from './data-services/data-model/minesweeper.data-model';
import { MinesweeperRepository } from './data-services/minesweeper-repository';
import { StartUseCase } from './use-case/startUseCase';
import { OpenUseCase } from './use-case/openUseCase';
import { FlagUseCase } from './use-case/flagUseCase';
import { ChordingUseCase } from './use-case/chordingUseCase';

@WebSocketGateway()
export class WsGateway implements OnApplicationShutdown {
  @WebSocketServer()
  server: Server;
  clientList: any[];
  isAliveTimer: NodeJS.Timer = undefined;

  // TODO Use Case 暫時放這邊
  minesweeperDao = new MinesweeperDao();
  minesweeperDataModel = new MinesweeperDataModel();
  minesweeperRepository = new MinesweeperRepository(
    this.minesweeperDao,
    this.minesweeperDataModel,
  );

  startUseCase: StartUseCase = new StartUseCase(this.minesweeperRepository);
  openUseCase: OpenUseCase = new OpenUseCase(this.minesweeperRepository);
  flagUseCase: FlagUseCase = new FlagUseCase(this.minesweeperRepository);
  chordingUseCase: ChordingUseCase = new ChordingUseCase(
    this.minesweeperRepository,
  );

  constructor(private readonly appService: AppService) {
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
    client.gameId = await this.startUseCase.execute();
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
  // onBoard(client: any, data: any): WsResponse<object> {
  async onBoard(client: any): Promise<WsResponse<object>> {
    return this.gameInfo(client.gameId);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  async onOpen(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    this.openUseCase.execute(client.gameId, input.x, input.y);

    return this.gameInfo(client.gameId);
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  async onFlag(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    this.flagUseCase.execute(client.gameId, input.x, input.y);

    return this.gameInfo(client.gameId);
  }

  // client send: {"event":"chording","data":"{x: 0, y: 1}"}
  @SubscribeMessage('chording')
  async onChording(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    this.chordingUseCase.execute(client.gameId, input.x, input.y);

    return this.gameInfo(client.gameId);
  }

  // client send: {"event":"open","data":"{level: 0}"}
  @SubscribeMessage('start')
  async onStart(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    client.gameId = await this.startUseCase.execute(input.level);

    return this.gameInfo(client.gameId);
  }

  async gameInfo(gameId: string) {
    const game: Minesweeper = await this.minesweeperRepository.findById(gameId);

    if (game === undefined) {
      console.log(`game is undefined`);
      return;
    }

    const data = {
      clientCount: this.clientList.length,
      gameState: game.gameState,
      cells: game.board.cells,
    };

    return { event: 'gameInfo', data };
  }
}
