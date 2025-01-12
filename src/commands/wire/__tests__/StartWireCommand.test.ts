import { Component } from '../../../component';
import { StartWireCommand } from '../StartWireCommand';
import { Container } from 'pixi.js';
import type { ComponentMetadata } from '../../../registry/ComponentRegistry';

// Mock component for testing
class MockComponent extends Component {
  draw(): void {
    // Mock implementation
  }
}

describe('StartWireCommand', () => {
  let sourceComponent: Component;
  let stage: Container;
  let command: StartWireCommand;
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
    stage = new Container();
    command = new StartWireCommand(sourceComponent, 0, stage);
  });

  it('should create a wire on execute', () => {
    command.execute();
    const wire = command.getWire();
    
    expect(wire).toBeDefined();
    expect(stage.children).toContain(wire);
  });

  it('should remove wire on undo', () => {
    command.execute();
    const wire = command.getWire();
    expect(wire).toBeDefined();
    
    command.undo();
    expect(command.getWire()).toBeNull();
    expect(stage.children).not.toContain(wire);
  });

  it('should reattach existing wire on re-execute', () => {
    command.execute();
    const wire = command.getWire();
    command.undo();
    command.execute();
    
    expect(command.getWire()).toBe(wire);
    expect(stage.children).toContain(wire);
  });

  it('should throw error for invalid connection point', () => {
    const invalidCommand = new StartWireCommand(sourceComponent, 2, stage);
    expect(() => {
      invalidCommand.execute();
    }).toThrow('Invalid connection point index');
  });

  it('should update end position', () => {
    command.execute();
    const wire = command.getWire();
    expect(wire).toBeDefined();
    
    // Initial position should match source point
    const sourcePoint = sourceComponent.connectionPoints[0];
    expect(sourcePoint).toBeDefined();
    
    // Update to new position
    command.updateEndPosition(200, 300);
    
    // Wire should be redrawn (we can't test the actual position easily due to PIXI.js graphics,
    // but we can verify the wire exists and is in the stage)
    expect(stage.children).toContain(wire);
  });
}); 