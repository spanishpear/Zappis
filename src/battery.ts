import { Component, ConnectionPoint } from "./component";

export class Battery extends Component {
        voltage: number;
        #batteryWidth = 20;

        constructor(x: number, y: number, voltage: number) {
                const connectionPoints: ConnectionPoint[] = [
                        { x: x, y: y - 20 }, // Positive terminal
                        { x: x, y: y + 20 }, // Negative terminal
                ];
                super(x, y, connectionPoints);
                this.voltage = voltage;
        }

        draw() {
                // draw a basic battery at the given x,y position
                this.clear();
                this.roundRect(this.x - 10, this.y - 10, this.x + 10, this.y + 20);
                this.fill(0xff0000);
                globalThis.app.stage.addChild(this);
        }
}
