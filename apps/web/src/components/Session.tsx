import type { ReactNode } from 'react';

interface Props {
  kicker: string;
  title: string;
  /** Accent colour for the screen. */
  color?: string;
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Full-screen frame for a run of problems outside a lesson: a review, a challenge, the placement quiz. */
export function Session({ kicker, title, color = 'var(--gold)', closeLabel = 'Back to the tree', onClose, children }: Props) {
  return (
    <div
      className="lesson"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ ['--realm' as string]: color, ['--realm-deep' as string]: color }}
    >
      <header className="lesson-head">
        <div>
          <p className="lesson-realm">{kicker}</p>
          <h2 className="lesson-title">{title}</h2>
        </div>
        <button className="btn-ghost" onClick={onClose}>{closeLabel}</button>
      </header>
      <main className="stage session-stage">{children}</main>
    </div>
  );
}

/** How far through the session the learner is. */
export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="session-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <span style={{ width: `${(done / total) * 100}%` }} />
    </div>
  );
}
