import "./index.css";
import { bootstrap } from "./bootstrap";
import { Application } from "pixi.js";
import { Wire } from "./wire";
import { Circuit } from "./circuit";
import { Battery } from "./battery";
import { LED } from "./LED";
import { Switch } from "./switch";

declare global {
  var app: Application;
}

const main = async () => {
  // Initialize the application and store it in the global scope
  globalThis.app = await bootstrap();

  // Create components
  const battery = new Battery(100, 100, 1.5);
  // const led = new LED(400, 100);
  const switchComponent = new Switch(250, 100);

  // Create wires and connect components
  // Positive terminal of battery (index 0) to one side of switch (index 0)
  const wire1 = new Wire(battery, switchComponent, 0, 0);

  // Other side of switch (index 1) to anode of LED (index 0)
  // const wire2 = new Wire(switchComponent, led, 1, 0);
  // Cathode of LED (index 1) to negative terminal of battery (index 1)
  // const wire3 = new Wire(led, battery, 1, 1);

  const circuit = new Circuit();

  // Add components and wires to the circuit
  circuit.addElement(battery);
  circuit.addElement(switchComponent);
  // circuit.addElement(led);
  circuit.addElement(wire1);
  // circuit.addElement(wire2);
  // circuit.addElement(wire3);

  // Draw all elements
  circuit.drawElements();
};

main();
