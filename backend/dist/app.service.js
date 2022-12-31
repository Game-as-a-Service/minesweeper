"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
<<<<<<< HEAD
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const board_1 = require("./minesweeper/board");
let AppService = class AppService {
    constructor() {
        this.minesweeper = new board_1.Board();
        this.minesweeper.start();
    }
=======
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
>>>>>>> 96349e5 (init: 建立後端專案)
    getHello() {
        return 'Hello World!';
    }
};
AppService = __decorate([
<<<<<<< HEAD
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
=======
    (0, common_1.Injectable)()
>>>>>>> 96349e5 (init: 建立後端專案)
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map