# Architecture

We make use of React, Typescript, and Pixi.js to create our codebase.

We have a base `Component` class that all other components inherit from. This `Component` class subsequently inherits `Graphics` from Pixi.js.
Though, it may not need to inherit from `Graphics` at all.

# Emulating wiring

Each component has a `connectionPoints` array. This array contains `ConnectionPoint` objects. Each `ConnectionPoint` has an `x` and `y` property, which is the coordinates of the connection point on the screen.

Currently, all of the components have two connection points, but future components (e.g. a transistor) will have more. We use these connection points to tell the `Wire` class which components to connect, and for the `Circuit` class to calculate the circuit.

This is far from the most elegant solution, and we should revisit this in the future.

# Grid system

We use a grid system to position our components. This mostly was added to avoid overlapping wires. It does the job for now, but has the drawback of not being able to position components exactly where we want them, or having strange turns/corners.
