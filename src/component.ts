import { Graphics } from "pixi.js";

export interface ConnectionPoint {
        x: number;
        y: number;
        connectedComponent?: Component | null;
}

export abstract class Component extends Graphics {
        connectionPoints: ConnectionPoint[] = [];
        coordinates = { x: 0, y: 0 };

        constructor(x: number, y: number, connectionPoints: ConnectionPoint[]) {
                super();
                this.coordinates = { x, y };
                this.connectionPoints = connectionPoints;
        }

        get x(): number {
                return this.coordinates.x;
        }

        get y(): number {
                return this.coordinates.y;
        }

        abstract draw(): void;

        // Connect a wire to a specific connection point by index
        connectTo(
                connectionIndex: number,
                component: Component,
                otherConnectionIndex: number,
        ) {
                this.connectionPoints[connectionIndex].connectedComponent = component;
                component.connectionPoints[otherConnectionIndex].connectedComponent = this;
        }
}
