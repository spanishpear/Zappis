export class GridSystem {
  private grid: boolean[][];
  private gridSize = 10; // Size of each grid cell
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = Math.ceil(width / this.gridSize);
    this.height = Math.ceil(height / this.gridSize);
    this.grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(false));
  }

  toGridCoord(pixel: number): number {
    return Math.floor(pixel / this.gridSize);
  }

  toPixelCoord(grid: number): number {
    return grid * this.gridSize + this.gridSize / 2;
  }

  isOccupied(x: number, y: number): boolean {
    const gridX = this.toGridCoord(x);
    const gridY = this.toGridCoord(y);
    return this.grid[gridY]?.[gridX] ?? true;
  }

  occupy(x: number, y: number): void {
    const gridX = this.toGridCoord(x);
    const gridY = this.toGridCoord(y);
    if (this.grid[gridY]?.[gridX] !== undefined) {
      this.grid[gridY][gridX] = true;
    }
  }

  public getGridSize(): number {
    return this.gridSize;
  }
}
