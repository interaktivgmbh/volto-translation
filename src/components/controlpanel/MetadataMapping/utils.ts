import type React from 'react';

// Enter in an input of the control panel would submit the whole form.
export const onEnter = (action: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    action();
  }
};

// the shape semantic-ui passes to the onChange of an input
export type InputData = { value?: unknown };
