import { Graphics } from 'pixi.js';
import { DebugState } from './debug';
import type { ComponentMetadata } from './registry/ComponentRegistry';

export interface ConnectionPoint {
  x: number;
  y: number;
  connectedComponent: Component | null;
  label?: string;
}

export interface ComponentProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: unknown;
}

export abstract class Component extends Graphics {
  protected metadata: ComponentMetadata;
  protected properties: ComponentProperties;
  connectionPoints: ConnectionPoint[] = [];

  constructor(
    metadata: ComponentMetadata,
    properties: Partial<ComponentProperties> = {}
  ) {
    super();

    if (!metadata) {
      throw new Error('Component metadata is required');
    }

    if (typeof metadata.width !== 'number' || typeof metadata.height !== 'number') {
      throw new Error('Component metadata must include width and height');
    }

    this.metadata = metadata;
    
    // Initialize properties with defaults
    this.properties = {
      x: properties.x ?? 0,
      y: properties.y ?? 0,
      width: properties.width ?? metadata.width,
      height: properties.height ?? metadata.height,
      ...metadata.defaultProperties,
      ...properties
    };

    // Initialize connection points from metadata
    // Ensure connectionPoints exists and is an array
    const connectionPoints = Array.isArray(metadata.connectionPoints) 
      ? metadata.connectionPoints 
      : [];

    this.connectionPoints = connectionPoints.map(point => ({
      x: this.properties.x + point.relativeX,
      y: this.properties.y + point.relativeY,
      label: point.label,
      connectedComponent: null
    }));

    // Set initial position
    this.position.set(this.properties.x, this.properties.y);
  }

  getX(): number {
    return this.properties.x;
  }

  getY(): number {
    return this.properties.y;
  }

  getProperty<T>(key: string): T {
    return this.properties[key] as T;
  }

  setProperty<T>(key: string, value: T): void {
    this.properties[key] = value;
    this.draw(); // Redraw component when properties change
  }

  abstract draw(): void;

  // Connect a wire to a specific connection point by index
  connectTo(
    connectionIndex: number,
    component: Component,
    otherConnectionIndex: number,
  ): void {
    const connectionPoint = this.connectionPoints[connectionIndex];
    const otherConnectionPoint = component.connectionPoints[otherConnectionIndex];

    if (!connectionPoint) {
      throw new Error(`Invalid connection index ${connectionIndex} for component type ${this.metadata.type}`);
    }
    if (!otherConnectionPoint) {
      throw new Error(`Invalid connection index ${otherConnectionIndex} for component type ${component.metadata.type}`);
    }

    connectionPoint.connectedComponent = component;
    otherConnectionPoint.connectedComponent = this;
  }

  disconnect(connectionIndex: number): void {
    const point = this.connectionPoints[connectionIndex];
    if (!point) {
      throw new Error(`Invalid connection index ${connectionIndex}`);
    }

    if (point.connectedComponent) {
      // Find and clear the corresponding connection point on the other component
      const otherComponent = point.connectedComponent;
      const otherIndex = otherComponent.connectionPoints.findIndex(
        p => p.connectedComponent === this
      );
      if (otherIndex !== -1) {
        const otherPoint = otherComponent.connectionPoints[otherIndex];
        if (otherPoint) {
          otherPoint.connectedComponent = null;
        }
      }
    }
    point.connectedComponent = null;
  }

  drawConnectionPoints(): void {
    if (DebugState.enabled) {
      this.connectionPoints.forEach((point) => {
        const debugPoint = new Graphics();
        debugPoint.circle(point.x - this.properties.x, point.y - this.properties.y, 5);
        debugPoint.fill(point.connectedComponent ? 0x00ff00 : 0xffffff);
        this.addChild(debugPoint);
      });
    }
  }

  // Helper method to update connection point positions when component moves
  protected updateConnectionPoints(): void {
    if (!Array.isArray(this.metadata.connectionPoints)) {
      return;
    }

    this.metadata.connectionPoints.forEach((metadata, index) => {
      const point = this.connectionPoints[index];
      if (point) {
        point.x = this.properties.x + metadata.relativeX;
        point.y = this.properties.y + metadata.relativeY;
      }
    });
  }
}
