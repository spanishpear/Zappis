import { Component } from "./component";

export class Wire extends Component {
  constructor(
    startComponent: Component,
    endComponent: Component,
    startIdx: number,
    endIdx: number,
    width = 15,
    color = "0x000000",
  ) {
    // no connection points or x/y coordinates
    super();

    const start = startComponent.connectionPoints[startIdx];
    const end = endComponent.connectionPoints[endIdx];
    console.log(start, end);
    this.moveTo(start.x, start.y);
    this.lineTo(end.x, end.y);
    this.stroke({ width, color });

    // Establish the connection
    startComponent.connectTo(startIdx, endComponent, endIdx);
  }

  draw(): void {
    globalThis.app.stage.addChild(this);
  }
}
