import { Application } from 'pixi.js';
import { GridSystem } from './gridSystem';
import { createDebugButton } from './debug';

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


  return appInstance;
};
