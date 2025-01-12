import { Component } from '../../../component';
import { CompleteWireCommand } from '../CompleteWireCommand';
import { SmartWire } from '../../../routing/SmartWire';
import { Container } from 'pixi.js';
import type { ComponentMetadata } from '../../../registry/ComponentRegistry';

// Mock component for testing
class MockComponent extends Component {
  draw(): void {
    // Mock implementation
  }
}

describe('CompleteWireCommand', () => {
  let sourceComponent: Component;
  let targetComponent: Component;
  let stage: Container;
  let command: CompleteWireCommand;
  let mockMetadata: ComponentMetadata;

  beforeEach(() => {
    mockMetadata = {
      type: 'mock-component',
      displayName: 'Mock Component',
      width: 100,
      height: 50,
      connectionPoints: [
        { relativeX: 0, relativeY: 25 },
        { relativeX: 100, relativeY: 25 },
      ],
    };

    sourceComponent = new MockComponent(mockMetadata);
    targetComponent = new MockComponent(mockMetadata);
    stage = new Container();
    command = new CompleteWireCommand(
      sourceComponent,
      0,
      targetComponent,
      1,
      stage
    );
  });

  it('should create a wire between components on execute', () => {
    command.execute();
    const wire = command.getWire();
    
    expect(wire).toBeDefined();
    expect(stage.children).toContain(wire);
    
    // Check connections are established
    expect(sourceComponent.connectionPoints[0]?.connectedComponent).toBe(targetComponent);
    expect(targetComponent.connectionPoints[1]?.connectedComponent).toBe(sourceComponent);
  });

  it('should remove old wire and create new connection', () => {
    // Create a temporary wire first
    const oldWire = new SmartWire(
      sourceComponent,
      new MockComponent(mockMetadata), // Temporary component
      0,
      0
    );
    stage.addChild(oldWire);

    const commandWithOldWire = new CompleteWireCommand(
      sourceComponent,
      0,
      targetComponent,
      1,
      stage,
      oldWire
    );

    commandWithOldWire.execute();
    
    expect(stage.children).not.toContain(oldWire);
    expect(stage.children).toContain(commandWithOldWire.getWire());
  });

  it('should throw error for invalid source connection point', () => {
    const invalidCommand = new CompleteWireCommand(
      sourceComponent,
      2, // Invalid index
      targetComponent,
      0,
      stage
    );

    expect(() => {
      invalidCommand.execute();
    }).toThrow('Invalid connection point index');
  });

  it('should throw error for invalid target connection point', () => {
    const invalidCommand = new CompleteWireCommand(
      sourceComponent,
      0,
      targetComponent,
      2, // Invalid index
      stage
    );

    expect(() => {
      invalidCommand.execute();
    }).toThrow('Invalid connection point index');
  });

  it('should throw error when target point is already connected', () => {
    // Connect the target point first
    const targetPoint = targetComponent.connectionPoints[1];
    if (targetPoint) {
      targetPoint.connectedComponent = new MockComponent(mockMetadata);
    }

    expect(() => {
      command.execute();
    }).toThrow('Target connection point is already in use');
  });

  it('should restore previous state on undo', () => {
    // Setup with old wire
    const oldWire = new SmartWire(
      sourceComponent,
      new MockComponent(mockMetadata),
      0,
      0
    );
    const commandWithOldWire = new CompleteWireCommand(
      sourceComponent,
      0,
      targetComponent,
      1,
      stage,
      oldWire
    );

    // Execute and then undo
    commandWithOldWire.execute();
    const newWire = commandWithOldWire.getWire();
    commandWithOldWire.undo();

    // Check that new wire is removed and old wire is restored
    expect(stage.children).not.toContain(newWire);
    expect(stage.children).toContain(oldWire);
  });

  it('should reattach existing wire on re-execute', () => {
    command.execute();
    const wire = command.getWire();
    command.undo();
    command.execute();
    
    expect(command.getWire()).toBe(wire);
    expect(stage.children).toContain(wire);
  });
}); 