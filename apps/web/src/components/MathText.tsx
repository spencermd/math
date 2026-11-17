import { Fragment, type ReactNode } from 'react';

// Problem text is plain strings with the math written inline: "Angle A measures (3x + 50)°". This sets
// the math properly: an expression never breaks in the middle of a term, and variables are italic.

const NUMBER = String.raw`\d+(?:,\d{3})*(?:\.\d+)?`;
const SUPER = '[⁰¹²³⁴-⁹⁻ⁿ]*';
/** One term, with whatever is attached to it: brackets, a sign, a power, a degree or percent sign. */
const ATOM = String.raw`(?<![A-Za-z\d])[(\[]*[−-]?\$?(?:${NUMBER}[A-Za-z]{0,2}|[A-Za-z]|√(?:${NUMBER})?[A-Za-z]?|π)${SUPER}!?[)\]]*${SUPER}[°%]?(?![A-Za-z])`;
const OPERATOR = '[+−×÷=<>≤≥·/-]';
/**
 * Terms joined by operators, or by nothing at all before a bracket: n(n − 1)/2. A colon joins them only
 * as a ratio, "3 : 5" or "3:5"; after a label, "Total: 12", it is punctuation.
 */
const RUN = new RegExp(String.raw`${ATOM}(?:(?:\s*${OPERATOR}\s*|\s+:\s+|(?<=\d):(?=\d)|(?=\())${ATOM})+`, 'g');
/** A letter that stands alone in ordinary text and can only be a variable. */
const LONE_VARIABLE = /(?<![A-Za-z\d'’])[xyznk](?![A-Za-z\d'’])/g;

/** Italicise the variables in a piece of an expression: single letters, not units or words. */
function variables(text: string, pattern: RegExp, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    out.push(text.slice(last, match.index), <i className="math-var" key={`${key}-${match.index}`}>{match[0]}</i>);
    last = match.index + match[0].length;
  }
  out.push(text.slice(last));
  return out;
}

function expression(run: string, key: string): ReactNode[] {
  // A line may end before an operator but never straight after one, so "+ 50" stays in one piece.
  const glued = run.replace(new RegExp(String.raw`(${OPERATOR}|:)\s+`, 'g'), '$1 ');
  const out: ReactNode[] = [];
  let last = 0;
  for (const atom of glued.matchAll(new RegExp(ATOM, 'g'))) {
    out.push(glued.slice(last, atom.index));
    out.push(
      <span className="math-term" key={`${key}-${atom.index}`}>
        {variables(atom[0], /(?<![A-Za-z])[A-Za-z](?![A-Za-z])/g, `${key}-${atom.index}`)}
      </span>,
    );
    last = atom.index + atom[0].length;
  }
  out.push(glued.slice(last));
  return out;
}

/** Text with its inline math typeset. */
export function MathText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const run of text.matchAll(RUN)) {
    out.push(...variables(text.slice(last, run.index), LONE_VARIABLE, `t${last}`));
    out.push(...expression(run[0], `m${run.index}`));
    last = run.index + run[0].length;
  }
  out.push(...variables(text.slice(last), LONE_VARIABLE, `t${last}`));
  return <>{out.map((node, i) => <Fragment key={i}>{node}</Fragment>)}</>;
}
