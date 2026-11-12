const memoryTokens = new Map<string, { token: string; oneTimeView: boolean }>();

const STORAGE_PREFIX = 'inkflow_private_unlock_';

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function setPrivateUnlockToken(
  postId: string,
  token: string,
  oneTimeView: boolean,
  aliases?: { slug?: string; shareToken?: string },
  privateLockType?: string
): void {
  if (!postId || !token) return;

  const isTransient = oneTimeView || privateLockType === 'PIN';
  const keys = [postId];
  if (aliases?.slug) keys.push(`slug:${aliases.slug}`);
  if (aliases?.shareToken) keys.push(`share:${aliases.shareToken}`);

  for (const key of keys) {
    memoryTokens.set(key, { token, oneTimeView: isTransient });
  }

  if (typeof window !== 'undefined') {
    try {
      for (const key of keys) {
        if (isTransient) {
          // Never persist unlock tokens across reloads for PIN-locked or one-time view stories
          window.sessionStorage.removeItem(storageKey(key));
        } else {
          window.sessionStorage.setItem(storageKey(key), token);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
}

export function getPrivateUnlockToken(
  postId?: string,
  aliases?: { slug?: string; shareToken?: string }
): string | undefined {
  const candidateKeys: string[] = [];
  if (postId) candidateKeys.push(postId);
  if (aliases?.slug) candidateKeys.push(`slug:${aliases.slug}`);
  if (aliases?.shareToken) candidateKeys.push(`share:${aliases.shareToken}`);

  for (const key of candidateKeys) {
    const mem = memoryTokens.get(key);
    if (mem?.token) return mem.token;
  }

  if (typeof window !== 'undefined') {
    try {
      for (const key of candidateKeys) {
        const stored = window.sessionStorage.getItem(storageKey(key));
        if (stored) {
          memoryTokens.set(key, { token: stored, oneTimeView: false });
          return stored;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  return undefined;
}

export function getPrivateUnlockHeaders(
  postId?: string,
  explicitToken?: string,
  aliases?: { slug?: string; shareToken?: string }
): Record<string, string> {
  const token = explicitToken || getPrivateUnlockToken(postId, aliases);
  return token ? { 'x-private-unlock-token': token } : {};
}

export function getUnlockHeaders(
  postId?: string,
  shareToken?: string,
  explicitToken?: string
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (shareToken) {
    headers['x-share-token'] = shareToken;
  }
  const token =
    explicitToken ||
    getPrivateUnlockToken(postId, shareToken ? { shareToken } : undefined);
  if (token) {
    headers['x-private-unlock-token'] = token;
  }
  return headers;
}

export function clearPrivateUnlockToken(
  postId?: string,
  aliases?: { slug?: string; shareToken?: string }
): void {
  const keys: string[] = [];
  if (postId) keys.push(postId);
  if (aliases?.slug) keys.push(`slug:${aliases.slug}`);
  if (aliases?.shareToken) keys.push(`share:${aliases.shareToken}`);

  for (const key of keys) {
    memoryTokens.delete(key);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(storageKey(key));
      } catch {
        // Ignore storage errors
      }
    }
  }
}
