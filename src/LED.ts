import { Sprite } from 'pixi.js';
import { Component, type ConnectionPoint } from './component';

export class LED extends Component {
  isOn: boolean;
  #sprite: Sprite;

  constructor(x: number, y: number) {
    super({x, y});
    this.isOn = true;
    this.#sprite = new Sprite(globalThis.sprites.ledOn);
    this.#sprite.x = x;
    this.#sprite.y = y;
    this.#sprite.scale.set(0.6);
    // this.#sprite.rotation = 0.01;
    const { width, height } = this.#sprite.getSize();

    this.setConnectionPoints([
      // the sprite unfortunately doesn't sit flush
      { x: this.getX() + 20, y: this.getY() + height - 18 },
      // the sprite unfortunately doesn't sit flush
      { x: this.getX() + width - 18, y: this.getY() + height - 18 },
    ]);

    this.#sprite.interactive = true;
    this.#sprite.on('pointerdown', () => {
      this.toggle();
    });
  }


  toggle() {
    this.isOn = !this.isOn;
    this.#sprite.texture = this.isOn ? globalThis.sprites.ledOn : globalThis.sprites.ledOff;
  }

  draw() {
    globalThis.app.stage.addChild(this);
    globalThis.app.stage.addChild(this.#sprite);
  }
}
