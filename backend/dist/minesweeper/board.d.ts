import { Cell } from './cell';
declare class Size {
    x: number;
    y: number;
}
export declare class Board {
    cells: Cell[][];
    size: Size;
    unopenedCells: number;
    start(): void;
    open(x: number, y: number): void;
    flag(x: number, y: number): void;
    display(): void;
    private generateCells;
    private generateMine;
    private generateNumber;
    private calculateNumber;
}
export {};
