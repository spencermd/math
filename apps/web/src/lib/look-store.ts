import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_AVATAR, type Avatar } from './avatar';

/**
 * The learner's character and how the site behaves around them. Kept apart from progress
 * (`mathtree-progress-v2`), so dressing up can never disturb saved progress, and Reset leaves the character alone.
 * Nothing here identifies anyone: there is no name, only a creature and an outfit.
 */
interface LookState {
  avatar: Avatar;
  /** Chimes and splashes. Off until someone turns it on, so a classroom stays quiet. */
  sound: boolean;
  /** The glow, dragon and bucket of water after an answer. */
  effects: boolean;
  /** The phoenix guide's speech bubble is folded away. */
  phoenixQuiet: boolean;
  setAvatar: (avatar: Partial<Avatar>) => void;
  setSound: (on: boolean) => void;
  setEffects: (on: boolean) => void;
  setPhoenixQuiet: (quiet: boolean) => void;
}

const suffix = process.env.NEXT_PUBLIC_STORAGE_SUFFIX ?? '';

export const useLook = create<LookState>()(
  persist(
    set => ({
      avatar: DEFAULT_AVATAR,
      sound: false,
      effects: true,
      phoenixQuiet: false,
      setAvatar: avatar => set(s => ({ avatar: { ...s.avatar, ...avatar } })),
      setSound: sound => set({ sound }),
      setEffects: effects => set({ effects }),
      setPhoenixQuiet: phoenixQuiet => set({ phoenixQuiet }),
    }),
    {
      name: `mathtree-look-v1${suffix}`,
      skipHydration: true,
      partialize: ({ avatar, sound, effects, phoenixQuiet }) => ({ avatar, sound, effects, phoenixQuiet }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<LookState>;
        return { ...current, ...saved, avatar: { ...DEFAULT_AVATAR, ...saved.avatar } };
      },
    },
  ),
);
