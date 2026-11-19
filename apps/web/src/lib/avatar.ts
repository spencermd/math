/** A learner's character: a creature, dressed like an adventurer. All original, made of emoji and colour. */
export interface Avatar {
  creature: string;
  outfit: string;
  hat: string;
  cloak: string;
}

export interface Choice {
  id: string;
  label: string;
  icon: string;
}

export const CREATURES: Choice[] = [
  { id: 'fox', label: 'Fox', icon: '🦊' },
  { id: 'cat', label: 'Cat', icon: '🐈‍⬛' },
  { id: 'owl', label: 'Owl', icon: '🦉' },
  { id: 'snake', label: 'Snake', icon: '🐍' },
  { id: 'dragon', label: 'Dragon', icon: '🐲' },
  { id: 'wolf', label: 'Wolf', icon: '🐺' },
  { id: 'frog', label: 'Frog', icon: '🐸' },
  { id: 'bat', label: 'Bat', icon: '🦇' },
  { id: 'unicorn', label: 'Unicorn', icon: '🦄' },
  { id: 'fairy', label: 'Fairy', icon: '🧚' },
  { id: 'wizard', label: 'Wizard', icon: '🧙' },
  { id: 'elf', label: 'Dryad', icon: '🧝' },
  { id: 'merfolk', label: 'Water spirit', icon: '🧜' },
];

/** Adventuring classes, each with the one thing they carry. */
export const OUTFITS: Choice[] = [
  { id: 'wizard', label: 'Wizard', icon: '🪄' },
  { id: 'ranger', label: 'Ranger', icon: '🏹' },
  { id: 'knight', label: 'Knight', icon: '🛡️' },
  { id: 'rogue', label: 'Rogue', icon: '🗡️' },
  { id: 'bard', label: 'Bard', icon: '🎻' },
  { id: 'cleric', label: 'Cleric', icon: '✨' },
  { id: 'druid', label: 'Druid', icon: '🌿' },
  { id: 'alchemist', label: 'Alchemist', icon: '⚗️' },
];

export const HATS: Choice[] = [
  { id: 'none', label: 'No hat', icon: '' },
  { id: 'crown', label: 'Crown', icon: '👑' },
  { id: 'flowers', label: 'Flower crown', icon: '🌸' },
  { id: 'mushroom', label: 'Mushroom cap', icon: '🍄' },
  { id: 'tophat', label: 'Top hat', icon: '🎩' },
  { id: 'feather', label: 'Feather', icon: '🪶' },
  { id: 'star', label: 'Star', icon: '⭐' },
];

/** Cloak colours: muted, to sit in the dark fairy-core palette. */
export const CLOAKS: { id: string; label: string; color: string }[] = [
  { id: 'amethyst', label: 'Amethyst', color: '#5f4ca0' },
  { id: 'moss', label: 'Moss', color: '#4f6b3a' },
  { id: 'ember', label: 'Ember', color: '#9a5a34' },
  { id: 'midnight', label: 'Midnight', color: '#2f4a8a' },
  { id: 'rose', label: 'Rose', color: '#7a4a64' },
  { id: 'gold', label: 'Gold', color: '#b08a3a' },
  { id: 'teal', label: 'Teal', color: '#2c6f80' },
];

export const DEFAULT_AVATAR: Avatar = { creature: 'fox', outfit: 'wizard', hat: 'none', cloak: 'amethyst' };

const find = <T extends { id: string }>(list: T[], id: string) => list.find(c => c.id === id) ?? list[0];

/** The pieces to draw, falling back to defaults for anything unknown (say, a choice since retired). */
export function avatarParts(avatar: Avatar) {
  return {
    creature: find(CREATURES, avatar.creature),
    outfit: find(OUTFITS, avatar.outfit),
    hat: find(HATS, avatar.hat),
    cloak: find(CLOAKS, avatar.cloak),
  };
}
