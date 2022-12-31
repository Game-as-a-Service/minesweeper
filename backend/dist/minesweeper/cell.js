"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = exports.CellState = void 0;
var CellState;
(function (CellState) {
    CellState[CellState["unopened"] = 0] = "unopened";
    CellState[CellState["opened"] = 1] = "opened";
    CellState[CellState["flagged"] = 2] = "flagged";
})(CellState = exports.CellState || (exports.CellState = {}));
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.mine = false;
        this.number = 0;
        this.state = CellState.unopened;
    }
}
exports.Cell = Cell;
//# sourceMappingURL=cell.js.map