import type {
    GridPosition,
    ComponentAnchor,
    ComponentBoundary,
    GridConstraint,
    PathSegment,
    PathOptimizationRules,
    WirePathOptions,
    WireRoute,
    Direction
} from './types';

export class PathGenerator {
    private grid: GridConstraint;
    private rules: PathOptimizationRules;
    
    constructor(options: WirePathOptions) {
        this.grid = options.grid;
        this.rules = options.rules;
    }

    /**
     * Snaps a point to the nearest grid position
     */
    public snapToGrid(point: GridPosition): GridPosition {
        const snapX = Math.round((point.x - this.grid.offset) / this.grid.spacing) * this.grid.spacing + this.grid.offset;
        const snapY = Math.round((point.y - this.grid.offset) / this.grid.spacing) * this.grid.spacing + this.grid.offset;
        
        return { x: snapX, y: snapY };
    }

    /**
     * Checks if a point is aligned to the grid
     */
    public isAlignedToGrid(point: GridPosition): boolean {
        const snapped = this.snapToGrid(point);
        const dx = Math.abs(point.x - snapped.x);
        const dy = Math.abs(point.y - snapped.y);
        
        // Make the check more strict - must be very close to grid lines
        const threshold = Math.min(this.grid.snapThreshold, this.grid.spacing / 4);
        return dx <= threshold && dy <= threshold;
    }

    /**
     * Generates a path between two anchors that respects grid alignment and component boundaries
     */
    public generatePath(
        startAnchor: ComponentAnchor,
        endAnchor: ComponentAnchor,
        startBoundary: ComponentBoundary,
        endBoundary: ComponentBoundary
    ): WireRoute {
        // Snap start and end points to grid
        const startPoint = this.snapToGrid(startAnchor.position);
        const endPoint = this.snapToGrid(endAnchor.position);

        // Calculate initial direction based on anchor direction
        const startDirection = startAnchor.direction;
        const endDirection = endAnchor.direction;

        // Generate path segments
        const segments: PathSegment[] = [];
        const bendPoints: GridPosition[] = [];

        // Start with initial segment perpendicular to start component
        const firstSegment = this.createPerpendicularSegment(startPoint, startDirection, this.rules.minSegmentLength);
        segments.push(firstSegment);
        bendPoints.push(firstSegment.end);

        // Create intermediate segments to reach the end point
        const intermediatePoints = this.generateIntermediatePoints(
            firstSegment.end,
            endPoint,
            startDirection,
            endDirection
        );

        intermediatePoints.forEach((point, index) => {
            const prevPoint = index === 0 ? firstSegment.end : intermediatePoints[index - 1];
            if (!prevPoint) return;

            const segment: PathSegment = {
                start: prevPoint,
                end: point,
                type: prevPoint.x === point.x ? 'vertical' : 'horizontal'
            };
            segments.push(segment);
            bendPoints.push(point);
        });

        // Add final segment to end point
        const lastIntermediatePoint = intermediatePoints[intermediatePoints.length - 1] || firstSegment.end;
        const finalSegment: PathSegment = {
            start: lastIntermediatePoint,
            end: endPoint,
            type: lastIntermediatePoint.x === endPoint.x ? 'vertical' : 'horizontal'
        };
        segments.push(finalSegment);

        return {
            segments,
            bendPoints,
            totalLength: this.calculateTotalLength(segments),
            crossings: 0 // TODO: Implement crossing detection
        };
    }

    private createPerpendicularSegment(
        start: GridPosition,
        direction: Direction,
        length: number
    ): PathSegment {
        const end: GridPosition = { ...start };
        
        switch (direction) {
            case 'north':
                end.y -= length;
                break;
            case 'south':
                end.y += length;
                break;
            case 'east':
                end.x += length;
                break;
            case 'west':
                end.x -= length;
                break;
        }

        return {
            start,
            end,
            type: direction === 'north' || direction === 'south' ? 'vertical' : 'horizontal'
        };
    }

    private generateIntermediatePoints(
        start: GridPosition,
        end: GridPosition,
        startDirection: Direction,
        endDirection: Direction
    ): GridPosition[] {
        const points: GridPosition[] = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        // If we're already aligned in one direction, we just need one bend
        if (start.x === end.x || start.y === end.y) {
            const midPoint = {
                x: start.x + dx / 2,
                y: start.y + dy / 2
            };
            points.push(this.snapToGrid(midPoint));
            return points;
        }

        // Otherwise, we need two bends to create a Manhattan path
        const firstBend: GridPosition = {
            x: start.x,
            y: start.y
        };

        const secondBend: GridPosition = {
            x: end.x,
            y: end.y
        };

        // Adjust bends based on start and end directions
        if (startDirection === 'east' || startDirection === 'west') {
            firstBend.x = start.x + dx / 2;
            secondBend.x = firstBend.x;
        } else {
            firstBend.y = start.y + dy / 2;
            secondBend.y = firstBend.y;
        }

        points.push(this.snapToGrid(firstBend));
        points.push(this.snapToGrid(secondBend));

        return points;
    }

    private calculateTotalLength(segments: PathSegment[]): number {
        return segments.reduce((total, segment) => {
            const dx = segment.end.x - segment.start.x;
            const dy = segment.end.y - segment.start.y;
            return total + Math.sqrt(dx * dx + dy * dy);
        }, 0);
    }

    /**
     * Optimizes a path by removing unnecessary points and smoothing corners
     */
    public optimizePath(route: WireRoute): WireRoute {
        // Implementation will go here
        throw new Error('Not implemented');
    }

    /**
     * Checks if a segment is perpendicular to a component boundary
     */
    public isPerpendicularToComponent(
        segment: PathSegment,
        boundary: ComponentBoundary
    ): boolean {
        // For a segment to be perpendicular to a component boundary:
        // 1. One of its endpoints should be near the boundary
        // 2. The segment should be either perfectly horizontal or vertical
        // 3. It should intersect the boundary at a right angle

        // First, determine if the segment is horizontal or vertical
        const isHorizontal = Math.abs(segment.start.y - segment.end.y) <= this.grid.snapThreshold;
        const isVertical = Math.abs(segment.start.x - segment.end.x) <= this.grid.snapThreshold;

        if (!isHorizontal && !isVertical) {
            return false; // Diagonal segments are never perpendicular
        }

        // Check if either endpoint is near the boundary
        const nearStart = this.isPointNearBoundary(segment.start, boundary);
        const nearEnd = this.isPointNearBoundary(segment.end, boundary);

        if (!nearStart && !nearEnd) {
            return false;
        }

        // For horizontal segments, they should connect to vertical boundaries
        // For vertical segments, they should connect to horizontal boundaries
        const point = nearStart ? segment.start : segment.end;
        const isOnVerticalBoundary = 
            Math.abs(point.x - boundary.topLeft.x) <= this.grid.snapThreshold ||
            Math.abs(point.x - boundary.bottomRight.x) <= this.grid.snapThreshold;
        const isOnHorizontalBoundary =
            Math.abs(point.y - boundary.topLeft.y) <= this.grid.snapThreshold ||
            Math.abs(point.y - boundary.bottomRight.y) <= this.grid.snapThreshold;

        return (isHorizontal && isOnVerticalBoundary) || (isVertical && isOnHorizontalBoundary);
    }

    private isPointNearBoundary(point: GridPosition, boundary: ComponentBoundary): boolean {
        const threshold = this.grid.snapThreshold;
        
        // Check if point is near any of the boundary edges with a more lenient threshold
        const nearVerticalBoundary =
            (Math.abs(point.x - boundary.topLeft.x) <= threshold ||
             Math.abs(point.x - boundary.bottomRight.x) <= threshold) &&
            point.y >= boundary.topLeft.y - threshold &&
            point.y <= boundary.bottomRight.y + threshold;

        const nearHorizontalBoundary =
            (Math.abs(point.y - boundary.topLeft.y) <= threshold ||
             Math.abs(point.y - boundary.bottomRight.y) <= threshold) &&
            point.x >= boundary.topLeft.x - threshold &&
            point.x <= boundary.bottomRight.x + threshold;

        return nearVerticalBoundary || nearHorizontalBoundary;
    }

    /**
     * Counts the number of bends in a path
     */
    public countBends(segments: PathSegment[]): number {
        if (segments.length < 2) return 0;

        let bendCount = 0;
        for (let i = 1; i < segments.length; i++) {
            const current = segments[i];
            const previous = segments[i - 1];

            // Skip if either segment is undefined (shouldn't happen, but TypeScript wants us to check)
            if (!current || !previous) continue;

            // A bend occurs when the direction changes from horizontal to vertical or vice versa
            const previousIsHorizontal = previous.start.y === previous.end.y;
            const currentIsHorizontal = current.start.y === current.end.y;

            if (previousIsHorizontal !== currentIsHorizontal) {
                bendCount++;
            }
        }

        return bendCount;
    }
} 