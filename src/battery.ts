import { Sprite } from 'pixi.js';
import { Component } from './component';

export class Battery extends Component {
  voltage: number;
  #sprite: Sprite;
  #scalingFactor = 1.1;

  constructor(x: number, y: number, voltage: number) {
    super({ x, y });
    this.#sprite = new Sprite(globalThis.sprites.battery);
    this.#sprite.x = x;
    this.#sprite.y = y;
    this.#sprite.scale.set(this.#scalingFactor);

    this.voltage = voltage;

    const { width, height } = this.#sprite.getSize();

    super.setConnectionPoints([
      // left side / negative terminal
      { x: this.getX(), y: this.getY() + height / 2 },
      // right side / positive terminal
      { x: this.getX() + width, y: this.getY() + height / 2 },
    ]);
  }

  draw() {
    // draw a basic battery at the given x,y position
    globalThis.app.stage.addChild(this.#sprite);
    // add the connection points
    globalThis.app.stage.addChild(this);
  }
}
