'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollAnimateProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale' | 'blur';
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollAnimate({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, once]);

  const baseStyles: Record<string, { from: string; to: string }> = {
    'fade-up': {
      from: 'opacity-0 translate-y-8',
      to: 'opacity-100 translate-y-0',
    },
    'fade-in': {
      from: 'opacity-0',
      to: 'opacity-100',
    },
    'fade-left': {
      from: 'opacity-0 -translate-x-8',
      to: 'opacity-100 translate-x-0',
    },
    'fade-right': {
      from: 'opacity-0 translate-x-8',
      to: 'opacity-100 translate-x-0',
    },
    'scale': {
      from: 'opacity-0 scale-95',
      to: 'opacity-100 scale-100',
    },
    'blur': {
      from: 'opacity-0 blur-sm',
      to: 'opacity-100 blur-0',
    },
  };

  const style = baseStyles[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${isVisible ? style.to : style.from} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* Parallax component — moves children at a different scroll speed */
interface ParallaxProps {
  children: ReactNode;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  className?: string;
}

export function Parallax({ children, speed = -0.2, className = '' }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - windowHeight / 2;
      setOffset(distanceFromCenter * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
}
