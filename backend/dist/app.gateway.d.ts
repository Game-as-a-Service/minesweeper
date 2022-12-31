import { WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server } from 'ws';
import { AppService } from './app.service';
export declare class WsGateway {
    private readonly appService;
    server: Server;
    constructor(appService: AppService);
    onEvent(client: any, data: any): Observable<WsResponse<number>>;
    onBoard(client: any, data: any): WsResponse<string>;
    onOpen(client: any, data: string): WsResponse<object>;
    onStart(client: any, data: string): WsResponse<object>;
}
