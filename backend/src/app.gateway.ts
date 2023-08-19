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
import { Auth0Service } from './auth/auth0.service';

interface MyWebSocket extends WebSocket {
  extra: {
    isAlive: boolean;
    user: {
      account: string;
      id: number;
    };
    game: {
      isPlaying: boolean;
      id: string;
      viewerList: MyWebSocket[];
      isViewer: boolean;
      watchUserId: number;
    };
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
    private readonly auth0Service: Auth0Service,
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
      user: {
        account: '',
        id: -1,
      },
      game: {
        isPlaying: false,
        id: '',
        viewerList: [],
        isViewer: false,
        watchUserId: -1,
      },
    };
    this.clientList.push(client);
  }

  handleDisconnect(client: MyWebSocket) {
    const index = this.clientList.indexOf(client, 0);
    if (index > -1) {
      this.clientList.splice(index, 1);
    }
    this.leaveRoom(client);
  }

  @SubscribeMessage('ping')
  onPing(client: MyWebSocket, data: any): WsResponse<object> {
    client.extra.isAlive = true;
    return { event: 'pong', data };
  }

  checkAuth(client: MyWebSocket) {
    if (client.extra.user.id === -1) {
      return false;
    }

    if (client.extra.user.account === '') {
      return false;
    }

    return true;
  }

  async isPlayer(gameId: string, playerId: number): Promise<boolean> {
    const game: Minesweeper =
      await this.dataServices.minesweeperRepository.findById(gameId);

    return game.playerId === playerId;
  }

  @SubscribeMessage('login_waterball')
  async onLoginWaterball(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    try {
      const { jwt, nickname } = await this.auth0Service.login(input.token);
      return { event: 'login_waterball_ack', data: { jwt, nickname } };
    } catch (err) {
      return { event: 'auth_fail', data: { message: 'verify fail' } };
    }
  }

  // client send: {"event":"login","data":"{ token: "abcdef" }"}
  @SubscribeMessage('login')
  async onLogin(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    const input = JSON.parse(data);
    try {
      const payload = await this.jwtService.verifyAsync(input.token);

      if (payload.id === null) {
        return {
          event: 'auth_fail',
          data: { message: 'token is old version' },
        };
      }

      client.extra.user.id = payload.id;
      client.extra.user.account = payload.account;

      return { event: 'login_ack', data: { login: true } };
    } catch (err) {
      return { event: 'auth_fail', data: { message: 'verify fail' } };
    }
  }

  // client send: {"event":"open","data":"{ playerId: "xxx", level: 0}"}
  @SubscribeMessage('start')
  async onStart(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    const gameId = await this.useCaseService.startUseCase.execute(
      client.extra.user.id,
      input.level,
    );

    client.extra.game.isPlaying = true;
    client.extra.game.id = gameId;

    await this.joinRoom(gameId, client);

    return this.gameInfo(gameId);
  }

  @SubscribeMessage('roomList')
  async onRoomList(client: MyWebSocket): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const data = { roomList: [] };

    const playingList = this.clientList.filter((c: MyWebSocket) => {
      return c.extra.game.isPlaying;
    });

    for (const client of playingList) {
      data.roomList.push({
        gameId: client.extra.game.id,
        playerAccount: client.extra.user.account,
      });
    }

    return { event: 'roomList', data };
  }

  // client send: {"event":"board","data":"{ gameId: "xxx" }"}
  @SubscribeMessage('gameInfo')
  async onGameInfo(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);

    await this.joinRoom(input.gameId, client);

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  async onOpen(client: MyWebSocket, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    if ((await this.isPlayer(input.gameId, client.extra.user.id)) === false) {
      return;
    }

    await this.useCaseService.openUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  async onFlag(client: MyWebSocket, data: string): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    if ((await this.isPlayer(input.gameId, client.extra.user.id)) === false) {
      return;
    }
    await this.useCaseService.flagUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"chording","data":"{x: 0, y: 1}"}
  @SubscribeMessage('chording')
  async onChording(
    client: MyWebSocket,
    data: string,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = JSON.parse(data);
    if ((await this.isPlayer(input.gameId, client.extra.user.id)) === false) {
      return;
    }
    await this.useCaseService.chordingUseCase.execute(
      input.gameId,
      input.x,
      input.y,
    );

    return this.gameInfo(input.gameId);
  }

  async gameInfo(gameId: string) {
    if (gameId === undefined || gameId === null) {
      throw Error('Game not Exist');
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

    const event = { event: 'gameInfo', data };

    this.broadcast(gameId, event);
    return event;
  }

  broadcast(gameId: string, event) {
    const host = this.clientList.filter((c) => c.extra.game.id === gameId);

    for (const client of host[0].extra.game.viewerList) {
      client.send(JSON.stringify(event));
    }
  }

  async joinRoom(gameId: string, client: MyWebSocket) {
    this.leaveRoom(client);

    if (await this.isPlayer(gameId, client.extra.user.id)) {
      client.extra.game.isPlaying = true;
      client.extra.game.id = gameId;
    } else {
      const host = this.clientList.filter((c) => c.extra.game.id === gameId)[0];
      host.extra.game.viewerList.push(client);
      client.extra.game.isViewer = true;
      client.extra.game.watchUserId = host.extra.user.id;
    }
  }

  private leaveRoom(client: MyWebSocket) {
    if (client.extra.game.isPlaying) {
      client.extra.game.isPlaying = false;
      client.extra.game.id = '';
    }

    if (client.extra.game.isViewer) {
      const host = this.clientList.filter(
        (c) => c.extra.user.id === client.extra.game.watchUserId,
      )[0];

      const index = host.extra.game.viewerList.indexOf(client, 0);
      if (index > -1) {
        host.extra.game.viewerList.splice(index, 1);
      }
      client.extra.game.isViewer = false;
      client.extra.game.watchUserId = -1;
    }
  }
}
