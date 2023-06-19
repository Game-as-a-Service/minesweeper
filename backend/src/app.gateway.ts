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
import MinesweeperDataModel from './data-services/data-model/minesweeper.data-model';
import { MinesweeperRepository } from './data-services/minesweeper-repository';
import { StartUseCase } from './use-case/startUseCase';
import { OpenUseCase } from './use-case/openUseCase';
import { FlagUseCase } from './use-case/flagUseCase';
import { ChordingUseCase } from './use-case/chordingUseCase';
import MinesweeperMemoryDao from './data-services/dao/minesweeper-memory.dao';
import MinesweeperPostgresqlDao from './data-services/dao/minesweeper-postgresql.dao';
import { PrismaService } from './common/services/prisma.service';
import { Dao } from './data-services/dao/dao';
import { MinesweeperData } from './data-services/data/minesweeper.data';

@WebSocketGateway()
export class WsGateway implements OnApplicationShutdown {
  @WebSocketServer()
  server: Server;
  clientList: any[];
  isAliveTimer: NodeJS.Timer = undefined;

  minesweeperDao: Dao<MinesweeperData>;
  minesweeperDataModel: MinesweeperDataModel;
  minesweeperRepository: MinesweeperRepository;

  // TODO Use Case 暫時放這邊
  startUseCase: StartUseCase;
  openUseCase: OpenUseCase;
  flagUseCase: FlagUseCase;
  chordingUseCase: ChordingUseCase;

  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
  ) {
    // this.minesweeperDao = new MinesweeperMemoryDao();
    this.minesweeperDao = new MinesweeperPostgresqlDao(prisma);
    this.minesweeperDataModel = new MinesweeperDataModel();
    this.minesweeperRepository = new MinesweeperRepository(
      this.minesweeperDao,
      this.minesweeperDataModel,
    );
    this.startUseCase = new StartUseCase(this.minesweeperRepository);
    this.openUseCase = new OpenUseCase(this.minesweeperRepository);
    this.flagUseCase = new FlagUseCase(this.minesweeperRepository);
    this.chordingUseCase = new ChordingUseCase(this.minesweeperRepository);

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
    await this.openUseCase.execute(input.gameId, input.x, input.y);

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  async onFlag(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    await this.flagUseCase.execute(input.gameId, input.x, input.y);

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"chording","data":"{x: 0, y: 1}"}
  @SubscribeMessage('chording')
  async onChording(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    await this.chordingUseCase.execute(input.gameId, input.x, input.y);

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{level: 0}"}
  @SubscribeMessage('start')
  async onStart(client: any, data: string): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    const gameId = await this.startUseCase.execute(input.level);

    return this.gameInfo(gameId);
  }

  async gameInfo(gameId: string) {
    if (gameId === undefined || gameId === null) {
      gameId = await this.startUseCase.execute();
    }

    const game: Minesweeper = await this.minesweeperRepository.findById(gameId);

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
