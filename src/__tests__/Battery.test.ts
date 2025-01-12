import { Battery } from '../battery';
import { Sprite, Texture, Container } from 'pixi.js';
import type { Application } from 'pixi.js';

// Mock the window object with our test types
declare global {
  // Use interface merging to extend the NodeJS.Global interface
  namespace NodeJS {
    interface Global {
      sprites: Record<string, Texture>;
      app: Partial<Application>;
    }
  }
}

describe('Battery', () => {
  let mockContainer: Container;

  beforeEach(() => {
    // Mock sprite
    const mockSprite = {
      scale: { set: jest.fn() },
      position: { set: jest.fn() },
      getSize: () => ({ width: 100, height: 50 }),
    };

    // Create a mock container
    mockContainer = new Container();
    const addChildSpy = jest.spyOn(mockContainer, 'addChild').mockImplementation(() => mockContainer);

    // Setup global mocks
    global.sprites = {
      battery: new Texture(),
    };
    
    // Create a partial mock of PIXI Application
    global.app = {
      stage: mockContainer,
    };

    // Mock Sprite constructor
    jest.spyOn(Sprite.prototype, 'getSize').mockImplementation(() => ({ width: 100, height: 50 }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with correct metadata', () => {
    const battery = new Battery(10, 20, 1.5);

    expect(battery.getX()).toBe(10);
    expect(battery.getY()).toBe(20);
    expect(battery.voltage).toBe(1.5);

    // Check connection points
    expect(battery.connectionPoints).toHaveLength(2);
    
    const point0 = battery.connectionPoints[0];
    const point1 = battery.connectionPoints[1];
    
    expect(point0).toBeDefined();
    expect(point1).toBeDefined();
    
    if (point0 && point1) {
      expect(point0).toEqual({
        x: 10, // x position
        y: 45, // y + height/2
        connectedComponent: null,
      });
      expect(point1).toEqual({
        x: 110, // x + width
        y: 45,  // y + height/2
        connectedComponent: null,
      });
    }
  });

  it('should draw battery and connection points', () => {
    const battery = new Battery(0, 0, 1.5);
    const addChildSpy = jest.spyOn(mockContainer, 'addChild');
    
    battery.draw();

    // Should add sprite and connection points to stage
    expect(addChildSpy).toHaveBeenCalled();
  });

  it('should handle connections correctly', () => {
    const battery1 = new Battery(0, 0, 1.5);
    const battery2 = new Battery(200, 0, 1.5);

    battery1.connectTo(1, battery2, 0); // Connect positive to negative

    const point1 = battery1.connectionPoints[1];
    const point2 = battery2.connectionPoints[0];
    
    expect(point1).toBeDefined();
    expect(point2).toBeDefined();
    
    if (point1 && point2) {
      expect(point1.connectedComponent).toBe(battery2);
      expect(point2.connectedComponent).toBe(battery1);
    }
  });
}); 