import { Application, Assets } from 'pixi.js';
import { GridSystem } from '../gridSystem';
import { createDebugButton } from '../debug';

export const bootstrap = async () => {
  // Create a new application
  const appInstance = new Application();

  const background =
    process.env.NODE_ENV === 'development' ? '#1099bb' : undefined;

  // Initialize the application
  await appInstance.init({ background, resizeTo: window });

  // Initialize grid system
  globalThis.gridSystem = new GridSystem(window.innerWidth, window.innerHeight);

  // Append the application canvas to the document body
  document.body.appendChild(appInstance.canvas);

  createDebugButton(appInstance);

  // Initialize the application and store it in the global scope
  globalThis.app = appInstance;
  globalThis.sprites = {
    battery: await Assets.load('sprites/battery.png'),
    switchOn: await Assets.load('sprites/switch-on.png'),
    switchOff: await Assets.load('sprites/switch-off.png'),
    ledOn: await Assets.load('sprites/led_on.png'),
    ledOff: await Assets.load('sprites/led_off.png'),
  };
};
