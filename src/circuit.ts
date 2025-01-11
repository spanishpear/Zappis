import { Battery } from './battery';
import type { Component } from './component';
import { DebugState } from './debug';
import { Switch } from './switch';

interface PathNode {
  component: Component;
  connectionIndex: number;
}

export class Circuit {
  elements: Component[] = [];
  private currentPath: PathNode[] = [];
  private isCircuitClosed = false;
  /*
   * Basic constructor
   */
  constructor() {
    this.elements = [];
  }

  /*
   * Add an element to the circuit
   */
  addElement(element: Component) {
    this.elements.push(element);
  }

  /*
   * Draw all elements to the screen
   */
  drawElements() {
    this.elements.forEach((element) => {
      element.draw();
      if (DebugState.enabled) {
        element.drawConnectionPoints();
      }
    });
  }

  getIsCircuitClosed(): boolean {
    return this.isCircuitClosed;
  }

  calculateIsCircuitClosed(): boolean {
    DebugState.enabled && console.groupCollapsed('isCircuitClosed tracing');
    this.currentPath = []; // Reset path

    // Find the battery in our circuit
    const battery = this.elements.find((element) => element instanceof Battery);
    if (!battery) {
      DebugState.enabled && console.groupEnd();
      this.isCircuitClosed = false;
      return false; // Exit early if no battery is found
    }

    // Start from battery's positive terminal (index 1)
    const visited = new Set<Component>();
    const stack: PathNode[] = [
      {
        component: battery,
        connectionIndex: 1, // Positive terminal
      },
    ];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      DebugState.enabled && console.log(current.component);
      visited.add(current.component);
      this.currentPath.push(current);

      // Get the current connection point
      const connectionPoint =
        current.component.connectionPoints[current.connectionIndex];
      DebugState.enabled && console.log(connectionPoint?.connectedComponent);

      // If we reached battery's negative terminal, circuit is closed
      if (current.component === battery && current.connectionIndex === 0) {
        DebugState.enabled && console.groupEnd();
        this.isCircuitClosed = true;
        return true;
      }

      // If we reached a switch and it's not enabled, circuit is not closed
      if (current.component instanceof Switch) {
        if (current.component.isEnabled === false) {
          this.isCircuitClosed = false;
          DebugState.enabled && console.groupEnd();
          return false;
        }
      }

      // Add connected components to stack
      if (
        connectionPoint?.connectedComponent &&
        (!visited.has(connectionPoint.connectedComponent) ||
          connectionPoint.connectedComponent instanceof Battery)
      ) {
        // Find which connection point we're connected to on the other component
        const otherComponent = connectionPoint.connectedComponent;
        const otherConnectionIndex = otherComponent.connectionPoints.findIndex(
          (point) => point.connectedComponent === current.component,
        );
        DebugState.enabled &&
          console.log(
            `adding '${otherComponent.constructor.name}' connection index ${otherConnectionIndex} to stack`,
          );

        if (otherComponent instanceof Battery) {
          stack.push({
            component: otherComponent,
            connectionIndex: 0,
          });
        } else {
          stack.push({
            component: otherComponent,
            connectionIndex: otherConnectionIndex === 0 ? 1 : 0, // Toggle to other connection point
          });
        }
      }
    }

    DebugState.enabled && console.groupEnd();
    this.currentPath = []; // Clear path if circuit is not closed
    this.isCircuitClosed = false;
    return this.isCircuitClosed;
  }

  getCircuitPath(): PathNode[] {
    return this.currentPath;
  }
}
