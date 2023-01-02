import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';
import { AppService } from './app.service';

@WebSocketGateway()
export class WsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly appService: AppService) {}

  // client send: {"event":"events","data":""}
  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  // client send: {"event":"board","data":""}
  @SubscribeMessage('gameInfo')
  onBoard(client: any, data: any): WsResponse<object> {
    return this.gameInfo();
  }

  // client send: {"event":"open","data":"{x: 0, y: 1}"}
  @SubscribeMessage('open')
  onOpen(client: any, data: string): WsResponse<object> {
    const input = JSON.parse(data);
    // console.log(`open: ${input}`);
    // console.log(`miinesweeper: ${this.appService.minesweeper.unopenedCells}`)
    this.appService.minesweeper.open(input.x, input.y);

    return this.gameInfo();
  }

  // client send: {"event":"flag","data":"{x: 0, y: 1}"}
  @SubscribeMessage('flag')
  onFlag(client: any, data: string): WsResponse<object> {
    const input = JSON.parse(data);
    this.appService.minesweeper.flag(input.x, input.y);

    return this.gameInfo();
  }

  // client send: {"event":"open","data":""}
  @SubscribeMessage('start')
  onStart(client: any, data: string): WsResponse<object> {
    this.appService.minesweeper.start();

    return this.gameInfo();
  }

  gameInfo() {
    let data = {
      gameState: this.appService.minesweeper.gameState,
      cells: this.appService.minesweeper.cells
    }

    return { event: 'gameInfo', data };
  }
}
