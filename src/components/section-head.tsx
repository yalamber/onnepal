import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  invert?: boolean;
}

export function SectionHead({ eyebrow, title, sub, invert }: Props) {
  return (
    <header className={`sec-head ${invert ? 'invert' : ''}`}>
      <div className="t-eyebrow">{eyebrow}</div>
      <h2 className="t-display sec-title">{title}</h2>
      {sub && <p className="sec-sub">{sub}</p>}
    </header>
  );
}
