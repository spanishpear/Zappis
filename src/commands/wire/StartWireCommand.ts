import { Component } from '../../component';
import { Command } from '../Command';
import { SmartWire } from '../../routing/SmartWire';
import type { Container } from 'pixi.js';

/**
 * Command to create a temporary wire starting from a component's connection point.
 * This wire will be replaced by a proper SmartWire when the connection is completed.
 */
export class StartWireCommand extends Command {
  private wire: SmartWire | null = null;
  private tempEndComponent: Component;

  constructor(
    private sourceComponent: Component,
    private connectionPointIndex: number,
    private stage: Container
  ) {
    super();
    
    // Create a temporary invisible component for the unconnected end
    this.tempEndComponent = new class extends Component {
      draw(): void {
        // No-op - this is a temporary component
      }
    }({
      type: 'temp-end',
      displayName: 'Temporary End',
      width: 0,
      height: 0,
      connectionPoints: [{
        relativeX: 0,
        relativeY: 0
      }]
    });
  }

  execute(): void {
    if (this.wire) {
      // Wire already exists, reattach it
      this.stage.addChild(this.wire);
      return;
    }

    const sourcePoint = this.sourceComponent.connectionPoints[this.connectionPointIndex];
    if (!sourcePoint) {
      throw new Error('Invalid connection point index');
    }

    // Position the temporary end component at the same point initially
    this.tempEndComponent.position.set(sourcePoint.x, sourcePoint.y);

    // Create new wire from source to temporary end
    this.wire = new SmartWire(
      this.sourceComponent,
      this.tempEndComponent,
      this.connectionPointIndex,
      0
    );
    
    // Add wire to stage
    this.stage.addChild(this.wire);
  }

  undo(): void {
    if (this.wire) {
      this.stage.removeChild(this.wire);
      this.wire = null;
    }
  }

  getWire(): SmartWire | null {
    return this.wire;
  }

  /**
   * Update the temporary end position as the user moves the mouse
   */
  updateEndPosition(x: number, y: number): void {
    if (this.tempEndComponent) {
      this.tempEndComponent.position.set(x, y);
      this.wire?.draw(); // Redraw wire with new end position
    }
  }
} 