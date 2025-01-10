import './index.css';
import { bootstrap } from './bootstrap';
import { type Application, Assets } from 'pixi.js';
import { Wire } from './wire';
import { Circuit } from './circuit';
import { Battery } from './battery';
import { LED } from './LED';
import { Switch } from './switch';
import { createDebugButton } from './debug';
import type { GridSystem } from './gridSystem';

declare global {
  var app: Application;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  var sprites: Record<string, any>;
  var gridSystem: GridSystem;
}

const main = async () => {
  // Initialize the application and store it in the global scope
  globalThis.app = await bootstrap();
  globalThis.sprites = {
    battery: await Assets.load('sprites/battery.png'),
    switchOn: await Assets.load('sprites/switch-on.png'),
    switchOff: await Assets.load('sprites/switch-off.png'),
  };

  // Create components
  const battery = new Battery(250, 100, 1.5);
  const switchComponent = new Switch(850, 100);

  // Create wires and connect components
  // Positive terminal of battery (index 0) to one side of switch (index 0)
  const wire1 = new Wire(battery, switchComponent, 1, 0);

  const circuit = new Circuit();

  // Add components and wires to the circuit
  circuit.addElement(battery);
  circuit.addElement(switchComponent);
  circuit.addElement(wire1);

  // Draw all elements
  circuit.drawElements();
  createDebugButton();

  // Call drawConnectionPoints for debugging
  for (const element of circuit.elements) {
    element.drawConnectionPoints();
  }
};

main();
