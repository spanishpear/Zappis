import { Graphics } from 'pixi.js';
import { DebugState } from './debug';

export interface ConnectionPoint {
  x: number;
  y: number;
  connectedComponent?: Component | null;
}

export abstract class Component extends Graphics {
  connectionPoints: ConnectionPoint[] = [];
  coordinates: { x: number; y: number };

  constructor(
    coordinates = { x: 0, y: 0 },
    connectionPoints: ConnectionPoint[] = [],
  ) {
    super();
    this.coordinates = coordinates;
    this.connectionPoints = connectionPoints;
  }

  getX(): number {
    return this.coordinates.x;
  }

  getY(): number {
    return this.coordinates.y;
  }

  abstract draw(): void;

  // Connect a wire to a specific connection point by index
  connectTo(
    connectionIndex: number,
    component: Component,
    otherConnectionIndex: number,
  ) {
    if (!this.connectionPoints[connectionIndex]) {
      throw new Error('Invalid connection index');
    }
    if (!component.connectionPoints[otherConnectionIndex]) {
      throw new Error('Invalid other connection index');
    }

    this.connectionPoints[connectionIndex].connectedComponent = component;
    component.connectionPoints[otherConnectionIndex].connectedComponent = this;
  }

  setConnectionPoints(points: ConnectionPoint[]) {
    this.connectionPoints = points;
  }

  drawConnectionPoints() {
    if (DebugState.enabled) {
      this.connectionPoints?.forEach((point) => {
        const debugPoint = new Graphics();
        //white color
        debugPoint.circle(point.x, point.y, 5);
        debugPoint.fill(0xffffff);
        globalThis.app.stage.addChild(debugPoint);
      });
    }
  }
}
