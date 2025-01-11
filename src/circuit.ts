import { Battery } from './battery';
import type { Component } from './component';

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
    this.elements.forEach((element) => element.draw());
  }

  getIsCircuitClosed(): boolean {
    return this.isCircuitClosed;
  }

  calculateIsCircuitClosed(): void {
    console.groupCollapsed('isCircuitClosed tracing');
    this.currentPath = []; // Reset path
    
    // Find the battery in our circuit
    const battery = this.elements.find(element => element instanceof Battery);
    if (!battery) {
      console.groupEnd();
      this.isCircuitClosed = false;
      return; // Exit early if no battery is found
    }

    // Start from battery's positive terminal (index 1)
    const visited = new Set<Component>();
    const stack: PathNode[] = [{
      component: battery,
      connectionIndex: 1  // Positive terminal
    }];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      console.log(current.component);
      visited.add(current.component);
      this.currentPath.push(current);
      
      // Get the current connection point
      const connectionPoint = current.component.connectionPoints[current.connectionIndex];
      console.log(connectionPoint?.connectedComponent);
      
      // If we reached battery's negative terminal, circuit is closed
      if (current.component === battery && current.connectionIndex === 0) {
        console.groupEnd();
        this.isCircuitClosed = true;
        return;
      }
    
      // Add connected components to stack
      if (connectionPoint?.connectedComponent && (!visited.has(connectionPoint.connectedComponent) || connectionPoint.connectedComponent instanceof Battery)) {
        // Find which connection point we're connected to on the other component
        const otherComponent = connectionPoint.connectedComponent;
        const otherConnectionIndex = otherComponent.connectionPoints.findIndex(
          point => point.connectedComponent === current.component
        );
        console.log(`adding '${otherComponent.constructor.name}' connection index ${otherConnectionIndex} to stack`);
        
        if (otherComponent instanceof Battery) {
          stack.push({
            component: otherComponent,
            connectionIndex: 0
          });
        } else {
          stack.push({
            component: otherComponent,
            connectionIndex: otherConnectionIndex === 0 ? 1 : 0  // Toggle to other connection point
          });
        }
      }
    }

    console.groupEnd();
    this.currentPath = []; // Clear path if circuit is not closed
    this.isCircuitClosed = false;
  }

  getCircuitPath(): PathNode[] {
    return this.currentPath;
  }
}
