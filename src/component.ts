import { Graphics } from "pixi.js";

// I really wish I could do FP stuff here
// helpme.jpg
export abstract class Component extends Graphics {
  abstract draw(): void;
}
