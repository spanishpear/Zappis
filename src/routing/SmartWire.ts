import { Component } from '../component';
import type { Port } from './types';
import { WireManager } from './WireManager';
import { Graphics, Point } from 'pixi.js';

export class SmartWire extends Component {
  private wireManager: WireManager;
  private startPort: Port;
  private endPort: Port;
  private strokeWidth: number;
  private color: string;

  constructor(
    startComponent: Component,
    endComponent: Component,
    startIdx: number,
    endIdx: number,
    strokeWidth = 20,
    color = '0x000000',
  ) {
    super();

    this.strokeWidth = strokeWidth;
    this.color = color;
    this.wireManager = new WireManager();

    // Create ports from connection points
    const start = startComponent.connectionPoints[startIdx];
    const end = endComponent.connectionPoints[endIdx];

    if (!start || !end) {
      throw new Error('Invalid connection points');
    }

    this.startPort = {
      id: `${startComponent.constructor.name}-${startIdx}`,
      position: new Point(start.x, start.y),
      direction: 'east', // TODO: Calculate based on component type/position
      type: 'output',
      component: startComponent,
    };

    this.endPort = {
      id: `${endComponent.constructor.name}-${endIdx}`,
      position: new Point(end.x, end.y),
      direction: 'west', // TODO: Calculate based on component type/position
      type: 'input',
      component: endComponent,
    };

    // Register ports with wire manager
    this.wireManager.registerPort(this.startPort);
    this.wireManager.registerPort(this.endPort);

    // Set up our own connection points
    this.connectionPoints = [
      {
        x: start.x,
        y: start.y,
        connectedComponent: startComponent,
      },
      {
        x: end.x,
        y: end.y,
        connectedComponent: endComponent,
      },
    ];

    // Establish the connection
    startComponent.connectTo(startIdx, endComponent, endIdx);
  }

  public addWaypoint(point: Point): void {
    this.wireManager.addWaypoint(point);
  }

  public setWaypoints(points: Point[]): void {
    this.wireManager.setWaypoints(points);
  }

  override draw(): void {
    this.clear();

    // Calculate route
    const wire = this.wireManager.calculateRoute(this.startPort, this.endPort);

    // Draw segments
    wire.path.forEach((segment) => {
      const start = segment.start.position;
      const end = segment.end.position;

      this.moveTo(start.x, start.y);
      this.lineTo(end.x, end.y);
    });

    this.stroke({ width: this.strokeWidth, color: this.color });
    globalThis.app.stage.addChild(this);
  }

  getSegments() {
    const wire = this.wireManager.calculateRoute(this.startPort, this.endPort);
    return wire.path.map((segment) => ({
      x: segment.start.position.x,
      y: segment.start.position.y,
    }));
  }
}
