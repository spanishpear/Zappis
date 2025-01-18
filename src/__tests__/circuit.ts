import { Circuit } from '../../src/circuit';
import { Battery } from '../../src/battery';
import { Switch } from '../../src/switch';
import { LED } from '../../src/LED';
import { Wire } from '../../src/wire';
import { setupSprites } from '../config/bootstrap';
import { Sprite } from 'pixi.js';
import { GridSystem } from '../gridSystem';

describe('Circuit Class', () => {
  let circuit: Circuit;

  // mock globalThis.sprites
  beforeEach(() => {
    globalThis.sprites = {
      battery: new Sprite(),
      switchOn: new Sprite(),
      switchOff: new Sprite(),
      ledOn: new Sprite(),
      ledOff: new Sprite(),
    };
    // mock global gridSystem
    globalThis.gridSystem = new GridSystem(1000, 1000);
    circuit = new Circuit();
  });

  test('should add components to the circuit', () => {
    const battery = new Battery(100, 100, 1.5);
    const switchComponent = new Switch(200, 100);
    const led = new LED(300, 100);

    circuit.addElement(battery);
    circuit.addElement(switchComponent);
    circuit.addElement(led);

    expect(circuit.elements.length).toBe(3);
    expect(circuit.elements).toContain(battery);
    expect(circuit.elements).toContain(switchComponent);
    expect(circuit.elements).toContain(led);
  });

  test('should calculate if the circuit is closed', () => {
    const battery = new Battery(100, 100, 1.5);
    const switchComponent = new Switch(200, 100);
    const led = new LED(300, 100);
    const wire1 = new Wire(battery, switchComponent, 1, 0);
    const wire2 = new Wire(switchComponent, led, 0, 0);
    const wire3 = new Wire(led, battery, 1, 0);

    circuit.addElement(battery);
    circuit.addElement(switchComponent);
    circuit.addElement(led);
    circuit.addElement(wire1);
    circuit.addElement(wire2);
    circuit.addElement(wire3);

    expect(circuit.calculateIsCircuitClosed()).toBe(true);

    // Disable the switch and check again
    switchComponent.isEnabled = false;
    expect(circuit.calculateIsCircuitClosed()).toBe(false);
  });

  test('should return the current path of the circuit', () => {
    const battery = new Battery(100, 100, 1.5);
    const switchComponent = new Switch(200, 100);
    const led = new LED(300, 100);
    const wire1 = new Wire(battery, switchComponent, 1, 0);
    const wire2 = new Wire(switchComponent, led, 0, 0);
    const wire3 = new Wire(led, battery, 1, 0);

    circuit.addElement(battery);
    circuit.addElement(switchComponent);
    circuit.addElement(led);
    circuit.addElement(wire1);
    circuit.addElement(wire2);
    circuit.addElement(wire3);
    circuit.calculateIsCircuitClosed();
    const path = circuit.getCircuitPath();

    expect(path.length).toBeGreaterThan(0);
    // assert that the path is battery switch led battery
    // don't asssert the component itself, as they change instances
    // assert that the path is battery switch led battery
    expect(path[0]?.component).toBeInstanceOf(Battery);
    expect(path[1]?.component).toBeInstanceOf(Switch);
    expect(path[2]?.component).toBeInstanceOf(LED);
    expect(path[3]?.component).toBeInstanceOf(Battery);
  });
});
