import { Sprite } from 'pixi.js';
import { Component, ConnectionPoint } from './component';

export class Switch extends Component {
  isClosed: boolean;
  rectWidth = 150;
  rectHeight = 50;
  #sprite: Sprite;

  constructor(x: number, y: number, isClosed: boolean = false) {
    super({ x, y });

    this.isClosed = isClosed;

    this.#sprite = new Sprite(globalThis.sprites.switchOn);
    this.#sprite.x = x;
    this.#sprite.y = y;
    this.#sprite.scale.set(0.7);

    // need to do this at construction time
    // so future Components (e.g. wire draw) can connect to it
    const { width, height } = this.#sprite.getSize();
    this.setConnectionPoints([
      // the sprite unfortunately doesn't sit flush
      { x: this.x + 20, y: this.y + height - 18 },
      // the sprite unfortunately doesn't sit flush
      { x: this.x + width - 18, y: this.y + height - 18 },
    ]);

    // add click listener
    this.#sprite.interactive = true;
    this.#sprite.on('pointerdown', () => {
      this.toggle();
    });
  }
  toggle() {
    this.isClosed = !this.isClosed;
    this.#sprite.texture = this.isClosed
      ? globalThis.sprites.switchOn
      : globalThis.sprites.switchOff;
  }

  draw() {
    globalThis.app.stage.addChild(this);
    globalThis.app.stage.addChild(this.#sprite);
  }
}
