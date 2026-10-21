import { useState, useCallback } from 'react';
import { callTutor, TutorError, type TutorRequestType } from '../services/tutorService';
import { useAuthStore } from '../store/authStore';
import { getRealmForNode, NODES } from '../data/curriculum';

interface TutorState {
  response: string | null;
  loading: boolean;
  error: string | null;
}

interface UseTutorReturn extends TutorState {
  ask: (topicId: string, type: TutorRequestType) => Promise<void>;
  clear: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: 'Your API key looks incorrect. Ask a parent to update it in Settings.',
  RATE_LIMITED: 'You\'ve asked a lot of questions! Take a breather and try again in a moment.',
  NETWORK: 'No internet connection. Check your Wi-Fi and try again.',
  UNKNOWN: 'The oracle is momentarily silent. Try again shortly.',
};

export function useTutor(): UseTutorReturn {
  const apiKey = useAuthStore(s => s.apiKey);
  const [state, setState] = useState<TutorState>({
    response: null,
    loading: false,
    error: null,
  });

  const ask = useCallback(async (topicId: string, type: TutorRequestType) => {
    if (!apiKey) {
      setState({ response: null, loading: false, error: 'No API key found. Please sign in.' });
      return;
    }
    const node = NODES.find(n => n.id === topicId);
    if (!node) return;
    const realm = getRealmForNode(node);

    setState({ response: null, loading: true, error: null });
    try {
      const text = await callTutor({
        topicLabel: node.label,
        topicDescription: node.d,
        realmName: realm.name,
        requestType: type,
        apiKey,
      });
      setState({ response: text, loading: false, error: null });
    } catch (err) {
      const code = err instanceof TutorError ? err.code : 'UNKNOWN';
      setState({
        response: null,
        loading: false,
        error: ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN,
      });
    }
  }, [apiKey]);

  const clear = useCallback(() => {
    setState({ response: null, loading: false, error: null });
  }, []);

  return { ...state, ask, clear };
}
