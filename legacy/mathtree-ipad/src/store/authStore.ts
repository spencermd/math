import { create } from 'zustand';
import { getApiKey, saveApiKey, deleteApiKey } from '../services/secureStorage';

interface AuthState {
  apiKey: string | null;
  isHydrated: boolean;
  setKey: (key: string) => Promise<void>;
  clearKey: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  apiKey: null,
  isHydrated: false,

  setKey: async (key) => {
    await saveApiKey(key);
    set({ apiKey: key.trim() });
  },

  clearKey: async () => {
    await deleteApiKey();
    set({ apiKey: null });
  },

  hydrate: async () => {
    const key = await getApiKey();
    set({ apiKey: key, isHydrated: true });
  },
}));
