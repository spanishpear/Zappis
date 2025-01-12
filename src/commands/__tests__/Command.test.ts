import { Command, CompositeCommand, type ICommand } from '../Command';

// Mock command for testing
class MockCommand extends Command {
  public executed = false;
  public undone = false;
  public redone = false;

  execute(): void {
    this.executed = true;
  }

  undo(): void {
    this.undone = true;
  }

  override redo(): void {
    this.redone = true;
  }
}

describe('Command System', () => {
  describe('Command', () => {
    let command: MockCommand;

    beforeEach(() => {
      command = new MockCommand();
    });

    it('should execute command', () => {
      command.execute();
      expect(command.executed).toBe(true);
    });

    it('should undo command', () => {
      command.undo();
      expect(command.undone).toBe(true);
    });

    it('should redo command by calling execute', () => {
      command.redo();
      expect(command.redone).toBe(true);
    });
  });

  describe('CompositeCommand', () => {
    let composite: CompositeCommand;
    let command1: MockCommand;
    let command2: MockCommand;

    beforeEach(() => {
      command1 = new MockCommand();
      command2 = new MockCommand();
      composite = new CompositeCommand([command1, command2]);
    });

    it('should execute all commands in order', () => {
      composite.execute();
      expect(command1.executed).toBe(true);
      expect(command2.executed).toBe(true);
    });

    it('should undo all commands in reverse order', () => {
      composite.undo();
      expect(command2.undone).toBe(true);
      expect(command1.undone).toBe(true);
    });

    it('should redo all commands in original order', () => {
      composite.redo();
      expect(command1.redone).toBe(true);
      expect(command2.redone).toBe(true);
    });

    it('should allow adding new commands', () => {
      const command3 = new MockCommand();
      composite.addCommand(command3);
      
      composite.execute();
      expect(command3.executed).toBe(true);
    });

    it('should handle empty command list', () => {
      const emptyComposite = new CompositeCommand();
      // Should not throw errors
      emptyComposite.execute();
      emptyComposite.undo();
      emptyComposite.redo();
    });

    it('should maintain correct execution order with multiple commands', () => {
      const executionOrder: number[] = [];
      
      class OrderedCommand implements ICommand {
        constructor(private order: number) {}
        
        execute(): void {
          executionOrder.push(this.order);
        }
        
        undo(): void {
          executionOrder.push(-this.order);
        }
        
        redo(): void {
          this.execute();
        }
      }

      const composite = new CompositeCommand([
        new OrderedCommand(1),
        new OrderedCommand(2),
        new OrderedCommand(3),
      ]);

      composite.execute();
      expect(executionOrder).toEqual([1, 2, 3]);

      executionOrder.length = 0; // Clear array
      composite.undo();
      expect(executionOrder).toEqual([-3, -2, -1]);

      executionOrder.length = 0; // Clear array
      composite.redo();
      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });
}); 