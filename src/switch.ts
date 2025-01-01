import { Component, ConnectionPoint } from "./component";

export class Switch extends Component {
        isClosed: boolean;
        rectWidth = 150;
        rectHeight = 50;

        constructor(x: number, y: number, isClosed: boolean = false) {
                const connectionPoints: ConnectionPoint[] = [
                        { x: x, y: y - 10 }, // Connection point 1
                        { x: x, y: y + 10 }, // Connection point 2
                ];
                super(x, y, connectionPoints);
                this.isClosed = isClosed;
                this.draw();
        }
        toggle() {
                this.isClosed = !this.isClosed;
                this.draw();
        }

        draw() {
                this.clear();
                // given the x-y of the top left corner of the rectangle
                // and the width and height of the rectangle
                // draw a rectangle
                this.rect(this.x, this.y, this.rectWidth, this.rectHeight);
                this.fill(this.isClosed ? 0x00ff00 : 0x000000);

                globalThis.app.stage.addChild(this);

                // AAAHHHHHHHHHHHHHHH hate this
                // TODO - figure out the right loop of when to create connection points?
                // now that we know the rectangle is drawn
                // calculate the connection points (left and right walls)
                // and draw them
                this.connectionPoints[0].x = this.x;
                this.connectionPoints[0].y = this.y + this.rectHeight / 2;
                this.connectionPoints[1].x = this.x + this.rectWidth;
                this.connectionPoints[1].y = this.y + this.rectHeight / 2;
                this.drawConnectionPoints();
        }
}
