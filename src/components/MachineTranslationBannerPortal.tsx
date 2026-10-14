import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import MachineTranslationBanner from './MachineTranslationBanner';

// Volto 16 has no slots, so the banner cannot ask for the `aboveContent` one.
// It is mounted through appExtras instead — which Volto renders after the
// footer — and portals itself to the top of <main>, the spot `aboveContent`
// occupies in Volto 18. The mount node is created after hydration, so server
// and client render the same (nothing) on first pass.
const MachineTranslationBannerPortal = () => {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const main = document.querySelector('.content-area main');
    if (!main) {
      return undefined;
    }
    const node = document.createElement('div');
    node.className = 'machine-translation-banner-slot';
    main.prepend(node);
    setTarget(node);

    return () => {
      node.remove();
    };
  }, []);

  return target ? createPortal(<MachineTranslationBanner />, target) : null;
};

export default MachineTranslationBannerPortal;
