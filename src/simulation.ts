import type { Circuit } from './circuit';
import { Graphics, Ticker } from 'pixi.js';
import type { Component } from './component';
import { Wire } from './wire';

interface Point {
  x: number;
  y: number;
}

class Electron extends Graphics {
  currentIndex = 0;
  progress = 0;

  constructor() {
    super();
    this.circle(0, 0, 5);
    this.fill(0xffff00); // Yellow color for visibility
  }
}

export class CircuitSimulation {
  private circuit: Circuit;
  private electrons: Electron[] = [];
  private isFlowing = false;
  private readonly ELECTRON_COUNT = 5;
  private readonly ELECTRON_SPEED = 0.1;
  private ticker: Ticker;
  private wirePoints: Point[] = [];

  constructor(circuit: Circuit) {
    this.circuit = circuit;
    this.ticker = new Ticker();
    this.ticker.add(this.updateElectrons.bind(this));
  }

  stopFlow() {
    this.isFlowing = false;
    this.electrons.forEach((electron) => {
      electron.visible = false;
    });
  }
  startFlow() {
    if (this.isFlowing || !this.circuit.getIsCircuitClosed()) return;

    // Calculate complete wire path
    this.wirePoints = this.calculateCompletePath();
    if (this.wirePoints.length < 2) return;

    this.isFlowing = true;
    // Essentially, we only want to initialize electrons if they haven't been initialized yet

    if (this.electrons.length === 0) {
      this.initializeElectrons();
    } else {
      this.electrons.forEach((electron) => {
        electron.visible = true;
      });
    }
    this.ticker.start();
  }

  private calculateCompletePath(): Point[] {
    const path = this.circuit.getCircuitPath();
    const points: Point[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      if (!current || !next) continue;

      // Find the wire connecting these components
      const wire = this.circuit.elements.find((element) => {
        if (!(element instanceof Wire)) return false;
        return (
          element.connectionPoints.some(
            (point) => point.connectedComponent === current.component,
          ) &&
          element.connectionPoints.some(
            (point) => point.connectedComponent === next.component,
          )
        );
      }) as Wire | undefined;

      if (wire) {
        const wirePoints = wire.getSegments();
        // If wire is reversed, reverse the points
        const currentComponentIndex = wire.connectionPoints.findIndex(
          (point) => point.connectedComponent === current.component,
        );
        points.push(
          ...(currentComponentIndex === 1
            ? [...wirePoints].reverse()
            : wirePoints),
        );
      }
    }

    return points;
  }

  private initializeElectrons() {
    const spacing = 1.0 / this.ELECTRON_COUNT;

    for (let i = 0; i < this.ELECTRON_COUNT; i++) {
      const electron = new Electron();
      electron.progress = i * spacing;
      this.electrons.push(electron);
      globalThis.app.stage.addChild(electron);
    }
  }

  private updateElectrons = () => {
    if (
      !this.circuit.calculateIsCircuitClosed() ||
      this.wirePoints.length < 2
    ) {
      this.stopFlow();
      return;
    }
    // isFlowing is set by stopFlow
    // so, on a given tick, if the above branch is false, then the circuit must be closed - and we should start the flow
    this.startFlow();

    // Basically for each tick
    this.electrons.forEach((electron) => {
      // Update progress
      electron.progress += this.ELECTRON_SPEED / 100;
      if (electron.progress >= 1) {
        electron.progress = 0;
      }

      // Find position along wire path
      const totalSegments = this.wirePoints.length - 1;
      const currentSegmentIndex = Math.floor(electron.progress * totalSegments);
      const nextSegmentIndex = Math.min(currentSegmentIndex + 1, totalSegments);

      const start = this.wirePoints[currentSegmentIndex];
      const end = this.wirePoints[nextSegmentIndex];

      if (!start || !end) return;

      // Calculate position within segment
      const segmentProgress = (electron.progress * totalSegments) % 1;
      const x = start.x + (end.x - start.x) * segmentProgress;
      const y = start.y + (end.y - start.y) * segmentProgress;

      // Update electron position
      electron.position.set(x, y);
    });
  };
}
