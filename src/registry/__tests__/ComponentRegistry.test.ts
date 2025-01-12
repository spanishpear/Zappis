import { ComponentRegistry, type ComponentMetadata } from '../ComponentRegistry';
import { Component } from '../../component';

// Mock component for testing
class MockComponent extends Component {
  draw(): void {
    // Mock implementation
  }
}

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;
  let mockMetadata: ComponentMetadata;
  let mockFactory: (x: number, y: number) => Component;

  beforeEach(() => {
    registry = ComponentRegistry.getInstance();
    mockMetadata = {
      type: 'mock-component',
      displayName: 'Mock Component',
      width: 100,
      height: 50,
      connectionPoints: [
        { relativeX: 0, relativeY: 0 },
        { relativeX: 100, relativeY: 0 },
      ],
    };
    mockFactory = (x: number, y: number) => new MockComponent({ x, y });
  });

  it('should be a singleton', () => {
    const instance1 = ComponentRegistry.getInstance();
    const instance2 = ComponentRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register a component', () => {
    registry.registerComponent(mockMetadata, mockFactory);
    expect(registry.getRegisteredTypes()).toContain('mock-component');
  });

  it('should throw when registering duplicate component type', () => {
    registry.registerComponent(mockMetadata, mockFactory);
    expect(() => {
      registry.registerComponent(mockMetadata, mockFactory);
    }).toThrow('Component type mock-component is already registered');
  });

  it('should create component instance', () => {
    registry.registerComponent(mockMetadata, mockFactory);
    const component = registry.createComponent('mock-component', 10, 20);
    expect(component).toBeInstanceOf(MockComponent);
    expect(component.getX()).toBe(10);
    expect(component.getY()).toBe(20);
  });

  it('should throw when creating unregistered component', () => {
    expect(() => {
      registry.createComponent('non-existent', 0, 0);
    }).toThrow('No factory registered for component type: non-existent');
  });

  it('should return component metadata', () => {
    registry.registerComponent(mockMetadata, mockFactory);
    const metadata = registry.getMetadata('mock-component');
    expect(metadata).toEqual(mockMetadata);
  });

  it('should throw when getting metadata for unregistered component', () => {
    expect(() => {
      registry.getMetadata('non-existent');
    }).toThrow('No metadata found for component type: non-existent');
  });
}); 