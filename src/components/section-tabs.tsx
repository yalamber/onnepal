'use client';

import { useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

export function SectionTabs({ tabs, accentColor }: { tabs: Tab[]; accentColor: string }) {
  const [active, setActive] = useState<string>(tabs[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tabs]);

  return (
    <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200/60">
      <div className="flex gap-0 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={`relative flex-shrink-0 px-3.5 py-3 text-sm font-medium transition-colors ${
                isActive ? 'text-gray-950' : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
