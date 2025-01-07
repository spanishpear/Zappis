import type { Component } from './component';

export class Circuit {
  elements: Component[] = [];

  /*
   * Basic constructor
   */
  constructor() {
    this.elements = [];
  }

  /*
   * Add an element to the circuit
   */
  addElement(element: Component) {
    this.elements.push(element);
  }

  /*
   * Draw all elements to the screen
   */
  drawElements() {
    this.elements.forEach((element) => element.draw());
  }
}
