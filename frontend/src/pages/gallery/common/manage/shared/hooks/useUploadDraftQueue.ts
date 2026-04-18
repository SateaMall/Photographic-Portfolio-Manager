import { useEffect, useRef, useState } from "react";

import type { UploadPhotoDraft } from "../../../../../../types/types";
import { revokeUploadDrafts } from "../../features/photos/utils/photoUploadDrafts";

export function useUploadDraftQueue(initialDrafts: UploadPhotoDraft[] = []) {
  const [draftsState, setDraftsState] = useState<UploadPhotoDraft[]>(initialDrafts);
  const draftsRef = useRef<UploadPhotoDraft[]>(initialDrafts);

  useEffect(() => {
    draftsRef.current = draftsState;
  }, [draftsState]);

  useEffect(() => {
    return () => {
      revokeUploadDrafts(draftsRef.current);
    };
  }, []);

  function setDrafts(nextDrafts: UploadPhotoDraft[] | ((currentDrafts: UploadPhotoDraft[]) => UploadPhotoDraft[])) {
    setDraftsState((currentDrafts) => {
      const resolvedDrafts = typeof nextDrafts === "function" ? nextDrafts(currentDrafts) : nextDrafts;
      draftsRef.current = resolvedDrafts;
      return resolvedDrafts;
    });
  }

  function keepDraftsById(draftIds: Set<string>) {
    setDraftsState((currentDrafts) => {
      const successfulDrafts = currentDrafts.filter((draft) => !draftIds.has(draft.id));
      const failedDrafts = currentDrafts.filter((draft) => draftIds.has(draft.id));

      if (successfulDrafts.length > 0) {
        revokeUploadDrafts(successfulDrafts);
      }

      draftsRef.current = failedDrafts;
      return failedDrafts;
    });
  }

  function clearDrafts() {
    revokeUploadDrafts(draftsRef.current);
    draftsRef.current = [];
    setDraftsState([]);
  }

  return {
    clearDrafts,
    drafts: draftsState,
    keepDraftsById,
    setDrafts,
  };
}
