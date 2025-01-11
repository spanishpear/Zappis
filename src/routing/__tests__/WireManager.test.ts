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
            expect(wire.startPort).toBe(mockStartPort);
            expect(wire.endPort).toBe(mockEndPort);
            
            // Check creation state is reset
            expect(wireManager.getCreationState().isDrawing).toBe(false);
            expect(wireManager.getCreationState().startPort).toBeNull();
        });
    });
}); 