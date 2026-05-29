import type { LearnSession, StartSessionInput } from "@/lib/api/learn";

/**
 * Client-held learning session (Option A).
 *
 * The backend returns the full `items[]` (with HMAC-signed prompts) once from
 * `POST /v1/me/learn/session` and offers no GET-by-id to refetch. So the
 * session is stashed in `sessionStorage` right after creation and read back by
 * the player route. It survives client navigation and an in-tab refresh; a
 * cold load in a new tab finds nothing and the player shows a restart prompt.
 */
export type StoredSession = {
  /** Original request — lets the player start "another round" with the same params. */
  input: StartSessionInput;
  session: LearnSession;
  translationLang: string | null;
};

const PREFIX = "learn-session:";

function key(sessionId: string): string {
  return `${PREFIX}${sessionId}`;
}

export function saveSession(stored: StoredSession): void {
  try {
    sessionStorage.setItem(key(stored.session.sessionId), JSON.stringify(stored));
  } catch {
    // Storage may be unavailable (private mode, quota) — non-fatal; the
    // player will fall back to its restart prompt.
  }
}

export function loadSession(sessionId: string): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(key(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(sessionId: string): void {
  try {
    sessionStorage.removeItem(key(sessionId));
  } catch {
    // ignore
  }
}
