import type { Component } from '../component';
import type { ConnectionPoint } from '../component';

export interface ConnectionPointMetadata {
  relativeX: number;  // Relative position to component center
  relativeY: number;
  label?: string;     // Optional label for the connection point
}

export interface ComponentMetadata {
  type: string;       // Unique identifier for the component type
  displayName: string;
  width: number;      // Default width of the component
  height: number;     // Default height of the component
  connectionPoints: ConnectionPointMetadata[];
  defaultProperties?: Record<string, unknown>;
}

export type ComponentFactory = (x: number, y: number) => Component;

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentMetadata> = new Map();
  private factories: Map<string, ComponentFactory> = new Map();

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  registerComponent(
    metadata: ComponentMetadata,
    factory: ComponentFactory
  ): void {
    if (this.components.has(metadata.type)) {
      throw new Error(`Component type ${metadata.type} is already registered`);
    }
    this.components.set(metadata.type, metadata);
    this.factories.set(metadata.type, factory);
  }

  createComponent(type: string, x: number, y: number): Component {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for component type: ${type}`);
    }
    return factory(x, y);
  }

  getMetadata(type: string): ComponentMetadata {
    const metadata = this.components.get(type);
    if (!metadata) {
      throw new Error(`No metadata found for component type: ${type}`);
    }
    return metadata;
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys());
  }
} 