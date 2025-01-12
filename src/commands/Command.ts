/**
 * Interface for all commands in the circuit editor
 */
export interface ICommand {
  execute(): void;
  undo(): void;
  redo(): void;
}

/**
 * Base class for commands that provides default redo implementation
 */
export abstract class Command implements ICommand {
  abstract execute(): void;
  abstract undo(): void;
  
  redo(): void {
    this.execute();
  }
}

/**
 * Command that can be composed of multiple sub-commands
 */
export class CompositeCommand implements ICommand {
  private commands: ICommand[] = [];

  constructor(commands: ICommand[] = []) {
    this.commands = commands;
  }

  addCommand(command: ICommand): void {
    this.commands.push(command);
  }

  execute(): void {
    this.commands.forEach(command => command.execute());
  }

  undo(): void {
    // Create a shallow copy and reverse it to undo commands in reverse order
    [...this.commands].reverse().forEach(command => command.undo());
  }

  redo(): void {
    this.commands.forEach(command => command.redo());
  }
} 