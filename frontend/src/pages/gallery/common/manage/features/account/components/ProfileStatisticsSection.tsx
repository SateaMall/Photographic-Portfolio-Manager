import { useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ManagedProfileMonthlyOpenCountResponse,
  ManagedProfileStatsResponse,
  ManagedProfileYearlyOpenCountResponse,
} from "../../../../../../../types/types";

type ProfileStatisticsSectionProps = {
  stats: ManagedProfileStatsResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

type ChartMode = "month" | "year";

type ChartPoint = {
  key: string;
  axisLabel: string;
  opens: number;
  tooltipLabel: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
};

const numberFormatter = new Intl.NumberFormat();
const monthAxisFormatter = new Intl.DateTimeFormat(undefined, { month: "short", year: "2-digit", timeZone: "UTC" });
const monthTooltipFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
const yearFormatter = new Intl.NumberFormat(undefined, { useGrouping: false });

function parseUtcMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function toMonthlyChartPoints(points: ManagedProfileMonthlyOpenCountResponse[]): ChartPoint[] {
  return points.map((point) => {
    const month = parseUtcMonth(point.month);
    return {
      key: point.month,
      axisLabel: monthAxisFormatter.format(month),
      opens: point.openCount,
      tooltipLabel: monthTooltipFormatter.format(month),
    };
  });
}

function toYearlyChartPoints(points: ManagedProfileYearlyOpenCountResponse[]): ChartPoint[] {
  return points.map((point) => ({
    key: String(point.year),
    axisLabel: yearFormatter.format(point.year),
    opens: point.openCount,
    tooltipLabel: yearFormatter.format(point.year),
  }));
}

function formatYAxisTick(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return numberFormatter.format(value);
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="manage-stats-tooltip">
      <p className="manage-stats-tooltip__label">{point.tooltipLabel}</p>
      <p className="manage-stats-tooltip__value">{numberFormatter.format(point.opens)} visits</p>
    </div>
  );
}

export function ProfileStatisticsSection({ stats, loading, refreshing, error }: ProfileStatisticsSectionProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("month");

  const monthlyPoints = useMemo(() => toMonthlyChartPoints(stats?.monthlyCounts ?? []), [stats?.monthlyCounts]);
  const yearlyPoints = useMemo(() => toYearlyChartPoints(stats?.yearlyCounts ?? []), [stats?.yearlyCounts]);
  const activePoints = chartMode === "month" ? monthlyPoints : yearlyPoints;

  return (
    <section className="manage-section" id="statistics">
      <div className="manage-section__header manage-section__header--stacked">
        <div>
          <h2 className="manage-section__title">Portfolio statistics</h2>
          <p className="manage-section__copy">Discover the traffic metrics across the full tracked period.</p>
        </div>
      </div>

      <div className="manage-card">
        {loading && <p className="manage-empty">Loading portfolio statistics...</p>}
        {!loading && error && <p className="manage-status manage-status--error">{error}</p>}

        {!loading && !error && stats && (
          <div className="manage-stats">
            <div className="manage-stats__summary">
              <article className="manage-stats__tile">
                <p className="manage-stats__eyebrow">All time</p>
                <p className="manage-stats__value">{numberFormatter.format(stats.totalOpens)}</p>
              </article>

              <article className="manage-stats__tile">
                <p className="manage-stats__eyebrow">Last 30 days</p>
                <p className="manage-stats__value">{numberFormatter.format(stats.opensLast30Days)}</p>
              </article>

              <article className="manage-stats__tile">
                <p className="manage-stats__eyebrow">Today</p>
                <p className="manage-stats__value">{numberFormatter.format(stats.opensToday)}</p>
              </article>
            </div>

            <div className="manage-stats__chart-card">
              <div className="manage-section__header manage-section__header--stacked">
                <div>
                  <h3 className="manage-section__title">Visits timeline</h3>
                  <p className="manage-section__copy">
                    {chartMode === "month"
                      ? "Monthly totals across the whole tracked period. Use the zoom brush below to focus on any range."
                      : "Yearly totals across the whole tracked period. Use the zoom brush below to focus on any range."}
                  </p>
                </div>

                <div className="manage-stats__toolbar">
                  <div className="manage-stats__toggle" role="tablist" aria-label="Statistics range selector">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chartMode === "month"}
                      className={`manage-button manage-button--compact ${chartMode === "month" ? "manage-button--secondary" : "manage-button--ghost"}`}
                      onClick={() => setChartMode("month")}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={chartMode === "year"}
                      className={`manage-button manage-button--compact ${chartMode === "year" ? "manage-button--secondary" : "manage-button--ghost"}`}
                      onClick={() => setChartMode("year")}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
              </div>

              <div className="manage-stats-chart" role="img" aria-label={`Chart showing ${chartMode === "month" ? "monthly" : "yearly"} portfolio visits`}>
                {refreshing && <p className="manage-stats__refreshing">Refreshing chart...</p>}

                <div className="manage-stats-chart__frame">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={activePoints} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
                      <XAxis
                        dataKey="axisLabel"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                        minTickGap={chartMode === "month" ? 18 : 12}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                        tickFormatter={formatYAxisTick}
                        width={48}
                      />
                      <Tooltip cursor={{ fill: "rgba(96, 165, 250, 0.08)" }} content={<CustomTooltip />} />
                      <Bar dataKey="opens" fill="#d0d665" radius={[10, 10, 0, 0]} maxBarSize={chartMode === "month" ? 28 : 42} />
                      {activePoints.length > 1 && (
                        <Brush
                          dataKey="axisLabel"
                          height={28}
                          stroke="#84883e"
                          travellerWidth={10}
                          fill="rgba(15, 23, 42, 0.95)"
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {activePoints.every((point) => point.opens === 0) && <p className="manage-empty">No portfolio visits have been recorded in this period yet.</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
