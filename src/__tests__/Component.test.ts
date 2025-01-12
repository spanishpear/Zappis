import { Component } from '../component';
import type { ComponentMetadata } from '../registry/ComponentRegistry';

// Create a concrete implementation of Component for testing
class TestComponent extends Component {
  draw(): void {
    // Test implementation
    this.clear();
    this.beginFill(0xff0000);
    this.drawRect(0, 0, this.properties.width, this.properties.height);
    this.endFill();
  }
}

describe('Component', () => {
  let testMetadata: ComponentMetadata;
  let component: TestComponent;

  beforeEach(() => {
    testMetadata = {
      type: 'test-component',
      displayName: 'Test Component',
      width: 100,
      height: 50,
      connectionPoints: [
        { relativeX: 0, relativeY: 25, label: 'left' },
        { relativeX: 100, relativeY: 25, label: 'right' },
      ],
    };
    component = new TestComponent(testMetadata);
  });

  it('should throw error when metadata is undefined', () => {
    expect(() => {
      // @ts-expect-error Testing runtime behavior with invalid input
      new TestComponent(undefined);
    }).toThrow('Component metadata is required');
  });

  it('should throw error when metadata is missing required properties', () => {
    const invalidMetadata = {
      type: 'test-component',
      displayName: 'Test Component',
      // Missing width and height
      connectionPoints: []
    };

    expect(() => {
      // @ts-expect-error Testing runtime behavior with invalid input
      new TestComponent(invalidMetadata);
    }).toThrow('Component metadata must include width and height');
  });

  it('should handle empty connection points array', () => {
    const metadataWithNoConnections: ComponentMetadata = {
      type: 'test-component',
      displayName: 'Test Component',
      width: 100,
      height: 50,
      connectionPoints: [],
    };

    const componentWithNoConnections = new TestComponent(metadataWithNoConnections);
    expect(componentWithNoConnections.connectionPoints).toHaveLength(0);
  });

  it('should initialize with default properties', () => {
    expect(component.getX()).toBe(0);
    expect(component.getY()).toBe(0);
    expect(component.getProperty('width')).toBe(100);
    expect(component.getProperty('height')).toBe(50);
  });

  it('should initialize with custom properties', () => {
    const customComponent = new TestComponent(testMetadata, {
      x: 10,
      y: 20,
      width: 200,
      height: 100,
    });

    expect(customComponent.getX()).toBe(10);
    expect(customComponent.getY()).toBe(20);
    expect(customComponent.getProperty('width')).toBe(200);
    expect(customComponent.getProperty('height')).toBe(100);
  });

  it('should initialize connection points correctly', () => {
    expect(component.connectionPoints).toHaveLength(2);
    const point0 = component.connectionPoints[0];
    const point1 = component.connectionPoints[1];
    
    expect(point0).toBeDefined();
    expect(point1).toBeDefined();
    
    expect(point0).toEqual({
      x: 0,
      y: 25,
      label: 'left',
      connectedComponent: null,
    });
    expect(point1).toEqual({
      x: 100,
      y: 25,
      label: 'right',
      connectedComponent: null,
    });
  });

  it('should connect components correctly', () => {
    const component2 = new TestComponent(testMetadata);
    
    component.connectTo(0, component2, 1);
    
    const point0 = component.connectionPoints[0];
    const point1 = component2.connectionPoints[1];
    
    expect(point0).toBeDefined();
    expect(point1).toBeDefined();
    expect(point0?.connectedComponent).toBe(component2);
    expect(point1?.connectedComponent).toBe(component);
  });

  it('should throw error when connecting to invalid connection point', () => {
    const component2 = new TestComponent(testMetadata);
    
    expect(() => {
      component.connectTo(2, component2, 0);
    }).toThrow('Invalid connection index 2 for component type test-component');
    
    expect(() => {
      component.connectTo(0, component2, 2);
    }).toThrow('Invalid connection index 2 for component type test-component');
  });

  it('should disconnect components correctly', () => {
    const component2 = new TestComponent(testMetadata);
    
    component.connectTo(0, component2, 1);
    component.disconnect(0);
    
    const point0 = component.connectionPoints[0];
    const point1 = component2.connectionPoints[1];
    
    expect(point0).toBeDefined();
    expect(point1).toBeDefined();
    expect(point0?.connectedComponent).toBeNull();
    expect(point1?.connectedComponent).toBeNull();
  });

  it('should throw error when disconnecting invalid connection point', () => {
    expect(() => {
      component.disconnect(2);
    }).toThrow('Invalid connection index 2');
  });

  it('should update properties correctly', () => {
    component.setProperty('width', 150);
    expect(component.getProperty('width')).toBe(150);
  });
}); 