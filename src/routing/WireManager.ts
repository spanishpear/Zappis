import { Point } from 'pixi.js';
import type { 
    Port, 
    Wire, 
    WirePoint, 
    WireCreationState,
    ValidationResult,
    GridPosition,
    GridNode,
    WireSegment,
    RoutingStyle,
    ComponentClearance,
    PathfindingOptions,
    WayPointOptions
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class WireManager {
    private wires: Map<string, Wire>;
    private ports: Map<string, Port>;
    private creationState: WireCreationState;
    private grid: Map<string, GridNode>;
    private clearanceZones: ComponentClearance[];
    private routingStyle: RoutingStyle;
    private waypointOptions: WayPointOptions;
    private readonly GRID_SIZE = 20; // Increased from 5 to 20 for smoother paths
    private readonly MIN_GRID = 0;
    private readonly MAX_GRID = 100;
    
    constructor() {
        this.wires = new Map();
        this.ports = new Map();
        this.grid = new Map();
        this.clearanceZones = [];
        this.routingStyle = 'manhattan';
        this.waypointOptions = {
            enforceWaypoints: true,
            snapToGrid: true
        };
        this.creationState = {
            isDrawing: false,
            startPort: null,
            currentPath: [],
            previewPath: [],
            validEndPoints: [],
            waypoints: []
        };
    }

    private isInBounds(pos: GridPosition): boolean {
        return pos.x >= this.MIN_GRID && 
               pos.x <= this.MAX_GRID && 
               pos.y >= this.MIN_GRID && 
               pos.y <= this.MAX_GRID;
    }

    private getGridKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    public gridPositionFromPoint(point: Point): GridPosition {
        return {
            x: Math.floor(point.x / this.GRID_SIZE),
            y: Math.floor(point.y / this.GRID_SIZE)
        };
    }

    private pointFromGridPosition(gridPos: GridPosition): Point {
        return new Point(
            gridPos.x * this.GRID_SIZE,
            gridPos.y * this.GRID_SIZE
        );
    }

    public addObstacle(pos: GridPosition): void {
        if (!this.isInBounds(pos)) return;
        
        const key = this.getGridKey(pos.x, pos.y);
        const node: GridNode = {
            x: pos.x,
            y: pos.y,
            f: 0,
            g: 0,
            h: 0,
            parent: null,
            isOccupied: true
        };
        this.grid.set(key, node);
    }

    private getNode(pos: GridPosition): GridNode | null {
        if (!this.isInBounds(pos)) return null;
        
        const key = this.getGridKey(pos.x, pos.y);
        let node = this.grid.get(key);
        if (!node) {
            node = {
                x: pos.x,
                y: pos.y,
                f: 0,
                g: 0,
                h: 0,
                parent: null,
                isOccupied: false
            };
            this.grid.set(key, node);
        }
        return node;
    }

    private getNeighbors(node: GridNode): GridNode[] {
        const neighbors: GridNode[] = [];
        const positions: GridPosition[] = [];

        // Add orthogonal neighbors
        positions.push(
            { x: node.x, y: node.y - 1 }, // North
            { x: node.x + 1, y: node.y }, // East
            { x: node.x, y: node.y + 1 }, // South
            { x: node.x - 1, y: node.y }  // West
        );

        // Add diagonal neighbors if not in manhattan mode
        if (this.routingStyle === 'direct') {
            positions.push(
                { x: node.x + 1, y: node.y - 1 }, // Northeast
                { x: node.x + 1, y: node.y + 1 }, // Southeast
                { x: node.x - 1, y: node.y + 1 }, // Southwest
                { x: node.x - 1, y: node.y - 1 }  // Northwest
            );
        }

        for (const pos of positions) {
            const neighbor = this.getNode(pos);
            if (neighbor && !neighbor.isOccupied && !this.isWithinComponentClearance(pos)) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    private heuristic(a: GridPosition, b: GridPosition): number {
        // Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    public findPath(start: GridPosition, end: GridPosition): GridPosition[] | null {
        // Check if start or end is out of bounds
        if (!this.isInBounds(start) || !this.isInBounds(end)) {
            return null;
        }
        
        // Reset grid nodes for new search but keep obstacles
        const obstacles = new Map<string, GridNode>();
        for (const [key, node] of this.grid.entries()) {
            if (node.isOccupied) {
                obstacles.set(key, node);
            }
        }
        this.grid.clear();
        
        // Restore obstacles
        for (const [key, node] of obstacles.entries()) {
            this.grid.set(key, node);
        }
        
        const startNode = this.getNode(start);
        const endNode = this.getNode(end);
        
        // If start or end is occupied or invalid, no path is possible
        if (!startNode || !endNode || startNode.isOccupied || endNode.isOccupied) {
            return null;
        }
        
        const openSet: GridNode[] = [startNode];
        const closedSet = new Set<string>();
        
        while (openSet.length > 0) {
            // Find node with lowest f score
            let lowestF = Number.POSITIVE_INFINITY;
            let currentIndex = -1;
            
            // Find the node with the lowest f score
            for (let i = 0; i < openSet.length; i++) {
                const node = openSet[i];
                if (node && node.f < lowestF) {
                    lowestF = node.f;
                    currentIndex = i;
                }
            }
            
            if (currentIndex === -1) {
                return null; // No valid path found
            }
            
            const current = openSet[currentIndex];
            if (!current) {
                return null; // This should never happen, but TypeScript needs it
            }
            
            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            
            // Add to closed set
            const currentKey = this.getGridKey(current.x, current.y);
            closedSet.add(currentKey);
            
            // Check if we reached the end
            if (current.x === endNode.x && current.y === endNode.y) {
                const path: GridPosition[] = [];
                let temp: GridNode | null = current;
                
                while (temp !== null) {
                    path.push({ x: temp.x, y: temp.y });
                    temp = temp.parent;
                }
                
                return path.reverse();
            }
            
            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = this.getGridKey(neighbor.x, neighbor.y);
                if (closedSet.has(neighborKey)) {
                    continue;
                }
                
                const tentativeG = current.g + 1;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }
                
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
        
        return null; // No path found
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
        // Always use waypoints if they exist in the creation state
        if (this.creationState.waypoints.length > 0) {
            const wire = this.calculateRouteWithWaypoints(start, end, this.creationState.waypoints);
            // Store waypoints in the wire object
            wire.waypoints = [...this.creationState.waypoints];
            return wire;
        }

        const startGridPos = this.gridPositionFromPoint(start.position);
        const endGridPos = this.gridPositionFromPoint(end.position);
        
        const pathResult = this.findPath(startGridPos, endGridPos);
        
        if (!pathResult || pathResult.length === 0) {
            return this.createSimpleRoute(start, end);
        }
        
        // Convert path to wire segments
        const wirePoints: WirePoint[] = pathResult.map((pos): WirePoint => ({
            position: this.pointFromGridPosition(pos),
            type: pos === pathResult[0] ? 'component' : 
                  pos === pathResult[pathResult.length - 1] ? 'component' : 'bend',
            connectionType: pos === pathResult[0] ? 'output' :
                          pos === pathResult[pathResult.length - 1] ? 'input' : undefined
        }));
        
        const segments: WireSegment[] = [];
        for (let i = 0; i < wirePoints.length - 1; i++) {
            const current = wirePoints[i];
            const next = wirePoints[i + 1];
            
            if (current && next) {
                segments.push({
                    start: current,
                    end: next,
                    direction: current.position.x === next.position.x ? 'vertical' : 'horizontal'
                });
            }
        }

        return {
            id: uuidv4(),
            path: segments,
            startComponent: start.component,
            endComponent: end.component,
            startPort: start,
            endPort: end,
            waypoints: []
        };
    }

    private createSimpleRoute(start: Port, end: Port): Wire {
        // Original L-shaped route implementation
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
            validEndPoints: [],
            waypoints: []
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

    public completeWire(endPort: Port): Wire | null {
        if (!this.creationState.isDrawing || !this.creationState.startPort) {
            console.warn('No wire creation in progress');
            return null;
        }

        this.registerPort(endPort);
        const wire = this.calculateRoute(this.creationState.startPort, endPort);

        // Store the result before resetting state
        const result = wire;

        // Reset creation state
        this.creationState = {
            isDrawing: false,
            startPort: null,
            currentPath: [],
            previewPath: [],
            validEndPoints: [],
            waypoints: []
        };

        return result;
    }

    public getCreationState(): WireCreationState {
        return this.creationState;
    }

    public setRoutingStyle(style: RoutingStyle): void {
        this.routingStyle = style;
    }

    public addComponentClearance(position: GridPosition, radius: number): void {
        this.clearanceZones.push({ position, radius });
        
        // Mark grid points within clearance zone as occupied
        for (let x = position.x - radius; x <= position.x + radius; x++) {
            for (let y = position.y - radius; y <= position.y + radius; y++) {
                if (this.isInBounds({ x, y })) {
                    this.addObstacle({ x, y });
                }
            }
        }
    }

    public isWithinComponentClearance(pos: GridPosition): boolean {
        return this.clearanceZones.some(zone => {
            const dx = pos.x - zone.position.x;
            const dy = pos.y - zone.position.y;
            return Math.sqrt(dx * dx + dy * dy) <= zone.radius;
        });
    }

    public hasObstacle(pos: GridPosition): boolean {
        if (!this.isInBounds(pos)) return true;
        const node = this.getNode(pos);
        return node?.isOccupied ?? false;
    }

    public smoothPath(path: GridPosition[]): GridPosition[] {
        if (path.length <= 2) return path;

        const smoothed: GridPosition[] = [];
        if (path[0]) smoothed.push(path[0]);
        
        let current = 0;

        while (current < path.length - 1) {
            let furthest = current + 1;
            
            // Look ahead for the furthest point we can directly connect to
            for (let i = current + 2; i < path.length; i++) {
                const currentPoint = path[current];
                const testPoint = path[i];
                if (currentPoint && testPoint && this.canDirectConnect(currentPoint, testPoint)) {
                    furthest = i;
                }
            }

            const furthestPoint = path[furthest];
            if (furthestPoint) {
                smoothed.push(furthestPoint);
            }
            current = furthest;
        }

        return smoothed;
    }

    private canDirectConnect(start: GridPosition, end: GridPosition): boolean {
        // Bresenham's line algorithm to check if path is clear
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
        let err = dx - dy;

        let x = start.x;
        let y = start.y;

        while (true) {
            if (this.hasObstacle({ x, y })) {
                return false;
            }

            if (x === end.x && y === end.y) {
                break;
            }

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return true;
    }

    public setWaypointOptions(options: WayPointOptions): void {
        this.waypointOptions = options;
    }

    public addWaypoint(point: Point): void {
        if (!this.creationState.isDrawing) {
            throw new Error('No wire creation in progress');
        }

        if (this.waypointOptions.snapToGrid) {
            point = new Point(
                Math.round(point.x / this.GRID_SIZE) * this.GRID_SIZE,
                Math.round(point.y / this.GRID_SIZE) * this.GRID_SIZE
            );
        }

        this.creationState.waypoints.push(point);
        this.updatePreview(point);
    }

    // New method for setting waypoints directly (used when loading from JSON)
    public setWaypoints(points: Point[]): void {
        this.creationState.waypoints = points.map(p => 
            this.waypointOptions.snapToGrid 
                ? new Point(
                    Math.round(p.x / this.GRID_SIZE) * this.GRID_SIZE,
                    Math.round(p.y / this.GRID_SIZE) * this.GRID_SIZE
                  )
                : new Point(p.x, p.y)
        );
    }

    private calculateRouteWithWaypoints(start: Port, end: Port, waypoints: Point[]): Wire {
        if (!waypoints.length) {
            return this.createSimpleRoute(start, end);
        }

        const allPoints = [start.position, ...waypoints, end.position];
        const segments: WireSegment[] = [];
        const wirePoints: WirePoint[] = [];

        // Create wire points for each waypoint
        for (let i = 0; i < allPoints.length; i++) {
            const point = allPoints[i];
            if (!point) continue;
            
            const isFirst = i === 0;
            const isLast = i === allPoints.length - 1;

            wirePoints.push({
                position: new Point(point.x, point.y), // Create new Point to avoid reference issues
                type: isFirst || isLast ? 'component' : 'bend', // Use 'bend' for waypoints
                connectionType: isFirst ? 'output' : isLast ? 'input' : undefined
            });
        }

        // Create segments between points
        for (let i = 0; i < wirePoints.length - 1; i++) {
            const current = wirePoints[i];
            const next = wirePoints[i + 1];
            
            if (!current || !next) continue;

            // Create L-shaped segments between points
            const bendPoint: WirePoint = {
                position: new Point(next.position.x, current.position.y),
                type: 'bend'
            };

            segments.push({
                start: current,
                end: bendPoint,
                direction: 'horizontal'
            });

            segments.push({
                start: bendPoint,
                end: next,
                direction: 'vertical'
            });
        }

        return {
            id: uuidv4(),
            path: segments,
            startComponent: start.component,
            endComponent: end.component,
            startPort: start,
            endPort: end,
            waypoints: waypoints
        };
    }
} 