import { Component } from './component';
import type { GridSystem } from './gridSystem';

interface Point {
  x: number;
  y: number;
}

export class Wire extends Component {
  private segments: Point[] = [];
  
  constructor(
    startComponent: Component,
    endComponent: Component,
    startIdx: number,
    endIdx: number,
    width = 15,
    color = '0x000000',
  ) {
    super();

    const start = startComponent.connectionPoints[startIdx];
    const end = endComponent.connectionPoints[endIdx];
    
    // Calculate path using Manhattan routing
    this.segments = this.calculatePath(
      { x: start?.x ?? 0, y: start?.y ?? 0 },
      { x: end?.x ?? 0, y: end?.y ?? 0 },
      globalThis.gridSystem
    );

    // Draw all segments
    this.drawSegments(width, color);

    // Establish the connection
    startComponent.connectTo(startIdx, endComponent, endIdx);
  }

  private calculatePath(start: Point, end: Point, grid: GridSystem): Point[] {
    const points: Point[] = [start];
    
    // Calculate midpoint for vertical routing
    const midX = start.x;
    const midY = end.y;
    
    // Add intermediate points if needed
    if (Math.abs(start.y - end.y) > grid.getGridSize()) {
      points.push({ x: midX, y: midY });
    }
    
    points.push(end);
    
    // Mark path as occupied in grid
    // biome-ignore lint/complexity/noForEach: <explanation>
    points.forEach(point => grid.occupy(point.x, point.y));
    
    return points;
  }

  private drawSegments(width: number, color: string): void {
    this.clear();
    
    for (let i = 0; i < this.segments.length - 1; i++) {
      const current = this.segments[i];
      const next = this.segments[i + 1];
      
      this.moveTo(current?.x ?? 0, current?.y ?? 0);
      this.lineTo(next?.x ?? 0, next?.y ?? 0);
    }
    
    this.stroke({ width, color });
  }

  draw(): void {
    globalThis.app.stage.addChild(this);
  }
}
