import { Application, Assets } from 'pixi.js';
import { GridSystem } from '../gridSystem';
import { createDebugButton } from '../debug';

export const setupSprites = async () => {
  globalThis.sprites = {
    battery: await Assets.load('sprites/battery.png'),
    switchOn: await Assets.load('sprites/switch-on.png'),
    switchOff: await Assets.load('sprites/switch-off.png'),
    ledOn: await Assets.load('sprites/led_on.png'),
    ledOff: await Assets.load('sprites/led_off.png'),
  };
};

export const bootstrap = async () => {
  // Create a new application
  const appInstance = new Application();

  const background =
    process.env.NODE_ENV === 'development' ? '#1099bb' : '#1d1e20';

  const embedWidth = 800;
  const embedHeight = 300;
  // create instance of application, and rescale the stage to the embed size
  await appInstance.init({
    width: embedWidth,
    height: embedHeight,
    background,
  });
  // somehow calculate the scale based on the embed size
  const scale = embedWidth / window.innerWidth;
  appInstance.stage.scale.set(0.4);

  // Initialize grid system
  globalThis.gridSystem = new GridSystem(embedWidth, embedHeight);

  // Append the application canvas to the document body
  document.body.appendChild(appInstance.canvas);

  createDebugButton(appInstance);

  // Initialize the application and store it in the global scope
  globalThis.app = appInstance;
  await setupSprites();
};
