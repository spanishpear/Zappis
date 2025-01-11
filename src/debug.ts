import { Graphics, Container, Text, TextStyle, type Application } from 'pixi.js';

export const DebugState = {
  enabled: false,
};

export function createDebugButton(app: Application) {
  const button = new Container();
  const graphics = new Graphics();
  graphics.fill(0x000000);
  graphics.rect(0, 0, 100, 50);
  button.addChild(graphics);

  // Button text
  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    stroke: { color: 'red', width: 5, join: 'round' },
  });

  const text = new Text({
    text: 'Debug: OFF',
    style: style,
  });

  text.x = 10;
  text.y = 15;
  button.addChild(text);

  // Interactivity
  button.interactive = true;
  button.on('pointerdown', () => {
    DebugState.enabled = !DebugState.enabled;
    text.text = DebugState.enabled ? 'Debug: ON' : 'Debug: OFF';
    console.clear()
  });

  // Position the button
  button.x = 10;
  button.y = 10;

  // Add to the stage
  app.stage.addChild(button);
}
