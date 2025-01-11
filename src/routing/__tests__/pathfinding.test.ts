import { Point } from 'pixi.js';
import { WireManager } from '../WireManager';
import type { Port, Wire, GridPosition } from '../types';
import { MockComponent } from './mocks/Component.mock';

describe('WireManager Pathfinding', () => {
    let wireManager: WireManager;
    let mockStartComponent: MockComponent;
    let mockEndComponent: MockComponent;
    let mockStartPort: Port;
    let mockEndPort: Port;

    beforeEach(() => {
        wireManager = new WireManager();
        
        // Setup mock components and ports
        mockStartComponent = new MockComponent({ x: 0, y: 0 });
        mockEndComponent = new MockComponent({ x: 100, y: 100 });
        
        mockStartPort = {
            id: 'start-port',
            position: new Point(10, 10),
            direction: 'east',
            type: 'output',
            component: mockStartComponent
        } as Port;
        
        mockEndPort = {
            id: 'end-port',
            position: new Point(90, 90),
            direction: 'west',
            type: 'input',
            component: mockEndComponent
        } as Port;
    });

    describe('gridPositionFromPoint', () => {
        it('should convert a Point to grid coordinates', () => {
            const point = new Point(25, 25);
            const gridPos = wireManager.gridPositionFromPoint(point);
            
            // Grid size is now 20
            expect(gridPos.x).toBe(1);
            expect(gridPos.y).toBe(1);
        });
    });

    describe('findPath', () => {
        it('should find a valid path between two points', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return; // TypeScript guard
            expect(path.length).toBeGreaterThan(0);
        });

        it('should handle obstacles', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            // Add an obstacle in the middle
            wireManager.addObstacle({ x: 10, y: 10 });
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return; // TypeScript guard
            
            expect(path.length).toBeGreaterThan(0);
            
            // Path should avoid the obstacle
            const hasObstacle = path.some(pos => pos.x === 10 && pos.y === 10);
            expect(hasObstacle).toBe(false);
        });

        it('should prefer manhattan-style paths', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return; // TypeScript guard
            
            // Check that each segment is either horizontal or vertical
            for (let i = 1; i < path.length; i++) {
                const current = path[i];
                const previous = path[i - 1];
                
                // These should always exist due to the loop condition
                if (!current || !previous) {
                    throw new Error('Path segment missing');
                }
                
                const isDiagonal = 
                    current.x !== previous.x && 
                    current.y !== previous.y;
                    
                expect(isDiagonal).toBe(false);
            }
        });

        it('should handle unreachable destinations', () => {
            const start: GridPosition = { x: 1, y: 1 };
            const end: GridPosition = { x: 4, y: 1 };
            
            // Create a complete enclosure around the end point
            wireManager.addObstacle({ x: 3, y: 0 }); // Top
            wireManager.addObstacle({ x: 3, y: 1 }); // Middle
            wireManager.addObstacle({ x: 3, y: 2 }); // Bottom
            wireManager.addObstacle({ x: 4, y: 0 }); // Around end point
            wireManager.addObstacle({ x: 4, y: 2 });
            wireManager.addObstacle({ x: 5, y: 0 });
            wireManager.addObstacle({ x: 5, y: 1 });
            wireManager.addObstacle({ x: 5, y: 2 });
            
            const path = wireManager.findPath(start, end);
            expect(path).toBeNull();
        });

        it('should handle destination blocked by obstacles', () => {
            const start: GridPosition = { x: 0, y: 0 };
            const end: GridPosition = { x: 2, y: 2 };
            
            // Block the destination
            wireManager.addObstacle({ x: 2, y: 2 });
            
            const path = wireManager.findPath(start, end);
            expect(path).toBeNull();
        });
    });

    describe('calculateRoute with pathfinding', () => {
        it('should create a wire route using pathfinding', () => {
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            
            expect(wire.path.length).toBeGreaterThan(0);
            
            // Verify that the path follows grid alignment
            wire.path.forEach(segment => {
                const start = wireManager.gridPositionFromPoint(segment.start.position);
                const end = wireManager.gridPositionFromPoint(segment.end.position);
                
                // Each segment should be aligned to grid
                expect(start.x % 1).toBe(0);
                expect(start.y % 1).toBe(0);
                expect(end.x % 1).toBe(0);
                expect(end.y % 1).toBe(0);
            });
        });
    });

    describe('path smoothing', () => {
        it('should smooth paths by removing unnecessary points', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return;

            // Get smoothed path
            const smoothedPath = wireManager.smoothPath(path);
            expect(smoothedPath.length).toBeLessThanOrEqual(path.length);
            
            // Verify path is still valid (no obstacles)
            smoothedPath.forEach((point: GridPosition) => {
                const hasObstacle = wireManager.hasObstacle(point);
                expect(hasObstacle).toBe(false);
            });
        });

        it('should maintain path validity after smoothing', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 2 };
            
            // Add some obstacles
            wireManager.addObstacle({ x: 10, y: 1 });
            wireManager.addObstacle({ x: 10, y: 2 });
            wireManager.addObstacle({ x: 10, y: 3 });
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return;

            const smoothedPath = wireManager.smoothPath(path);
            
            // Verify smoothed path still avoids obstacles
            smoothedPath.forEach((point: GridPosition) => {
                const hasObstacle = wireManager.hasObstacle(point);
                expect(hasObstacle).toBe(false);
            });
        });
    });

    describe('component clearance', () => {
        it('should maintain minimum clearance from components', () => {
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 2 };
            
            // Add a component with clearance zone
            wireManager.addComponentClearance({ x: 10, y: 2 }, 2); // 2 unit clearance
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return;

            // Check clearance is maintained
            path.forEach((point: GridPosition) => {
                const tooClose = wireManager.isWithinComponentClearance(point);
                expect(tooClose).toBe(false);
            });
        });
    });

    describe('routing styles', () => {
        it('should respect manhattan style routing', () => {
            wireManager.setRoutingStyle('manhattan');
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return;

            // Verify manhattan style (only horizontal or vertical moves)
            for (let i = 1; i < path.length; i++) {
                const current = path[i];
                const previous = path[i - 1];
                
                if (!current || !previous) continue;
                
                const isDiagonal = 
                    current.x !== previous.x && 
                    current.y !== previous.y;
                expect(isDiagonal).toBe(false);
            }
        });

        it('should allow diagonal routing when specified', () => {
            wireManager.setRoutingStyle('direct');
            const start: GridPosition = { x: 2, y: 2 };
            const end: GridPosition = { x: 18, y: 18 };
            
            const path = wireManager.findPath(start, end);
            expect(path).not.toBeNull();
            if (!path) return;

            // Should have some diagonal moves
            let hasDiagonal = false;
            for (let i = 1; i < path.length; i++) {
                const current = path[i];
                const previous = path[i - 1];
                
                if (!current || !previous) continue;
                
                if (current.x !== previous.x && current.y !== previous.y) {
                    hasDiagonal = true;
                    break;
                }
            }
            expect(hasDiagonal).toBe(true);
        });
    });
}); 