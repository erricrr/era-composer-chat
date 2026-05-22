/** Maximum composers kept in the active chats list (header panel). */
export const MAX_ACTIVE_CHATS = 5;

export type ActiveChatListUpdate = {
  nextIds: string[];
  removedComposerId: string | null;
  isAlreadyActive: boolean;
  /** List was full (5) before this add. */
  wasAtCapacity: boolean;
  /** New composer brought the list to exactly the limit (4 → 5). */
  reachedCapacity: boolean;
  /** New 6th composer caused eviction from a full list (5 → 6, trimmed). */
  evictedDueToOverflow: boolean;
};

/**
 * Moves `composerId` to the front of the active list and enforces {@link MAX_ACTIVE_CHATS}.
 * Returns flags for which user-facing notifications to show.
 */
export function computeActiveChatListUpdate(
  prev: string[],
  composerId: string,
): ActiveChatListUpdate {
  const isAlreadyActive = prev.includes(composerId);
  const wasAtCapacity = prev.length === MAX_ACTIVE_CHATS;
  const ids = prev.filter((id) => id !== composerId);
  ids.unshift(composerId);

  let removedComposerId: string | null = null;
  if (ids.length > MAX_ACTIVE_CHATS) {
    removedComposerId = ids[MAX_ACTIVE_CHATS];
    ids.length = MAX_ACTIVE_CHATS;
  }

  const evictedDueToOverflow =
    wasAtCapacity && !isAlreadyActive && removedComposerId !== null;

  return {
    nextIds: ids,
    removedComposerId,
    isAlreadyActive,
    wasAtCapacity,
    reachedCapacity: ids.length === MAX_ACTIVE_CHATS && !isAlreadyActive,
    evictedDueToOverflow,
  };
}
