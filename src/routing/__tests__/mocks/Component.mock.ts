import { Point } from 'pixi.js';

export class MockComponent {
    public position: Point;

    constructor(position: { x: number; y: number }) {
        this.position = new Point(position.x, position.y);
    }
} 