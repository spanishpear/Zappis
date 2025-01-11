import type { Circuit } from './circuit';
import { Graphics, Ticker } from 'pixi.js';
import type { Component } from './component';
import { SmartWire } from './routing/SmartWire';

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
  private readonly ELECTRON_SPEED = 0.001;
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
        if (!(element instanceof SmartWire)) return false;
        return (
          element.connectionPoints.some(
            (point) => point.connectedComponent === current.component,
          ) &&
          element.connectionPoints.some(
            (point) => point.connectedComponent === next.component,
          )
        );
      }) as SmartWire | undefined;

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
    for (let i = 0; i < this.ELECTRON_COUNT; i++) {
      const electron = new Electron();
      electron.currentIndex = Math.floor(
        (i * this.wirePoints.length) / this.ELECTRON_COUNT,
      );
      this.positionElectron(electron);
      this.electrons.push(electron);
      globalThis.app.stage.addChild(electron);
    }
  }

  private positionElectron(electron: Electron) {
    const point = this.wirePoints[electron.currentIndex];
    if (point) {
      electron.position.set(point.x, point.y);
    }
  }

  private updateElectrons() {
    if (!this.isFlowing) return;

    this.electrons.forEach((electron) => {
      electron.progress += this.ELECTRON_SPEED;
      if (electron.progress >= 1) {
        electron.progress = 0;
        electron.currentIndex++;
        if (electron.currentIndex >= this.wirePoints.length) {
          electron.currentIndex = 0;
        }
      }

      const currentPoint = this.wirePoints[electron.currentIndex];
      const nextPoint =
        this.wirePoints[
          (electron.currentIndex + 1) % this.wirePoints.length
        ];

      if (currentPoint && nextPoint) {
        const x =
          currentPoint.x +
          (nextPoint.x - currentPoint.x) * electron.progress;
        const y =
          currentPoint.y +
          (nextPoint.y - currentPoint.y) * electron.progress;
        electron.position.set(x, y);
      }
    });
  }
}
