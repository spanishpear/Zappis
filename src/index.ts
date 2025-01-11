import './index.css';
import { bootstrap } from './config/bootstrap';
import { type Application, Assets } from 'pixi.js';
import type { Circuit } from './circuit';
import { CircuitSimulation } from './simulation';
import type { GridSystem } from './gridSystem';
import { circuitFromConfig, loadCircuitConfig } from './config/loadJson';

declare global {
  var app: Application;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  var sprites: Record<string, any>;
  var gridSystem: GridSystem;
  var simulation: CircuitSimulation;
  var circuit: Circuit;
}

const main = async () => {
  await bootstrap();

  // Load circuit from JSON file
  // TODO - make this dynamic from a dropdown, or from a file picker ?
  const config = await loadCircuitConfig('circuits/led_with_switch.json');
  const circuit = await circuitFromConfig(config);
  circuit.drawElements();

  // ================================
  // Simulation setup and loop
  // ================================
  circuit.calculateIsCircuitClosed();

  globalThis.simulation = new CircuitSimulation(circuit);
  globalThis.circuit = circuit;

  // Start electron flow if circuit is closed
  if (circuit.getIsCircuitClosed()) {
    console.log('Circuit is closed, starting electron flow');
    globalThis.simulation.startFlow();
  }
};

main();
