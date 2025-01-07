import { Application } from 'pixi.js';

export const bootstrap = async () => {
  // Create a new application
  const appInstance = new Application();

  const background =
    process.env.NODE_ENV === 'development' ? '#1099bb' : undefined;

  // Initialize the application
  await appInstance.init({ background, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(appInstance.canvas);

  return appInstance;
};
