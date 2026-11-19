import { useEffect } from 'react';
import { useLook } from '@/lib/look-store';
import { playFizzle, playJingle } from '@/lib/sound';
import { AvatarBadge } from './Avatar';

export type FxKind = 'right' | 'wrong';

/**
 * What happens after an answer. Right: the answer glows and sparkles (and chimes, with sound on).
 * Wrong: the answer catches fire, a dragon pops up to blame, and your own character runs in with a bucket
 * of water to put it out. Purely decoration on top of the answer area: it never blocks a click.
 */
export function AnswerFx({ kind }: { kind: FxKind }) {
  const avatar = useLook(s => s.avatar);
  const sound = useLook(s => s.sound);

  useEffect(() => {
    if (!sound) return;
    if (kind === 'right') playJingle();
    else playFizzle();
  }, [kind, sound]);

  if (kind === 'right') {
    return (
      <div className="fx fx-right" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="fx-spark" style={{ ['--i' as string]: i }}>
            {i % 3 === 0 ? '✦' : i % 3 === 1 ? '✧' : '⋆'}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="fx fx-wrong" aria-hidden>
      <div className="fx-flames">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="fx-flame" style={{ ['--i' as string]: i }}>🔥</span>
        ))}
      </div>
      <span className="fx-dragon">🐉</span>
      <span className="fx-hero">
        <AvatarBadge avatar={avatar} size={44} />
        <span className="fx-bucket">🪣</span>
      </span>
      <span className="fx-splash">💦</span>
      <span className="fx-smoke">💨</span>
    </div>
  );
}

/** Whether to show answer effects at all: the learner's choice. Reduced motion is handled in CSS. */
export function useFxOn() {
  return useLook(s => s.effects);
}
