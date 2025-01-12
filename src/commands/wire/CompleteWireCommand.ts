import type { Component } from '../../component';
import { Command } from '../Command';
import { SmartWire } from '../../routing/SmartWire';
import type { Container } from 'pixi.js';

/**
 * Command to complete a wire connection between two components.
 * This replaces the temporary wire created by StartWireCommand with a proper connection.
 */
export class CompleteWireCommand extends Command {
  private wire: SmartWire | null = null;
  private oldWire: SmartWire | null = null;

  constructor(
    private sourceComponent: Component,
    private sourceConnectionIndex: number,
    private targetComponent: Component,
    private targetConnectionIndex: number,
    private stage: Container,
    oldWire?: SmartWire | null
  ) {
    super();
    this.oldWire = oldWire ?? null;
  }

  execute(): void {
    // Remove the old temporary wire if it exists
    if (this.oldWire) {
      this.stage.removeChild(this.oldWire);
    }

    // If we already created a wire, just reattach it
    if (this.wire) {
      this.stage.addChild(this.wire);
      return;
    }

    // Validate connection points
    const sourcePoint = this.sourceComponent.connectionPoints[this.sourceConnectionIndex];
    const targetPoint = this.targetComponent.connectionPoints[this.targetConnectionIndex];

    if (!sourcePoint || !targetPoint) {
      throw new Error('Invalid connection point index');
    }

    // Check if target point is already connected
    if (targetPoint.connectedComponent) {
      throw new Error('Target connection point is already in use');
    }

    // Create new wire between components
    this.wire = new SmartWire(
      this.sourceComponent,
      this.targetComponent,
      this.sourceConnectionIndex,
      this.targetConnectionIndex
    );
    
    // Add wire to stage
    this.stage.addChild(this.wire);
  }

  undo(): void {
    if (this.wire) {
      this.stage.removeChild(this.wire);
    }
    if (this.oldWire) {
      this.stage.addChild(this.oldWire);
    }
  }

  getWire(): SmartWire | null {
    return this.wire;
  }
} 