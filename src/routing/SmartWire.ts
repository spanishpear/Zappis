import { Component } from '../component';
import type { Port, Direction } from './types';
import { WireManager } from './WireManager';
import { Graphics, Point } from 'pixi.js';

export class SmartWire extends Component {
    private wireManager: WireManager;
    private startPort: Port;
    private endPort: Port;
    private strokeWidth: number;
    private color: string;
    private readonly COMPONENT_CLEARANCE = 2; // Grid units of clearance around components

    private calculatePortDirection(from: Point, to: Point): Direction {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        // Determine predominant direction
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'east' : 'west';
        }
        return dy > 0 ? 'south' : 'north';
    }

    constructor(
        startComponent: Component,
        endComponent: Component,
        startIdx: number,
        endIdx: number,
        strokeWidth = 15,
        color = '0x000000',
    ) {
        super();

        this.strokeWidth = strokeWidth;
        this.color = color;
        this.wireManager = new WireManager();

        // Create ports from connection points
        const start = startComponent.connectionPoints[startIdx];
        const end = endComponent.connectionPoints[endIdx];

        if (!start || !end) {
            throw new Error('Invalid connection points');
        }

        // Calculate port directions based on component positions
        const startPos = new Point(start.x, start.y);
        const endPos = new Point(end.x, end.y);
        const startDir = this.calculatePortDirection(startPos, endPos);
        const endDir = this.calculatePortDirection(endPos, startPos);

        this.startPort = {
            id: `${startComponent.constructor.name}-${startIdx}`,
            position: startPos,
            direction: startDir,
            type: 'output',
            component: startComponent
        };

        this.endPort = {
            id: `${endComponent.constructor.name}-${endIdx}`,
            position: endPos,
            direction: endDir,
            type: 'input',
            component: endComponent
        };

        // Add clearance zones around components
        const startGridPos = this.wireManager.gridPositionFromPoint(startPos);
        const endGridPos = this.wireManager.gridPositionFromPoint(endPos);
        
        this.wireManager.addComponentClearance(startGridPos, this.COMPONENT_CLEARANCE);
        this.wireManager.addComponentClearance(endGridPos, this.COMPONENT_CLEARANCE);

        // Register ports with wire manager
        this.wireManager.registerPort(this.startPort);
        this.wireManager.registerPort(this.endPort);

        // Set up our own connection points
        this.connectionPoints = [
            {
                x: start.x,
                y: start.y,
                connectedComponent: startComponent,
            },
            {
                x: end.x,
                y: end.y,
                connectedComponent: endComponent,
            },
        ];

        // Set routing style based on distance
        const distance = Math.sqrt(
            (endPos.x - startPos.x) ** 2 + 
            (endPos.y - startPos.y) ** 2
        );
        
        // Use direct routing for very close components, manhattan for others
        this.wireManager.setRoutingStyle(distance < 50 ? 'direct' : 'manhattan');

        // Establish the connection
        startComponent.connectTo(startIdx, endComponent, endIdx);
    }

    override draw(): void {
        this.clear();

        // Calculate route
        const wire = this.wireManager.calculateRoute(this.startPort, this.endPort);

        // Draw segments with rounded corners
        let lastPoint: Point | null = null;
        
        wire.path.forEach(segment => {
            const start = segment.start.position;
            const end = segment.end.position;

            if (!lastPoint) {
                this.moveTo(start.x, start.y);
            } else if (lastPoint.x !== start.x || lastPoint.y !== start.y) {
                // Add rounded corner
                const radius = Math.min(this.strokeWidth, 10);
                this.arcTo(lastPoint.x, lastPoint.y, start.x, start.y, radius);
            }

            this.lineTo(end.x, end.y);
            lastPoint = end;
        });

        this.stroke({ width: this.strokeWidth, color: this.color });
        globalThis.app.stage.addChild(this);
    }

    getSegments() {
        const wire = this.wireManager.calculateRoute(this.startPort, this.endPort);
        return wire.path.map(segment => ({
            x: segment.start.position.x,
            y: segment.start.position.y
        }));
    }
} 