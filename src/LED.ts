import { Component, type ConnectionPoint } from './component';

export class LED extends Component {
  isOn: boolean;
  constructor(x: number, y: number) {
    const connectionPoints: ConnectionPoint[] = [
      { x: x, y: y - 5 }, // Anode
      { x: x, y: y + 5 }, // Cathode
    ];
    super(x, y, connectionPoints);
    this.isOn = true;

    // TODO - draw the LED
    this.clear();
    this.circle(this.x, this.y, 10);
    this.fill(this.isOn ? 0xff0000 : 0x000000);
  }

  toggle() {
    this.isOn = !this.isOn;
    this.draw();
  }

  powerOn() {
    this.isOn = true;
  }

  powerOff() {
    this.isOn = false;
  }

  draw() {
    globalThis.app.stage.addChild(this);
  }
}
