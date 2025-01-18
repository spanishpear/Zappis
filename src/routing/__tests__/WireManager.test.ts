import { WireManager } from '../WireManager';
import type { Port, Wire, WirePoint, WireSegment } from '../types';
import { MockComponent } from './mocks/Component.mock';
import { Point } from 'pixi.js';

describe('WireManager', () => {
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

    describe('validateConnection', () => {
        it('should validate valid port connections', () => {
            const result = wireManager.validateConnection(mockStartPort, mockEndPort);
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeUndefined();
        });

        it('should reject connection between two inputs', () => {
            const invalidPort: Port = {
                ...mockEndPort,
                type: 'output'
            };
            
            const result = wireManager.validateConnection(mockStartPort, invalidPort);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Cannot connect two outputs');
        });
    });

    describe('calculateRoute', () => {
        it('should create a valid wire route between two ports', () => {
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            
            expect(wire).toBeDefined();
            expect(wire.startPort).toBe(mockStartPort);
            expect(wire.endPort).toBe(mockEndPort);
            expect(wire.path.length).toBeGreaterThan(0);
        });

        it('should create manhattan style routes', () => {
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            
            // All segments should be either horizontal or vertical
            wire.path.forEach((segment: WireSegment) => {
                expect(['horizontal', 'vertical']).toContain(segment.direction);
            });
        });

        it('should avoid creating diagonal routes', () => {
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            
            wire.path.forEach((segment: WireSegment) => {
                const isDiagonal = 
                    segment.start.position.x !== segment.end.position.x && 
                    segment.start.position.y !== segment.end.position.y;
                expect(isDiagonal).toBe(false);
            });
        });
    });

    describe('findNearestValidPort', () => {
        it('should find the nearest valid port within range', () => {
            // Register the end port first
            wireManager.registerPort(mockEndPort);
            
            const point = new Point(85, 85);
            const nearestPort = wireManager.findNearestValidPort(point);
            
            expect(nearestPort).toBeDefined();
            expect(nearestPort?.id).toBe(mockEndPort.id);
        });

        it('should return null when no ports are in range', () => {
            const point = new Point(1000, 1000);
            const nearestPort = wireManager.findNearestValidPort(point);
            
            expect(nearestPort).toBeNull();
        });
    });

    describe('wire creation workflow', () => {
        it('should handle complete wire creation flow', () => {
            // Start wire creation
            wireManager.startWireCreation(mockStartPort);
            expect(wireManager.getCreationState().isDrawing).toBe(true);
            expect(wireManager.getCreationState().startPort).toBe(mockStartPort);

            // Update preview as mouse moves
            const previewPoint = new Point(50, 50);
            wireManager.updatePreview(previewPoint);
            expect(wireManager.getCreationState().previewPath.length).toBeGreaterThan(0);

            // Complete wire
            const wire = wireManager.completeWire(mockEndPort);
            expect(wire).toBeDefined();
            if (!wire) return;
            expect(wire.startPort).toBe(mockStartPort);
            expect(wire.endPort).toBe(mockEndPort);
            
            // Check creation state is reset
            expect(wireManager.getCreationState().isDrawing).toBe(false);
            expect(wireManager.getCreationState().startPort).toBeNull();
        });

        it('should handle interactive wire creation with waypoints', () => {
            // Start wire creation
            wireManager.startWireCreation(mockStartPort);
            
            // Add waypoints during creation
            const waypoint1 = new Point(40, 20);  // Snapped to grid
            const waypoint2 = new Point(40, 80);  // Snapped to grid
            wireManager.addWaypoint(waypoint1);
            wireManager.addWaypoint(waypoint2);
            
            // Complete wire
            const wire = wireManager.completeWire(mockEndPort);
            expect(wire).toBeDefined();
            if (!wire) return;
            
            expect(wire.path.length).toBeGreaterThan(2); // Should have more segments due to waypoints
            
            // Verify waypoints are used in the path
            const allPoints = wire.path
                .filter(segment => segment.start && segment.end)
                .flatMap(segment => 
                    [segment.start?.position, segment.end?.position].filter((pos): pos is Point => pos !== undefined)
                );
            console.log('All points in path:', allPoints);
            console.log('Looking for waypoint1:', waypoint1);
            console.log('Looking for waypoint2:', waypoint2);
            const hasWaypoint1 = allPoints.some(pos => 
                Math.abs(pos.x - waypoint1.x) < 0.1 && Math.abs(pos.y - waypoint1.y) < 0.1
            );
            const hasWaypoint2 = allPoints.some(pos => 
                Math.abs(pos.x - waypoint2.x) < 0.1 && Math.abs(pos.y - waypoint2.y) < 0.1
            );
            
            expect(hasWaypoint1).toBe(true);
            expect(hasWaypoint2).toBe(true);
        });

        it('should handle setting waypoints directly (JSON loading)', () => {
            // Set waypoints directly without starting wire creation
            const waypoints = [
                new Point(60, 20),  // Snapped to grid
                new Point(60, 80)   // Snapped to grid
            ];
            wireManager.setWaypoints(waypoints);
            
            // Calculate route with the waypoints
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            expect(wire).toBeDefined();
            if (!wire) return;
            
            expect(wire.path.length).toBeGreaterThan(2);
            
            // Verify waypoints are used in the path
            const allPoints = wire.path
                .filter(segment => segment.start && segment.end)
                .flatMap(segment => 
                    [segment.start?.position, segment.end?.position].filter((pos): pos is Point => pos !== undefined)
                );
            const hasWaypoint1 = allPoints.some(pos => 
                // biome-ignore lint/style/noNonNullAssertion: it's a test
                Math.abs(pos.x - waypoints[0]!.x) < 0.1 && Math.abs(pos.y - waypoints[0]!.y) < 0.1
            );
            const hasWaypoint2 = allPoints.some(pos => 
                // biome-ignore lint/style/noNonNullAssertion: it's a test
                Math.abs(pos.x - waypoints[1]!.x) < 0.1 && Math.abs(pos.y - waypoints[1]!.y) < 0.1
            );
            
            expect(hasWaypoint1).toBe(true);
            expect(hasWaypoint2).toBe(true);
        });

        it('should snap waypoints to grid when enabled', () => {
            wireManager.setWaypointOptions({ snapToGrid: true, enforceWaypoints: true });
            
            // Set waypoint at 22,22 (should snap to 20,20 with default grid size)
            const waypoints = [new Point(22, 22)];
            wireManager.setWaypoints(waypoints);
            
            const wire = wireManager.calculateRoute(mockStartPort, mockEndPort);
            expect(wire).toBeDefined();
            if (!wire) return;
            
            // Verify the waypoint was snapped to grid
            const hasSnappedWaypoint = wire.path.some(segment => 
                (segment.start.position.x === 20 && segment.start.position.y === 20) ||
                (segment.end.position.x === 20 && segment.end.position.y === 20)
            );
            expect(hasSnappedWaypoint).toBe(true);
        });
    });
}); 