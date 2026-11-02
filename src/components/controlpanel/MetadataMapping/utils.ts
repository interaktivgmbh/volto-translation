import React, { useEffect } from 'react';

// Enter in an input of the control panel would submit the whole form.
export const onEnter = (action: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    action();
  }
};

// the shape semantic-ui passes to the onChange of an input
export type InputData = { value?: unknown };

const FOCUSABLE =
  'input:not([disabled]):not([type="file"]), button:not([disabled])';

// semantic-ui's modals leave the focus where it was: move it into the dialog
// when it opens and back to where it came from when it closes
export function useDialogFocus(open: boolean, dialogSelector: string): void {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.activeElement as HTMLElement | null;
    // the dialog renders in a portal, after this effect
    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector(dialogSelector)
        ?.querySelector<HTMLElement>(FOCUSABLE)
        ?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      // the element may be gone, e.g. the button of a removed column
      if (previous && document.body.contains(previous)) {
        previous.focus();
      }
    };
  }, [open, dialogSelector]);
}

// the attributes semantic-ui's modals lack to be announced as a dialog
export const dialogProps = (titleId: string) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': titleId,
});
