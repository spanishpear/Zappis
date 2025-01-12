import { Application, Assets } from 'pixi.js';
import { GridSystem } from '../gridSystem';
import { createDebugButton } from '../debug';

export const setupSprites = async () => {
  // Load all sprites concurrently
  const sprites = await Promise.all([
    Assets.load('sprites/battery.png'),
    Assets.load('sprites/switch-on.png'),
    Assets.load('sprites/switch-off.png'),
    Assets.load('sprites/led_on.png'),
    Assets.load('sprites/led_off.png'),
  ]);

  // Assign loaded sprites to global object
  globalThis.sprites = {
    battery: sprites[0],
    switchOn: sprites[1],
    switchOff: sprites[2],
    ledOn: sprites[3],
    ledOff: sprites[4],
  };
};

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

  // Load sprites first and ensure they're available
  await setupSprites();

  // Verify sprites are loaded
  if (!globalThis.sprites?.battery || !globalThis.sprites?.switchOn || !globalThis.sprites?.ledOn) {
    throw new Error('Failed to load required sprites');
  }
};
