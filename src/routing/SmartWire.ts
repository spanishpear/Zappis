import { Component } from '../component';
import type { Port, Direction, PathSegment } from './types';
import { Graphics, Point } from 'pixi.js';

export class SmartWire extends Component {
    private startPort: Port;
    private endPort: Port;
    private strokeWidth: number;
    private color: string;
    private segments: PathSegment[] = [];

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

        // Establish the connection
        startComponent.connectTo(startIdx, endComponent, endIdx);
    }

    private generateSimplePath(): PathSegment[] {
        const start = this.startPort.position;
        const end = this.endPort.position;
        const segments: PathSegment[] = [];

        // Determine if we should go horizontal first or vertical first
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const preferHorizontal = Math.abs(dx) > Math.abs(dy);

        if (preferHorizontal) {
            // Horizontal segment
            segments.push({
                start: { x: start.x / 20, y: start.y / 20 },
                end: { x: end.x / 20, y: start.y / 20 },
                type: 'horizontal'
            });

            // Only add vertical segment if needed
            if (Math.abs(dy) > 0) {
                segments.push({
                    start: { x: end.x / 20, y: start.y / 20 },
                    end: { x: end.x / 20, y: end.y / 20 },
                    type: 'vertical'
                });
            }
        } else {
            // Vertical segment
            segments.push({
                start: { x: start.x / 20, y: start.y / 20 },
                end: { x: start.x / 20, y: end.y / 20 },
                type: 'vertical'
            });

            // Only add horizontal segment if needed
            if (Math.abs(dx) > 0) {
                segments.push({
                    start: { x: start.x / 20, y: end.y / 20 },
                    end: { x: end.x / 20, y: end.y / 20 },
                    type: 'horizontal'
                });
            }
        }

        return segments;
    }

    override draw(): void {
        this.clear();

        // Generate simple L-shaped path
        this.segments = this.generateSimplePath();

        // Start from exact connection point
        this.moveTo(this.startPort.position.x, this.startPort.position.y);

        // Draw segments with rounded corners
        let lastPoint: Point | null = null;
        this.segments.forEach(segment => {
            const start = new Point(segment.start.x * 20, segment.start.y * 20);
            const end = new Point(segment.end.x * 20, segment.end.y * 20);

            if (!lastPoint) {
                this.lineTo(start.x, start.y);
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
        // Start with the exact start point
        const points = [{
            x: this.startPort.position.x,
            y: this.startPort.position.y
        }];

        // Add all grid-aligned points
        this.segments.forEach(segment => {
            points.push({
                x: segment.start.x * 20,
                y: segment.start.y * 20
            });
            points.push({
                x: segment.end.x * 20,
                y: segment.end.y * 20
            });
        });

        // End with the exact end point
        points.push({
            x: this.endPort.position.x,
            y: this.endPort.position.y
        });

        // Remove duplicates
        return points.filter((point, index, self) => {
            if (index === 0 || index === self.length - 1) return true;
            const prev = self[index - 1];
            return prev && (point.x !== prev.x || point.y !== prev.y);
        });
    }
} 