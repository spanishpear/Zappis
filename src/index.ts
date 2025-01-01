import "./index.css";
import { bootstrap } from "./bootstrap";
import { Application } from "pixi.js";
import { Wire } from "./wire";
import { Circuit } from "./circuit";

declare global {
  var app: Application;
}

const main = async () => {
  // Initialize the application and store it in the global scope
  globalThis.app = await bootstrap();

  const circuit = new Circuit();

  const wire1 = new Wire({
    coords: { startX: 600, startY: 200, endX: 1100, endY: 200 },
  });

  const wire2 = new Wire({
    coords: { startX: 1100, startY: 200, endX: 1100, endY: 550 },
  });

  circuit.addElement(wire1);
  circuit.addElement(wire2);

  circuit.drawElements();
};

main();
