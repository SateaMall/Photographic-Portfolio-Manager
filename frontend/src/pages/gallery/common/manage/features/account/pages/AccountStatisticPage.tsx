import { fetchManagedProfileStats } from "../../../../../../../api/manage";
import type { ManagedProfileStatsResponse } from "../../../../../../../types/types";

import { readErrorMessage } from "../../../shared/utils/manageErrors";
import { useEffect, useState } from "react";
import { ProfileStatisticsSection } from "../components/ProfileStatisticsSection";
import { useManageAccess } from "../../../shared/hooks/useManageAccess";

export default function AccountStatisticPage() {
    const { authLoading, canManage, profileSlug } = useManageAccess();
    const [statsState, setStatsState] = useState<{
    slug: string;
    stats: ManagedProfileStatsResponse | null;
    error: string | null; } | null>(null);

    const [statsLoading, setStatsLoading] = useState(false);
    const currentStatsState = statsState?.slug === profileSlug ? statsState : null;
    const isStatsLoading = statsLoading && currentStatsState?.stats === null;
    const stats = currentStatsState?.stats ?? null;
    const statsError = currentStatsState?.error ?? null;

  useEffect(() => {
    if (authLoading || !canManage || !profileSlug) {
      return;
    }

    let cancelled = false;
    setStatsLoading(true);
    setStatsState((currentState) => (
      currentState?.slug === profileSlug
        ? { ...currentState, error: null }
        : { slug: profileSlug, stats: null, error: null }
    ));

    fetchManagedProfileStats(profileSlug)
      .then((stats) => {
        if (!cancelled) {
          setStatsState({ slug: profileSlug, stats, error: null });
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setStatsState({
            slug: profileSlug,
            stats: null,
            error: readErrorMessage(caughtError, "Failed to load your portfolio statistics."),
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, canManage, profileSlug]);

  return (
              <ProfileStatisticsSection
                stats={stats}
                loading={isStatsLoading}
                refreshing={statsLoading && currentStatsState?.stats !== null}
                error={statsError}
              />
    );
}