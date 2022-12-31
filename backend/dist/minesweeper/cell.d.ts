export declare enum CellState {
    unopened = 0,
    opened = 1,
    flagged = 2
}
export declare class Cell {
    x: number;
    y: number;
    mine: boolean;
    number: number;
    state: CellState;
    constructor(x: number, y: number);
}
