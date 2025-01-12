import { Sprite } from 'pixi.js';
import { Component } from './component';
import type { ComponentMetadata } from './registry/ComponentRegistry';

export class LED extends Component {
  isOn: boolean;
  #sprite: Sprite;

  constructor(x: number, y: number) {
    // Ensure sprites are available
    if (!globalThis.sprites?.ledOn || !globalThis.sprites?.ledOff) {
      throw new Error('LED sprites not loaded');
    }

    // Create sprite first to get dimensions
    const sprite = new Sprite(globalThis.sprites.ledOn);
    sprite.scale.set(0.6);
    sprite.anchor.set(0.5);
    sprite.angle = 270;
    const { width, height } = sprite.getSize();

    // Create metadata
    const metadata: ComponentMetadata = {
      type: 'led',
      displayName: 'LED',
      width,
      height,
      connectionPoints: [
        // Positive terminal (top)
        { relativeX: width / 2, relativeY: -20 },
        // Negative terminal (bottom)
        { relativeX: width / 2, relativeY: 20 },
      ],
    };

    // Initialize base component with metadata and position
    super(metadata, { x, y });

    // Store instance properties
    this.#sprite = sprite;
    this.#sprite.position.set(x, y);
    this.isOn = true;

    // Configure interactivity
    this.#sprite.interactive = true;
    this.#sprite.on('pointerdown', () => {
      this.toggle();
    });
  }

  toggle(): void {
    this.isOn = !this.isOn;
    this.#sprite.texture = this.isOn
      ? globalThis.sprites.ledOn
      : globalThis.sprites.ledOff;
  }

  override draw(): void {
    globalThis.app.stage.addChild(this.#sprite);
    this.drawConnectionPoints();
  }
}
