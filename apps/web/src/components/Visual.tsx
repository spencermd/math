import { MathText } from './MathText';
import { useState } from 'react';
import type { Visual } from '@mathtree/curriculum';

type Of<K extends Visual['kind']> = Extract<Visual, { kind: K }>;
type DotsProps = Of<'dots'>;
type LineProps = Of<'number-line'>;

/** Renders a lesson visual. Give it a `key` so its state resets when the visual changes. */
export function VisualView({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    case 'dots':
      return <Dots {...visual} />;
    case 'number-line':
      return <NumberLine {...visual} />;
    case 'rows':
      return <Rows {...visual} />;
    case 'area':
      return <Area {...visual} />;
    case 'pairs':
      return <Pairs {...visual} />;
    case 'slots':
      return <Slots {...visual} />;
    case 'divisor-grid':
      return <DivisorGrid {...visual} />;
    case 'venn':
      return <Venn {...visual} />;
    case 'fraction-bars':
      return <FractionBars {...visual} />;
    case 'figure':
      return <Figure {...visual} />;
  }
}

/** A geometric diagram, scaled to fit. */
function Figure({ box, shapes, grid, caption }: Of<'figure'>) {
  const [x0, y0, x1, y1] = box;
  const PADDING = 26;
  const scale = Math.min(300 / (x1 - x0), 240 / (y1 - y0));
  const W = (x1 - x0) * scale + 2 * PADDING;
  const H = (y1 - y0) * scale + 2 * PADDING;
  const X = (x: number) => PADDING + (x - x0) * scale;
  const Y = (y: number) => PADDING + (y1 - y) * scale;
  const cls = (fill?: 'shade' | 'erase', dashed?: boolean) =>
    `figure-shape${fill ? ` figure-${fill}` : ''}${dashed ? ' figure-dashed' : ''}`;
  const lines: number[][] = [];
  if (grid) {
    for (let x = Math.ceil(x0); x <= x1; x++) lines.push([X(x), Y(y0), X(x), Y(y1), x === 0 ? 1 : 0]);
    for (let y = Math.ceil(y0); y <= y1; y++) lines.push([X(x0), Y(y), X(x1), Y(y), y === 0 ? 1 : 0]);
  }

  return (
    <div className="visual">
      <div className="line-scroll">
        <svg className="figure" viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: '100%' }} role="img" aria-label={caption ?? 'Diagram'}>
          {lines.map(([a, b, c, d, axis], i) => (
            <line key={`g${i}`} x1={a} y1={b} x2={c} y2={d} className={axis ? 'figure-axis' : 'figure-grid'} />
          ))}
          {shapes.map((s, i) => {
            switch (s.type) {
              case 'polygon':
                return <polygon key={i} className={cls(s.fill, s.dashed)} points={s.points.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} />;
              case 'segment':
                return <line key={i} className={cls(undefined, s.dashed)} x1={X(s.from[0])} y1={Y(s.from[1])} x2={X(s.to[0])} y2={Y(s.to[1])} />;
              case 'circle':
                return <circle key={i} className={cls(s.fill, s.dashed)} cx={X(s.center[0])} cy={Y(s.center[1])} r={s.r * scale} />;
              case 'sector': {
                const rad = (deg: number) => (deg * Math.PI) / 180;
                const [cx, cy] = [X(s.center[0]), Y(s.center[1])];
                const r = s.r * scale;
                const [ax, ay] = [cx + r * Math.cos(rad(s.from)), cy - r * Math.sin(rad(s.from))];
                const [bx, by] = [cx + r * Math.cos(rad(s.to)), cy - r * Math.sin(rad(s.to))];
                const large = s.to - s.from > 180 ? 1 : 0;
                const arc = `M ${ax} ${ay} A ${r} ${r} 0 ${large} 0 ${bx} ${by}`;
                return <path key={i} className={cls(s.arcOnly ? undefined : s.fill)} d={s.arcOnly ? arc : `${arc} L ${cx} ${cy} Z`} />;
              }
              case 'point':
                return <circle key={i} className="figure-point" cx={X(s.at[0])} cy={Y(s.at[1])} r={3.5} />;
              case 'label':
                return <text key={i} className="figure-label" x={X(s.at[0])} y={Y(s.at[1])}>{s.text}</text>;
            }
          })}
        </svg>
      </div>
      {caption && <p className="visual-caption">{caption}</p>}
    </div>
  );
}

/** Two overlapping circles. Tap a region to see how many belong there. */
function Venn({ left, right, onlyLeft, both, onlyRight, outside }: Of<'venn'>) {
  const regions = [
    { key: 'left', x: 108, y: 112, count: onlyLeft, name: `${left} only` },
    { key: 'both', x: 180, y: 112, count: both, name: 'Both' },
    { key: 'right', x: 252, y: 112, count: onlyRight, name: `${right} only` },
    ...(outside === undefined ? [] : [{ key: 'outside', x: 334, y: 196, count: outside, name: 'Neither' }]),
  ];
  const [open, setOpen] = useState<string[]>([]);
  const allOpen = open.length === regions.length;
  const inside = onlyLeft + both + onlyRight;

  return (
    <div className="visual">
      <div className="line-scroll">
        <svg className="venn" viewBox="0 0 360 216" style={{ width: 360, maxWidth: 'none' }}>
          {outside !== undefined && <rect x={1} y={1} width={358} height={214} rx={12} className="venn-box" />}
          <circle cx={138} cy={112} r={76} className="venn-circle" />
          <circle cx={222} cy={112} r={76} className="venn-circle" />
          <text x={104} y={24} className="venn-name">{left}</text>
          <text x={256} y={24} className="venn-name">{right}</text>
          {regions.map(r => {
            const isOpen = open.includes(r.key);
            const toggle = () => setOpen(o => (isOpen ? o.filter(k => k !== r.key) : [...o, r.key]));
            return (
              <g
                key={r.key}
                className="venn-region"
                data-open={isOpen || undefined}
                role="button"
                tabIndex={0}
                aria-label={isOpen ? `${r.name}: ${r.count}` : `${r.name}: tap to see how many`}
                onClick={toggle}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                  }
                }}
              >
                <circle cx={r.x} cy={r.y} r={19} />
                <text x={r.x} y={r.y}>{isOpen ? r.count : '?'}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="visual-caption" aria-live="polite">
        {allOpen
          ? `${onlyLeft} + ${both} + ${onlyRight} = ${inside} in at least one group${outside === undefined ? '.' : `, and ${outside} in neither: ${inside + outside} in all.`}`
          : 'How many belong in each region? Decide, then tap to check.'}
      </p>
    </div>
  );
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Fractions as shaded bars. Recutting every bar into pieces of one size makes them directly comparable. */
function FractionBars({ bars }: Of<'fraction-bars'>) {
  const [recut, setRecut] = useState(false);
  const common = bars.reduce((l, bar) => (l / gcd(l, bar.den)) * bar.den, 1);

  return (
    <div className="visual">
      <div className="fraction-bars">
        {bars.map((bar, i) => {
          const den = recut ? common : bar.den;
          const num = (bar.num * den) / bar.den;
          return (
            <div key={i} style={{ display: 'contents' }}>
              <span className="fraction-label">{num}/{den}</span>
              <div className="fraction-bar" role="img" aria-label={`${num} of ${den} equal pieces shaded`}>
                {Array.from({ length: den }, (_, k) => (
                  <span key={k} className="fraction-piece" data-on={k < num || undefined} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="visual-caption" aria-live="polite">
        <button type="button" className="hop-btn" onClick={() => setRecut(r => !r)}>
          {recut ? 'Undo the cuts' : `Cut every bar into ${common} pieces`}
        </button>
        {recut ? 'Same shaded amounts, now in pieces of one size.' : 'Each bar is cut into its own size of piece.'}
      </p>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('en-US');
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const power = (base: number, exp: number) => `${base}${[...String(exp)].map(d => SUPERSCRIPT[Number(d)]).join('')}`;

/** Working shown a line at a time, so the learner can predict the next line before revealing it. */
function Rows({ rows }: Of<'rows'>) {
  const [shown, setShown] = useState(1);
  const done = shown >= rows.length;
  return (
    <div className="visual">
      <div className="rows">
        {rows.slice(0, shown).map((row, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <span className="row-label">{row.label}</span>
            <span className="row-text" data-last={(done && i === rows.length - 1) || undefined}><MathText text={row.text} /></span>
          </div>
        ))}
      </div>
      {rows.length > 1 && (
        <p className="visual-caption" aria-live="polite">
          <button type="button" className="hop-btn" onClick={() => setShown(n => n + 1)} disabled={done}>
            Next line
          </button>
          {!done && 'What comes next? Decide, then check.'}
          {shown > 1 && (
            <button type="button" className="link-btn" onClick={() => setShown(1)}>
              Start over
            </button>
          )}
        </p>
      )}
    </div>
  );
}

/** A rectangle cut into strips. Tap a strip to work out its area; the strips add up to the whole. */
function Area({ height, widths }: Of<'area'>) {
  const [open, setOpen] = useState<number[]>([]);
  const total = widths.reduce((a, b) => a + b, 0);
  const allOpen = open.length === widths.length;
  // Strips aren't drawn to scale: a 3-wide strip beside a 100-wide one would vanish.
  const grow = (w: number) => Math.sqrt(w);

  return (
    <div className="visual">
      <div className="area">
        <span />
        <div className="area-widths">
          {widths.map((w, i) => (
            <span key={i} className="area-width" style={{ flexGrow: grow(w), minWidth: 64 }}>{w}</span>
          ))}
        </div>
        <span className="area-height">{height}</span>
        <div className="area-strips">
          {widths.map((w, i) => {
            const isOpen = open.includes(i);
            return (
              <button
                key={i}
                type="button"
                className="area-strip"
                style={{ flexGrow: grow(w) }}
                data-open={isOpen || undefined}
                onClick={() => setOpen(o => (isOpen ? o.filter(x => x !== i) : [...o, i]))}
                aria-label={isOpen ? `${height} by ${w} strip, area ${height * w}` : `${height} by ${w} strip, tap for its area`}
              >
                {isOpen ? `${height} × ${w} = ${fmt(height * w)}` : '?'}
              </button>
            );
          })}
        </div>
      </div>
      <p className="visual-caption" aria-live="polite">
        {allOpen
          ? `${widths.map(w => fmt(height * w)).join(' + ')} = ${fmt(height * total)}, the same as ${height} × ${total}.`
          : 'Tap each piece to find its area.'}
      </p>
    </div>
  );
}

/** A run of whole numbers paired off from the two ends: every pair has the same sum. */
function Pairs({ from, to }: Of<'pairs'>) {
  const [made, setMade] = useState(0);
  const count = to - from + 1;
  const pairs = count / 2;
  const sum = from + to;
  const pairOf = (n: number) => Math.min(n - from, to - n);
  const hue = (pair: number) => 45 + pair * 67;

  return (
    <div className="visual">
      <div className="pairs">
        {Array.from({ length: count }, (_, k) => {
          const n = from + k;
          const paired = pairOf(n) < made;
          return (
            <span key={n} className="pair-chip" data-paired={paired || undefined} style={{ ['--hue' as string]: hue(pairOf(n)) }}>
              {n}
            </span>
          );
        })}
      </div>
      <div className="pair-sums">
        {Array.from({ length: made }, (_, k) => (
          <span key={k} style={{ ['--hue' as string]: hue(k) }}>
            {from + k} + {to - k} = {sum}
          </span>
        ))}
      </div>
      <p className="visual-caption" aria-live="polite">
        <button type="button" className="hop-btn" onClick={() => setMade(m => m + 1)} disabled={made >= pairs}>
          Pair the ends
        </button>
        {made >= pairs
          ? `${pairs} pairs, each adding to ${sum}: ${pairs} × ${sum} = ${fmt(pairs * sum)}.`
          : made > 0
            ? `${made} pair${made === 1 ? '' : 's'} so far, each adding to ${sum}.`
            : `${count} numbers to add.`}
        {made > 0 && (
          <button type="button" className="link-btn" onClick={() => setMade(0)}>
            Start over
          </button>
        )}
      </p>
    </div>
  );
}

/** A choice made in stages. Tap a slot to see how many options it has, and why. */
function Slots({ slots }: Of<'slots'>) {
  const [open, setOpen] = useState<number[]>([]);
  const allOpen = open.length === slots.length;
  const total = slots.reduce((n, slot) => n * slot.count, 1);

  return (
    <div className="visual">
      <div className="slots">
        {slots.map((slot, i) => {
          const isOpen = open.includes(i);
          return (
            <div className="slot" key={i}>
              <span className="slot-label">{slot.label}</span>
              <button
                type="button"
                className="slot-box"
                data-open={isOpen || undefined}
                onClick={() => setOpen(o => (isOpen ? o.filter(x => x !== i) : [...o, i]))}
                aria-label={isOpen ? `${slot.label}: ${slot.count} choices, ${slot.why}` : `${slot.label}: tap to see how many choices`}
              >
                {isOpen ? slot.count : '?'}
              </button>
              <span className="slot-why">{isOpen ? slot.why : ''}</span>
            </div>
          );
        })}
      </div>
      <p className="visual-caption" aria-live="polite">
        {allOpen
          ? `${slots.map(slot => slot.count).join(' × ')} = ${fmt(total)}`
          : 'How many choices for each slot? Decide, then tap to check.'}
      </p>
    </div>
  );
}

/** Every divisor of p^a × q^b, one per cell: rows choose the power of p, columns the power of q. */
function DivisorGrid({ p, a, q, b }: Of<'divisor-grid'>) {
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const n = p ** a * q ** b;

  return (
    <div className="visual">
      <div className="line-scroll">
        <table className="divisor-grid">
          <thead>
            <tr>
              <th />
              {Array.from({ length: b + 1 }, (_, j) => (
                <th key={j} scope="col">{power(q, j)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: a + 1 }, (_, i) => (
              <tr key={i}>
                <th scope="row">{power(p, i)}</th>
                {Array.from({ length: b + 1 }, (_, j) => (
                  <td key={j}>
                    <button
                      type="button"
                      className="divisor-cell"
                      data-picked={(picked?.[0] === i && picked?.[1] === j) || undefined}
                      onClick={() => setPicked([i, j])}
                    >
                      {p ** i * q ** j}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="visual-caption" aria-live="polite">
        {picked
          ? `${p ** picked[0] * q ** picked[1]} = ${power(p, picked[0])} × ${power(q, picked[1])}`
          : `${a + 1} rows × ${b + 1} columns = ${(a + 1) * (b + 1)} divisors of ${n}.`}
      </p>
    </div>
  );
}

/** Tap dots to count them; each shows the number it was given. */
function Dots({ groups, crossed = 0 }: DotsProps) {
  const [counted, setCounted] = useState<number[]>([]);
  const total = groups.reduce((a, b) => a + b, 0);
  const offsets = groups.map((_, g) => groups.slice(0, g).reduce((a, b) => a + b, 0));

  const toggle = (i: number) =>
    setCounted(c => (c.includes(i) ? c.filter(x => x !== i) : [...c, i]));

  return (
    <div className="visual">
      <div className="dots">
        {groups.map((size, g) => (
          <div className="dot-group" key={g}>
            {Array.from({ length: size }, (_, k) => {
              const i = offsets[g] + k;
              const gone = i >= total - crossed;
              const order = counted.indexOf(i);
              return (
                <button
                  key={i}
                  type="button"
                  className="count-dot"
                  data-counted={order >= 0 || undefined}
                  data-gone={gone || undefined}
                  disabled={gone}
                  onClick={() => toggle(i)}
                  aria-label={gone ? 'Taken away' : order >= 0 ? `Dot counted as ${order + 1}` : 'Dot, not counted yet'}
                >
                  {gone ? '×' : order >= 0 ? order + 1 : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="visual-caption" aria-live="polite">
        {counted.length ? `You've counted ${counted.length}.` : 'Tap each dot to count it.'}
        {counted.length > 0 && (
          <button type="button" className="link-btn" onClick={() => setCounted([])}>
            Start over
          </button>
        )}
      </p>
    </div>
  );
}

const GAP = 34;
const PAD = 22;
const BASE = 58;

/** Take the hops one at a time and watch where they land. */
function NumberLine({ min, max, start, hops }: LineProps) {
  const [taken, setTaken] = useState(0);
  const dir = Math.sign(hops);
  const total = Math.abs(hops);
  const x = (n: number) => PAD + (n - min) * GAP;
  const width = PAD * 2 + (max - min) * GAP;
  const at = start + dir * taken;

  return (
    <div className="visual">
      <div className="line-scroll">
        <svg
          className="number-line"
          viewBox={`0 0 ${width} 92`}
          style={{ width, maxWidth: 'none' }}
          role="img"
          aria-label={`Number line from ${min} to ${max}, now at ${at}`}
        >
          <line x1={PAD - 10} x2={width - PAD + 10} y1={BASE} y2={BASE} className="line-axis" />
          {Array.from({ length: max - min + 1 }, (_, k) => {
            const n = min + k;
            return (
              <g key={n}>
                <line x1={x(n)} x2={x(n)} y1={BASE - 6} y2={BASE + 6} className="line-axis" />
                <text x={x(n)} y={BASE + 26} className="line-label" data-here={n === at || undefined}>
                  {n}
                </text>
              </g>
            );
          })}
          {Array.from({ length: taken }, (_, k) => {
            const from = x(start + dir * k);
            const to = x(start + dir * (k + 1));
            return <path key={k} d={`M ${from} ${BASE} Q ${(from + to) / 2} ${BASE - 44} ${to} ${BASE}`} className="line-hop" />;
          })}
          <circle cx={x(start)} cy={BASE} r={5} className="line-start" />
          <circle cx={x(at)} cy={BASE} r={9} className="line-marker" />
        </svg>
      </div>
      <p className="visual-caption" aria-live="polite">
        <button type="button" className="hop-btn" onClick={() => setTaken(t => t + 1)} disabled={taken >= total}>
          {dir < 0 ? '← Hop back' : 'Hop →'}
        </button>
        {taken === 0 ? `Start at ${start}.` : `${taken} hop${taken === 1 ? '' : 's'}: now at ${at}.`}
        {taken > 0 && (
          <button type="button" className="link-btn" onClick={() => setTaken(0)}>
            Start over
          </button>
        )}
      </p>
    </div>
  );
}
