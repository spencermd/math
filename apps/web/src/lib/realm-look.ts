import type { RealmId } from '@mathtree/curriculum';

/**
 * How each realm of the tree looks and who lives there. The math stays in `@mathtree/curriculum`;
 * this is only the story and scenery around it, so it can change freely without touching progress.
 */
export interface RealmLook {
  /** The land's name, shown with the math name: "Fox Hollow · Number Sense". */
  land: string;
  /** Who keeps this realm. */
  creature: string;
  /** The keeper's emblem. */
  emblem: string;
  /** Little things scattered through the realm's part of the canopy. */
  motifs: string[];
  /** What the phoenix says when you fly into the realm. */
  intro: string;
}

export const REALM_LOOK: Record<RealmId, RealmLook> = {
  1: {
    land: 'Fox Hollow',
    creature: 'foxes',
    emblem: '🦊',
    motifs: ['🍂', '🍁', '✦'],
    intro: 'Fox Hollow! The foxes know every shortcut. Here you learn to calculate cleverly instead of grinding.',
  },
  2: {
    land: "Wizards' Spire",
    creature: 'wizards',
    emblem: '🧙',
    motifs: ['✶', '🔮', '📜'],
    intro: "The Wizards' Spire, where every story turns into an equation, and every equation into a spell you can undo.",
  },
  3: {
    land: 'Gnome Burrows',
    creature: 'gnomes',
    emblem: '🍄',
    motifs: ['🍄', '💎', '🌱'],
    intro: 'The Gnome Burrows. Gnomes count their treasure without counting one coin at a time. So will you.',
  },
  4: {
    land: 'Witchwood',
    creature: 'witches',
    emblem: '🔮',
    motifs: ['🌙', '🕯️', '🎲'],
    intro: 'Witchwood, where the witches brew chance itself. Measure it by counting everything that can happen.',
  },
  5: {
    land: "Dragon's Roost",
    creature: 'dragons',
    emblem: '🐉',
    motifs: ['🔥', '🥚', '✦'],
    intro: "Dragon's Roost. Dragons hoard primes the way others hoard gold. Find the hidden structure of whole numbers.",
  },
  6: {
    land: 'Fairy Ring',
    creature: 'fairies',
    emblem: '🧚',
    motifs: ['✨', '🌸', '◯'],
    intro: 'The Fairy Ring, where circles and triangles dance. Look for the figure hiding inside the figure.',
  },
};
