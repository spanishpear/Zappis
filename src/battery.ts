import { Sprite } from 'pixi.js';
import { Component } from './component';
import type { ComponentMetadata } from './registry/ComponentRegistry';

export class Battery extends Component {
  voltage: number;
  #sprite: Sprite;
  #scalingFactor = 1;

  constructor(x: number, y: number, voltage: number) {
    // Ensure sprite is available
    if (!globalThis.sprites?.battery) {
      throw new Error('Battery sprite not loaded');
    }

    // Create sprite first to get dimensions
    const sprite = new Sprite(globalThis.sprites.battery);
    sprite.scale.set(1); // Reset scale to get base dimensions
    const { width, height } = sprite.getSize();

    // Create metadata
    const metadata: ComponentMetadata = {
      type: 'battery',
      displayName: 'Battery',
      width,
      height,
      connectionPoints: [
        // left side / negative terminal
        { relativeX: 0, relativeY: height / 2 },
        // right side / positive terminal
        { relativeX: width, relativeY: height / 2 },
      ],
    };

    // Initialize base component with metadata and position
    super(metadata, { x, y });

    // Store instance properties
    this.#sprite = sprite;
    this.#sprite.scale.set(this.#scalingFactor);
    this.#sprite.position.set(x, y);
    this.voltage = voltage;
  }

  override draw(): void {
    // draw a basic battery at the given x,y position
    globalThis.app.stage.addChild(this.#sprite);
    // add the connection points
    this.drawConnectionPoints();
  }
}
