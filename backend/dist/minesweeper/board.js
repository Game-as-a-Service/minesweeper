"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
const cell_1 = require("./cell");
class Size {
}
class Board {
    start() {
        this.size = new Size();
        this.size.x = 5;
        this.size.y = 3;
        this.generateCells();
        this.generateMine();
        this.generateNumber();
        console.log(`start`);
    }
    open(x, y) {
        console.log(`x:${x}, y:${y}`);
        const cell = this.cells[y][x];
        if (cell === undefined) {
            return;
        }
        if (cell.state !== cell_1.CellState.unopened) {
            return;
        }
        cell.state = cell_1.CellState.opened;
        this.unopenedCells--;
        if (cell.mine) {
            console.log('you lose');
        }
        if (this.unopenedCells === 0) {
            console.log('you win');
        }
    }
    flag(x, y) {
        const cell = this.cells[y][x];
        if (cell === undefined) {
            return;
        }
        if (cell.state !== cell_1.CellState.unopened) {
            return;
        }
        cell.state = cell_1.CellState.flagged;
    }
    display() {
        for (let y = 0; y < this.size.y; y++) {
            let line = '';
            for (let x = 0; x < this.size.x; x++) {
                const cell = this.cells[y][x];
                let symbol;
                if (cell.state === cell_1.CellState.unopened) {
                    symbol = '.';
                }
                else if (cell.state === cell_1.CellState.flagged) {
                    symbol = '!';
                }
                else {
                    symbol = cell.mine ? 'X' : cell.number;
                }
                line = line + symbol;
            }
            console.log(`${line}`);
        }
        console.log('---------');
    }
    generateCells() {
        this.cells = [];
        for (let y = 0; y < this.size.y; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.size.x; x++) {
                this.cells[y][x] = new cell_1.Cell(x, y);
            }
        }
    }
    generateMine() {
        this.cells[0][2].mine = true;
        this.cells[0][3].mine = true;
        this.cells[1][1].mine = true;
        this.cells[2][4].mine = true;
        this.unopenedCells = this.size.x * this.size.y;
        this.unopenedCells = this.unopenedCells - 4;
    }
    generateNumber() {
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                this.calculateNumber(x, y);
            }
        }
    }
    calculateNumber(x, y) {
        let number = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (x + dx >= 0 &&
                    y + dy >= 0 &&
                    x + dx < this.size.x &&
                    y + dy < this.size.y) {
                    const cell = this.cells[y + dy][x + dx];
                    if (cell && cell.mine) {
                        number++;
                    }
                }
            }
        }
        this.cells[y][x].number = number;
    }
}
exports.Board = Board;
//# sourceMappingURL=board.js.map