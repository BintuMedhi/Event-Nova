'use client';

import { useEffect, useRef, useState } from 'react';

// Easing for smooth following
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Use refs for tracking to avoid re-renders
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);
  const isTouchDevice = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect touch devices
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice.current) return;

    // Show cursor only after first movement
    const onFirstMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      ringPos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      window.removeEventListener('mousemove', onFirstMove);
    };
    window.addEventListener('mousemove', onFirstMove);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !cursorRef.current) return;

      const tagName = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      const isClickable = tagName === 'a' || tagName === 'button' || role === 'button' || target.closest('a') || target.closest('button');
      const isInput = tagName === 'input' || tagName === 'textarea';
      
      // Clear previous states
      cursorRef.current.classList.remove('is-hover', 'is-text', 'is-interactive');

      if (isInput) {
        cursorRef.current.classList.add('is-text');
      } else if (isClickable) {
        cursorRef.current.classList.add('is-hover');
      } else if (target.closest('.interactive-map') || target.closest('.seat-map')) {
        cursorRef.current.classList.add('is-interactive');
      }
    };

    const onMouseOut = () => {
      if (!cursorRef.current) return;
      // We don't remove classes immediately on mouseout to prevent flickering,
      // it gets overwritten by the next mouseover anyway.
    };

    const render = () => {
      if (dotRef.current && ringRef.current) {
        // Dot tracks instantly (1:1)
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;

        // Ring follows smoothly with lerp
        ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.25);
        ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.25);
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      requestRef.current = requestAnimationFrame(render);
    };

    // Start loop and attach listeners
    requestRef.current = requestAnimationFrame(render);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', onFirstMove);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  if (isTouchDevice.current) return null;

  return (
    <div
      ref={cursorRef}
      id="custom-cursor-container"
      className={`fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
