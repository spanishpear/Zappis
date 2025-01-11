import { Point } from 'pixi.js';
import type { 
    Port, 
    Wire, 
    WirePoint, 
    WireCreationState,
    ValidationResult 
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class WireManager {
    private wires: Map<string, Wire>;
    private ports: Map<string, Port>;
    private creationState: WireCreationState;
    
    constructor() {
        this.wires = new Map();
        this.ports = new Map();
        this.creationState = {
            isDrawing: false,
            startPort: null,
            currentPath: [],
            previewPath: [],
            validEndPoints: []
        };
    }

    public registerPort(port: Port): void {
        this.ports.set(port.id, port);
    }

    public validateConnection(start: Port, end: Port): ValidationResult {
        // Basic validation: can't connect two outputs or two inputs
        if (start.type === end.type) {
            return {
                isValid: false,
                errors: [`Cannot connect two ${start.type}s`]
            };
        }

        return { isValid: true };
    }

    public calculateRoute(start: Port, end: Port): Wire {
        // Stub implementation - creates a simple L-shaped route
        const startPoint: WirePoint = {
            position: start.position,
            type: 'component',
            connectionType: 'output'
        };

        const bendPoint: WirePoint = {
            position: new Point(end.position.x, start.position.y),
            type: 'bend'
        };

        const endPoint: WirePoint = {
            position: end.position,
            type: 'component',
            connectionType: 'input'
        };

        const horizontalSegment = {
            start: startPoint,
            end: bendPoint,
            direction: 'horizontal' as const
        };

        const verticalSegment = {
            start: bendPoint,
            end: endPoint,
            direction: 'vertical' as const
        };

        return {
            id: uuidv4(),
            path: [horizontalSegment, verticalSegment],
            startComponent: start.component,
            endComponent: end.component,
            startPort: start,
            endPort: end
        };
    }

    public findNearestValidPort(point: Point): Port | null {
        const SEARCH_RADIUS = 10;
        
        // Search through all registered ports
        const allPorts = Array.from(this.ports.values());

        return allPorts.find(port => {
            const distance = Math.sqrt(
                (port.position.x - point.x) ** 2 + 
                (port.position.y - point.y) ** 2
            );
            return distance <= SEARCH_RADIUS;
        }) || null;
    }

    public startWireCreation(startPort: Port): void {
        this.registerPort(startPort);
        this.creationState = {
            isDrawing: true,
            startPort,
            currentPath: [],
            previewPath: [],
            validEndPoints: []
        };
    }

    public updatePreview(point: Point): void {
        if (!this.creationState.startPort) return;

        const previewWire = this.calculateRoute(
            this.creationState.startPort,
            {
                id: 'preview',
                position: point,
                direction: 'west',
                type: 'input',
                component: this.creationState.startPort.component // temporary
            }
        );

        this.creationState.previewPath = previewWire.path.flatMap(segment => [
            segment.start,
            segment.end
        ]);
    }

    public completeWire(endPort: Port): Wire {
        if (!this.creationState.startPort) {
            throw new Error('No wire creation in progress');
        }

        this.registerPort(endPort);
        const wire = this.calculateRoute(this.creationState.startPort, endPort);
        this.wires.set(wire.id, wire);

        // Reset creation state
        this.creationState = {
            isDrawing: false,
            startPort: null,
            currentPath: [],
            previewPath: [],
            validEndPoints: []
        };

        return wire;
    }

    public getCreationState(): WireCreationState {
        return this.creationState;
    }
} 