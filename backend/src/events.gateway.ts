import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DataServices } from './data-services/data-services.service';
import { Minesweeper } from './minesweeper/minesweeper';
import { UseCaseService } from './use-case/use-case.service';
import { Auth0Service } from './auth/auth0.service';

interface MyWebSocket extends Socket {
  data: {
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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  clientList: MyWebSocket[];

  constructor(
    private readonly dataServices: DataServices,
    private readonly useCaseService: UseCaseService,
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
  ) {
    this.clientList = [];
  }

  handleConnection(client: MyWebSocket) {
    client.data = {
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
  onPing(@MessageBody() data: any): WsResponse<object> {
    return { event: 'pong', data };
  }

  checkAuth(client: MyWebSocket) {
    if (client.data.user.id === -1) {
      return false;
    }

    if (client.data.user.account === '') {
      return false;
    }

    return true;
  }

  async isPlayer(gameId: string, playerId: number): Promise<boolean> {
    const game: Minesweeper =
      await this.dataServices.minesweeperRepository.findById(gameId);

    return game.playerId === playerId;
  }

  // client send: {"event":"login","data":"{ token: "abcdef" }"}
  @SubscribeMessage('login')
  async onLogin(
    @ConnectedSocket() client: MyWebSocket,
    @MessageBody() data: any,
  ): Promise<WsResponse<object>> {
    const input = data;
    try {
      const payload = await this.jwtService.verifyAsync(input.token);

      if (payload.id === null) {
        return {
          event: 'auth_fail',
          data: { message: 'token is old version' },
        };
      }

      client.data.user.id = payload.id;
      client.data.user.account = payload.account;

      return { event: 'login_ack', data: { login: true } };
    } catch (err) {
      console.log(err);
      return { event: 'auth_fail', data: { message: 'verify fail' } };
    }
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

  // client send: {"event":"open","data":"{ playerId: "xxx", level: 0}"}
  @SubscribeMessage('start')
  async onStart(client: MyWebSocket, data: any): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = data;
    const gameId = await this.useCaseService.startUseCase.execute(
      client.data.user.id,
      input.level,
    );

    client.data.game.isPlaying = true;
    client.data.game.id = gameId;

    await this.joinRoom(gameId, client);

    return this.gameInfo(gameId);
  }
  roomListEvent() {
    const data = { roomList: [] };

    const playingList = this.clientList.filter((c: MyWebSocket) => {
      return c.data.game.isPlaying;
    });

    for (const client of playingList) {
      data.roomList.push({
        gameId: client.data.game.id,
        playerAccount: client.data.user.account,
      });
    }

    return { event: 'roomList', data };
  }

  @SubscribeMessage('roomList')
  async onRoomList(client: MyWebSocket): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    return this.roomListEvent();
  }

  // client send: {"event":"board","data":"{ gameId: "xxx" }"}
  @SubscribeMessage('gameInfo')
  async onGameInfo(
    client: MyWebSocket,
    data: any,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = data;

    await this.joinRoom(input.gameId, client);

    return this.gameInfo(input.gameId);
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  async onOpen(client: MyWebSocket, data: any): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = data;
    if ((await this.isPlayer(input.gameId, client.data.user.id)) === false) {
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
  async onFlag(client: MyWebSocket, data: any): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = data;
    if ((await this.isPlayer(input.gameId, client.data.user.id)) === false) {
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
    data: any,
  ): Promise<WsResponse<object>> {
    if (this.checkAuth(client) === false) {
      return { event: 'error', data: {} };
    }

    const input = data;
    if ((await this.isPlayer(input.gameId, client.data.user.id)) === false) {
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

    this.broadcastByGame(gameId, event);
    return event;
  }

  broadcast(event) {
    for (const client of this.clientList) {
      client.emit(event.event, event.data);
    }
  }

  broadcastByGame(gameId: string, event) {
    const host = this.clientList.filter((c) => c.data.game.id === gameId);

    for (const client of host[0].data.game.viewerList) {
      client.emit(event.event, event.data);
    }
  }

  updateRoomList() {
    const event = this.roomListEvent();
    this.broadcast(event);
  }

  async joinRoom(gameId: string, client: MyWebSocket) {
    this.leaveRoom(client);

    if (await this.isPlayer(gameId, client.data.user.id)) {
      client.data.game.isPlaying = true;
      client.data.game.id = gameId;
    } else {
      const host = this.clientList.filter((c) => c.data.game.id === gameId)[0];
      host.data.game.viewerList.push(client);
      client.data.game.isViewer = true;
      client.data.game.watchUserId = host.data.user.id;
    }

    this.updateRoomList();
  }

  private leaveRoom(client: MyWebSocket) {
    if (client.data.game.isPlaying) {
      client.data.game.isPlaying = false;
      client.data.game.id = '';
    }

    if (client.data.game.isViewer) {
      const host = this.clientList.filter(
        (c) => c.data.user.id === client.data.game.watchUserId,
      )[0];

      const index = host.data.game.viewerList.indexOf(client, 0);
      if (index > -1) {
        host.data.game.viewerList.splice(index, 1);
      }
      client.data.game.isViewer = false;
      client.data.game.watchUserId = -1;
    }

    this.updateRoomList();
  }
}
