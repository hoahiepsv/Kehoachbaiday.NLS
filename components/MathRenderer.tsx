
import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content = '', className }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof content === 'string') {
      const parts = content.split(/(\$.*?\$)/g);
      containerRef.current.innerHTML = '';
      
      parts.forEach(part => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          const span = document.createElement('span');
          try {
            katex.render(math, span, { throwOnError: false, displayMode: false });
          } catch (e) {
            span.textContent = part;
          }
          containerRef.current?.appendChild(span);
        } else {
          const textNode = document.createTextNode(part);
          containerRef.current?.appendChild(textNode);
        }
      });
    } else if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, [content]);

  return <span ref={containerRef} className={className} />;
};

export default MathRenderer;
