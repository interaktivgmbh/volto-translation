import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders its children into Volto's toolbar. Only once mounted: on the server
// there is no toolbar node, and the first render in the browser must match the
// server's HTML, or React fails to hydrate the page. As an element of its own
// it is also a valid child of Semantic UI's Container, which a portal is not.
const ToolbarPortal = ({ children }: { children: React.ReactNode }) => {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setNode(document.getElementById('toolbar'));
  }, []);

  return node ? createPortal(children, node) : null;
};

export default ToolbarPortal;
