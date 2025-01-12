import { Sprite } from 'pixi.js';
import { Component } from './component';
import type { ComponentMetadata } from './registry/ComponentRegistry';

export class Switch extends Component {
  isEnabled: boolean;
  #sprite: Sprite;

  constructor(x: number, y: number, isEnabled = true) {
    // Ensure sprites are available
    if (!globalThis.sprites?.switchOn || !globalThis.sprites?.switchOff) {
      throw new Error('Switch sprites not loaded');
    }

    // Create sprite first to get dimensions
    const sprite = new Sprite(globalThis.sprites.switchOn);
    sprite.scale.set(0.7); // Set scale to match existing behavior
    const { width, height } = sprite.getSize();

    // Create metadata
    const metadata: ComponentMetadata = {
      type: 'switch',
      displayName: 'Switch',
      width,
      height,
      connectionPoints: [
        // left side connection
        { relativeX: 20, relativeY: height - 18 },
        // right side connection
        { relativeX: width - 18, relativeY: height - 18 },
      ],
    };

    // Initialize base component with metadata and position
    super(metadata, { x, y });

    // Store instance properties
    this.#sprite = sprite;
    this.#sprite.position.set(x, y);
    this.isEnabled = isEnabled;

    // Configure interactivity
    this.#sprite.interactive = true;
    this.#sprite.cursor = 'pointer';
    this.#sprite.on('pointerdown', () => {
      this.toggle();
    });
  }

  toggle(): void {
    this.isEnabled = !this.isEnabled;
    this.#sprite.texture = this.isEnabled
      ? globalThis.sprites.switchOn
      : globalThis.sprites.switchOff;
  }

  override draw(): void {
    globalThis.app.stage.addChild(this.#sprite);
    this.drawConnectionPoints();
  }
}
