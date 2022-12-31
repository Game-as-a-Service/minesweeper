"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const ws_1 = require("ws");
const app_service_1 = require("./app.service");
let WsGateway = class WsGateway {
    constructor(appService) {
        this.appService = appService;
    }
    onEvent(client, data) {
        return (0, rxjs_1.from)([1, 2, 3]).pipe((0, operators_1.map)(item => ({ event: 'events', data: item })));
    }
    onBoard(client, data) {
        data = this.appService.minesweeper.cells;
        return { event: 'cellsInfo', data };
    }
    onOpen(client, data) {
        let input = JSON.parse(data);
        this.appService.minesweeper.open(input.x, input.y);
        let output = this.appService.minesweeper.cells;
        return { event: 'cellsInfo', data: output };
    }
    onStart(client, data) {
        this.appService.minesweeper.start();
        let output = this.appService.minesweeper.cells;
        return { event: 'cellsInfo', data: output };
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof ws_1.Server !== "undefined" && ws_1.Server) === "function" ? _a : Object)
], WsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], WsGateway.prototype, "onEvent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('cellsInfo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Object)
], WsGateway.prototype, "onBoard", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('open'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Object)
], WsGateway.prototype, "onOpen", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Object)
], WsGateway.prototype, "onStart", null);
WsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], WsGateway);
exports.WsGateway = WsGateway;
//# sourceMappingURL=app.gateway.js.map