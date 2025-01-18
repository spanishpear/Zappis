import { Circuit } from '../circuit';
import type { Component } from '../component';
import { Switch } from '../switch';
import { Battery } from '../battery';
import { LED } from '../LED';
import { SmartWire } from '../routing/SmartWire';
import { Point } from 'pixi.js';

interface CircuitConfig {
  // Ideally we would have a generic type for the components
  // but we also need the type to be able to create the components
  // maybe something like zod would work, but not sure it's worth the effort
  components: {
    // id is the unique identifier for the component - e.g. "battery1"
    id: string;
    type: string;
    x: number;
    y: number;
    // for batteries
    voltage?: number;
    // for switches
    isEnabled?: boolean;
  }[];
  wires: {
    start: {
      component: string;
      index: number;
    };
    end: {
      component: string;
      index: number;
    };
    waypoints?: { x: number; y: number }[];
  }[];
}

/*
 * Loads a circuit configuration from a JSON file
 */
export async function loadCircuitConfig(url: string): Promise<CircuitConfig> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load circuit configuration');
  }
  return response.json();
}

export const circuitFromConfig = async (config: CircuitConfig) => {
  const circuit = new Circuit();
  const componentsMap = new Map<string, Component>();

  // Create components and populate the map
  for (const compConfig of config.components) {
    let component: Component;
    switch (compConfig.type) {
      case 'Battery':
        component = new Battery(
          compConfig.x,
          compConfig.y,
          compConfig.voltage ?? 1.5,
        );
        break;
      case 'Switch':
        component = new Switch(
          compConfig.x,
          compConfig.y,
          compConfig.isEnabled,
        );
        break;
      case 'LED':
        component = new LED(compConfig.x, compConfig.y);
        break;
      default:
        throw new Error(`Unknown component type: ${compConfig.type}`);
    }
    componentsMap.set(compConfig.id, component);
    circuit.addElement(component);
  }

  // Create wires using the components map
  for (const wireConfig of config.wires) {
    const startComponent = componentsMap.get(wireConfig.start.component);
    const endComponent = componentsMap.get(wireConfig.end.component);

    if (!startComponent || !endComponent) {
      throw new Error(
        `Invalid wire configuration: startComponent or endComponent not found for wire ${JSON.stringify(wireConfig)}`,
      );
    }

    const wire = new SmartWire(
      startComponent,
      endComponent,
      wireConfig.start.index,
      wireConfig.end.index,
    );

    // Add waypoints if they exist
    if (wireConfig.waypoints) {
      const points = wireConfig.waypoints.map(wp => new Point(wp.x, wp.y));
      wire.setWaypoints(points);
    }

    circuit.addElement(wire);
  }
  return circuit;
};
