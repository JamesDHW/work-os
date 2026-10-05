// React event props expect handlers that return nothing. This starts the async work from a handler and owns its promise;
// the actions it wraps report failures as messages instead of rejecting.
export const startAction =
  <Args extends readonly unknown[]>(action: (...args: Args) => Promise<void>): ((...args: Args) => void) =>
  (...args) => {
    void action(...args);
  };
