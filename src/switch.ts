import { Sprite } from 'pixi.js';
import { Component } from './component';

export class Switch extends Component {
  isEnabled: boolean;
  rectWidth = 150;
  rectHeight = 50;
  #sprite: Sprite;

  constructor(x: number, y: number, isEnabled = true) {
    super({ x, y });

    this.isEnabled = isEnabled;

    this.#sprite = new Sprite(globalThis.sprites.switchOn);
    this.#sprite.x = x;
    this.#sprite.y = y;
    // add cursor
    this.#sprite.cursor = 'pointer';

    // need to do this at construction time
    // so future Components (e.g. wire draw) can connect to it
    const { width, height } = this.#sprite.getSize();
    this.setConnectionPoints([
      // the sprite unfortunately doesn't sit flush
      { x: this.getX() + 20, y: this.getY() + height - 18 },
      // the sprite unfortunately doesn't sit flush
      { x: this.getX() + width - 18, y: this.getY() + height - 18 },
    ]);

    // add click listener
    this.#sprite.interactive = true;

    this.#sprite.on('pointerdown', () => {
      this.toggle();
    });
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.#sprite.texture = this.isEnabled
      ? globalThis.sprites.switchOn
      : globalThis.sprites.switchOff;
  }

  draw() {
    globalThis.app.stage.addChild(this);
    globalThis.app.stage.addChild(this.#sprite);
  }
}
