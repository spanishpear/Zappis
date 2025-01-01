import { Component, ConnectionPoint } from "./component";

export class Switch extends Component {
        isClosed: boolean;
        constructor(x: number, y: number, isClosed: boolean = false) {
                const connectionPoints: ConnectionPoint[] = [
                        { x: x, y: y - 10 }, // Connection point 1
                        { x: x, y: y + 10 }, // Connection point 2
                ];
                super(x, y, connectionPoints);
                this.isClosed = isClosed;
        }
        toggle() {
                this.isClosed = !this.isClosed;
                this.draw();
        }

        draw() {
                this.clear();
                // draw a small toggle switch at the given x,y position
                this.roundRect(this.x - 10, this.y - 10, this.x + 10, this.y + 10);

                this.fill(this.isClosed ? 0x00ff00 : 0x000000);
                globalThis.app.stage.addChild(this);
        }
}
