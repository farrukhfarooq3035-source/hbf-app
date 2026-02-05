'use client';

import { useRef, useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function RippleButton({ children, className = '', onClick, type = 'button', ...props }: RippleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++idRef.current;
      setRipples((r) => [...r, { x, y, id }]);
      setTimeout(() => setRipples((r) => r.filter((ri) => ri.id !== id)), 600);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </button>
  );
}
