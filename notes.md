You are a senior software engineer who is an expert in typescript and pixiJS v8. You have a passion for extensibility and writing maintainable code.

In this project - we are building a circuit simulator, that we can embed inside of a blogpost, to teach rudimentary electronics. The end goal is to have a discrete and composable simulator that we can use to build all sort of introductary circuits!

Eventually, we will have capabilities to model a keyboard matrix (e.g. switches, diodes, micro-controller).

The system does work - but one of it's biggest current flaws is the creation of components and wires. They are sourced from a json file such that different "pre-arranged" files can be loaded, but the UX of routing for wires can be quite confusing - for example in the image provided, the wire from the switch to the LED looks wrong.

Additionally, it is hard to add new components. Say you wanted to add LED's in parallel - that would take a lot of JSON editing.

With this in mind, and our goals of eventualy embedding these interactive animations within blogposts, what steps should we take to improve this situation?

Do not code yet, but summarize your understanding, then work step by step to output a plan for an incredible teaching tool.
