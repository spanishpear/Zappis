import { Graphics } from "pixi.js";
import { Component } from "./component";

type Coords = { startX: number; startY: number; endX: number; endY: number };

export class Wire extends Component {
  constructor({
    coords,
    width = 15,
    color = "0x000000",
  }: {
    coords: Coords;
    width?: number;
    color?: string;
  }) {
    // create a new graphics object
    super();

    // move the graphics object to the start of the line
    super.moveTo(coords.startX, coords.startY);
    super.lineTo(coords.endX, coords.endY);

    // draw the line
    super.stroke({ width, color });
  }

  /*
   * Add the line to the stage
   */
  draw() {
    globalThis.app.stage.addChild(this);
  }
}
