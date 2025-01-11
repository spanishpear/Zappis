import type { Point } from 'pixi.js';
import type { Component } from '../component';

export type Direction = 'north' | 'south' | 'east' | 'west';
export type PointType = 'component' | 'bend' | 'junction';
export type ConnectionType = 'input' | 'output';

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