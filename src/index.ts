import './index.css';
import { bootstrap } from './bootstrap';
import { type Application, Assets } from 'pixi.js';
import { Wire } from './wire';
import { Circuit } from './circuit';
import { Battery } from './battery';
import { LED } from './LED';
import { Switch } from './switch';
import { createDebugButton, DebugState } from './debug';
import { CircuitSimulation } from './simulation';
import type { GridSystem } from './gridSystem';

declare global {
  var app: Application;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  var sprites: Record<string, any>;
  var gridSystem: GridSystem;
  var simulation: CircuitSimulation;
  var circuit: Circuit;
}

const main = async () => {
  // Initialize the application and store it in the global scope
  globalThis.app = await bootstrap();
  globalThis.sprites = {
    battery: await Assets.load('sprites/battery.png'),
    switchOn: await Assets.load('sprites/switch-on.png'),
    switchOff: await Assets.load('sprites/switch-off.png'),
    ledOn: await Assets.load('sprites/led_on.png'),
    ledOff: await Assets.load('sprites/led_off.png'),
  };

  // ================================
  // Create components
  // ================================
  const battery = new Battery(850, 100, 1.5);
  const switchComponent = new Switch(850, 600);
  const ledComponent = new LED(600, 400);

  // Create wires and connect components
  const wires = [
    new Wire(battery, switchComponent, 1, 1),
    new Wire(switchComponent, ledComponent, 0, 1),
    new Wire(ledComponent, battery, 0, 0),
  ];

  const circuit = new Circuit();

  // Add components and wires to the circuit
  circuit.addElement(battery);
  circuit.addElement(switchComponent);
  circuit.addElement(ledComponent);
  for (const wire of wires) {
    circuit.addElement(wire);
  }

  circuit.drawElements();


  // ================================
  // Simulation setup and loop
  // ================================
  circuit.calculateIsCircuitClosed();
  console.log('Circuit is closed:', circuit.getIsCircuitClosed());

  // Initialize simulation
  globalThis.simulation = new CircuitSimulation(circuit);
  globalThis.circuit = circuit;
  // Start electron flow if circuit is closed
  if (circuit.getIsCircuitClosed()) {
    console.log('Circuit is closed, starting electron flow');
    globalThis.simulation.startFlow();
  }

};

main();
