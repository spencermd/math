import { TUTOR_SYSTEM_PROMPT } from '../data/tutorPrompt';

const API_URL = 'https://api.anthropic.com/v1/messages';
// Haiku: fast + affordable — ideal for interactive kids' sessions
const MODEL = 'claude-haiku-3-5-20241022';

export type TutorRequestType = 'explain' | 'problems';

export interface TutorRequest {
  topicLabel: string;
  topicDescription: string;
  realmName: string;
  requestType: TutorRequestType;
  apiKey: string;
}

export class TutorError extends Error {
  constructor(
    public readonly code: 'INVALID_KEY' | 'RATE_LIMITED' | 'NETWORK' | 'UNKNOWN',
    message: string,
  ) {
    super(message);
    this.name = 'TutorError';
  }
}

export async function callTutor(req: TutorRequest): Promise<string> {
  const userMessage = [
    `Topic: ${req.topicLabel}`,
    `Realm: ${req.realmName}`,
    `Description: ${req.topicDescription}`,
    `Request: ${req.requestType}`,
  ].join('\n');

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: TUTOR_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
  } catch {
    throw new TutorError('NETWORK', 'No connection. Check your internet and try again.');
  }

  if (!response.ok) {
    type APIErr = { error?: { message?: string } };
    const err = await response.json().catch(() => ({}) as APIErr) as APIErr;
    const msg = err?.error?.message ?? `Error ${response.status}`;
    if (response.status === 401) throw new TutorError('INVALID_KEY', msg);
    if (response.status === 429) throw new TutorError('RATE_LIMITED', msg);
    throw new TutorError('UNKNOWN', msg);
  }

  type APIResponse = { content: Array<{ text: string }> };
  const data = await response.json() as APIResponse;
  return data.content[0].text;
}
