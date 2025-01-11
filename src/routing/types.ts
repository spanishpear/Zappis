import type { Point } from 'pixi.js';
import type { Component } from '../component';

export type Direction = 'north' | 'south' | 'east' | 'west';
export type PointType = 'component' | 'bend' | 'junction';
export type ConnectionType = 'input' | 'output';
export type RoutingStyle = 'manhattan' | 'direct' | 'smooth';

// Grid types for pathfinding
export interface GridNode {
    x: number;
    y: number;
    f: number; // Total cost (g + h)
    g: number; // Cost from start to this node
    h: number; // Heuristic cost to end
    parent: GridNode | null;
    isOccupied: boolean;
}

export interface GridPosition {
    x: number;
    y: number;
}

export interface Port {
    id: string;
    position: Point;
    direction: Direction;
    type: ConnectionType;
    component: Component;
}

export interface WirePoint {
    position: Point;
    type: PointType;
    connectionType?: ConnectionType;
}

export interface WireSegment {
    start: WirePoint;
    end: WirePoint;
    direction: 'horizontal' | 'vertical';
}

export interface Wire {
    id: string;
    path: WireSegment[];
    startComponent: Component;
    endComponent: Component;
    startPort: Port;
    endPort: Port;
}

export interface WireCreationState {
    isDrawing: boolean;
    startPort: Port | null;
    currentPath: WirePoint[];
    previewPath: WirePoint[];
    validEndPoints: Port[];
}

// Validation types
export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}

export interface ComponentClearance {
    position: GridPosition;
    radius: number;
}

export interface PathfindingOptions {
    routingStyle: RoutingStyle;
    smoothing: boolean;
    clearanceCheck: boolean;
} 