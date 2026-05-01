import { useMemo, useState, type ReactNode } from 'react';
import {
  CalendarRange,
  Minus,
  RefreshCw,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useBodyWeightHistory } from '../hooks/useBodyWeightHistory';
import {
  BODY_WEIGHT_HISTORY_RANGE_OPTIONS,
  DEFAULT_BODY_WEIGHT_HISTORY_RANGE,
  buildBodyWeightHistoryStats,
  formatBodyWeightHistoryCompactDateLabel,
  formatBodyWeightHistoryDateLabel,
  formatBodyWeightHistoryWindowLabel,
  type BodyWeightHistoryStats,
  type BodyWeightHistoryWindow,
  type BodyWeightHistoryRange,
} from '../lib/history';
import { formatWeightDeltaKg, formatWeightKg } from '../lib/format';
import type { BodyWeightLog } from '../types';

type BodyWeightHistoryChartProps = {
  todayString: string;
  refreshToken?: number;
};

const SVG_WIDTH = 720;
const SVG_HEIGHT = 280;
const LEFT_MARGIN = 60;
const RIGHT_MARGIN = 24;
const TOP_MARGIN = 24;
const BOTTOM_MARGIN = 40;
const CHART_VERTICAL_PADDING = 8;
const CHART_GRID_LINE_COUNT = 4;
const MAX_TICK_LABEL_COUNT = 5;
const CHART_GRID_LINE_SEGMENTS = CHART_GRID_LINE_COUNT - 1;
const HISTORY_SUBTITLE =
  '今日を基準に、期間を切り替えて体重の変化を確認できます。';
const HISTORY_EMPTY_TITLE = 'この期間には体重記録がありません';
const HISTORY_EMPTY_DESCRIPTION =
  '期間を切り替えるか、体重を記録するとグラフが表示されます。';
const EMPTY_HISTORY_CAPTION = '記録がありません';

type ChartPoint = {
  x: number;
  y: number;
  weightKg: number;
  measuredOn: string;
};

type HistoryMetricCard = {
  key: string;
  label: string;
  value: string;
  caption: string;
  toneClass?: string;
  icon: ReactNode;
};

const getChangeToneClass = (changeKg: number): string => {
  if (changeKg > 0) {
    return 'text-amber-600';
  }

  if (changeKg < 0) {
    return 'text-emerald-600';
  }

  return 'text-slate-700';
};

const getChangeIcon = (changeKg: number) => {
  if (changeKg > 0) {
    return <TrendingUp size={18} className="text-amber-600" />;
  }

  if (changeKg < 0) {
    return <TrendingDown size={18} className="text-emerald-600" />;
  }

  return <Minus size={18} className="text-slate-500" />;
};

const getChangeLabel = (changeKg: number): string => {
  if (changeKg > 0) {
    return '増加';
  }

  if (changeKg < 0) {
    return '減少';
  }

  return '横ばい';
};

const MetricCard = ({
  label,
  value,
  caption,
  toneClass = 'text-slate-900',
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  toneClass?: string;
  icon: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </div>
        <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
        <div className="mt-1 text-sm text-slate-500">{caption}</div>
      </div>
      <div className="rounded-xl bg-slate-50 p-2 text-slate-500">{icon}</div>
    </div>
  </div>
);

const buildChartPoints = (
  logs: BodyWeightLog[],
  stats: BodyWeightHistoryStats,
  plotTop: number,
  plotBottom: number,
): ChartPoint[] => {
  const usableWidth = SVG_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  const usableHeight = plotBottom - plotTop;
  const weightRange = stats.maxWeightKg - stats.minWeightKg;

  return logs.map((log, index) => {
    const x =
      logs.length === 1
        ? LEFT_MARGIN + usableWidth / 2
        : LEFT_MARGIN + (usableWidth * index) / (logs.length - 1);
    const ratio =
      weightRange === 0
        ? 0.5
        : (log.weightKg - stats.minWeightKg) / weightRange;

    return {
      x,
      y: plotTop + (1 - ratio) * usableHeight,
      weightKg: log.weightKg,
      measuredOn: log.measuredOn,
    };
  });
};

const buildHistoryMetricCards = (
  stats: BodyWeightHistoryStats | null,
  historyWindow: BodyWeightHistoryWindow,
): HistoryMetricCard[] => {
  const startCaption = stats
    ? `${formatBodyWeightHistoryCompactDateLabel(historyWindow.startDate)} の体重`
    : EMPTY_HISTORY_CAPTION;
  const endCaption = stats
    ? `${formatBodyWeightHistoryCompactDateLabel(historyWindow.endDate)} の体重`
    : EMPTY_HISTORY_CAPTION;
  const changeCaption = stats
    ? getChangeLabel(stats.changeKg)
    : EMPTY_HISTORY_CAPTION;
  const averageCaption = stats
    ? `${stats.count}件の記録`
    : EMPTY_HISTORY_CAPTION;

  return [
    {
      key: 'start',
      label: '開始',
      value: stats ? `${formatWeightKg(stats.startWeightKg)}kg` : '—',
      caption: startCaption,
      icon: <Scale size={18} />,
    },
    {
      key: 'end',
      label: '終了',
      value: stats ? `${formatWeightKg(stats.endWeightKg)}kg` : '—',
      caption: endCaption,
      icon: <Scale size={18} />,
    },
    {
      key: 'change',
      label: '変化',
      value: stats ? formatWeightDeltaKg(stats.changeKg) : '—',
      caption: changeCaption,
      toneClass: stats ? getChangeToneClass(stats.changeKg) : 'text-slate-900',
      icon: stats ? getChangeIcon(stats.changeKg) : <TrendingUp size={18} />,
    },
    {
      key: 'average',
      label: '平均',
      value: stats ? `${formatWeightKg(stats.averageWeightKg)}kg` : '—',
      caption: averageCaption,
      icon: <Scale size={18} />,
    },
  ];
};

const buildTickIndices = (count: number): number[] => {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [0];
  }

  const desiredTickCount = Math.min(MAX_TICK_LABEL_COUNT, count);
  const step = (count - 1) / (desiredTickCount - 1);
  const indices = Array.from({ length: desiredTickCount }, (_, index) =>
    Math.round(index * step),
  );

  return Array.from(new Set(indices));
};

export function BodyWeightHistoryChart({
  todayString,
  refreshToken = 0,
}: BodyWeightHistoryChartProps) {
  const [range, setRange] = useState<BodyWeightHistoryRange>(
    DEFAULT_BODY_WEIGHT_HISTORY_RANGE,
  );
  const {
    logs,
    loading,
    error,
    reload,
    window: historyWindow,
  } = useBodyWeightHistory(
    todayString,
    range,
    refreshToken,
  );

  // 見切れ防止の余白だけを足し、縦軸の基準は実測の最小/最大に揃える。
  const plotTop = TOP_MARGIN + CHART_VERTICAL_PADDING;
  const plotBottom = SVG_HEIGHT - BOTTOM_MARGIN - CHART_VERTICAL_PADDING;
  const stats = useMemo(
    () => buildBodyWeightHistoryStats(logs),
    [logs],
  );
  const chartPoints = useMemo(
    () => (stats ? buildChartPoints(logs, stats, plotTop, plotBottom) : []),
    [logs, stats, plotTop, plotBottom],
  );
  const metricCards = useMemo(
    () => buildHistoryMetricCards(stats, historyWindow),
    [historyWindow, stats],
  );
  const tickIndices = useMemo(
    () => buildTickIndices(chartPoints.length),
    [chartPoints.length],
  );
  const chartPath = useMemo(() => {
    if (chartPoints.length === 0) {
      return {
        line: '',
        area: '',
      };
    }

    if (chartPoints.length === 1) {
      return {
        line: '',
        area: '',
      };
    }

    const line = chartPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    const area = `${line} L ${chartPoints[chartPoints.length - 1]!.x} ${plotBottom} L ${chartPoints[0]!.x} ${plotBottom} Z`;

    return {
      line,
      area,
    };
  }, [chartPoints, plotBottom]);

  const yAxisLabels = useMemo(() => {
    if (!stats) {
      return null;
    }

    return {
      max: formatWeightKg(stats.maxWeightKg),
      min: formatWeightKg(stats.minWeightKg),
    };
  }, [stats]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            <CalendarRange size={14} />
            Weight trend
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            体重の推移
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {HISTORY_SUBTITLE}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            表示期間: {formatBodyWeightHistoryWindowLabel(historyWindow)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
          {BODY_WEIGHT_HISTORY_RANGE_OPTIONS.map((option) => {
            const active = range === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setRange(option.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard
            key={card.key}
            label={card.label}
            value={card.value}
            caption={card.caption}
            toneClass={card.toneClass}
            icon={card.icon}
          />
        ))}
      </div>

      {loading ? (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 rounded-full bg-slate-200" />
            <div className="h-64 rounded-3xl bg-slate-100" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            <RefreshCw size={16} />
            再読み込み
          </button>
        </div>
      ) : stats === null ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Scale size={24} />
          </div>
          <h4 className="mt-4 text-lg font-semibold text-slate-900">
            {HISTORY_EMPTY_TITLE}
          </h4>
          <p className="mt-2 text-sm text-slate-600">
            {HISTORY_EMPTY_DESCRIPTION}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="h-[280px] w-full min-w-[640px]"
              role="img"
              aria-label="体重の推移グラフ"
            >
              <defs>
                <linearGradient id="body-weight-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
                <linearGradient id="body-weight-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {Array.from({ length: CHART_GRID_LINE_COUNT }, (_, index) => {
                const y = plotTop + ((plotBottom - plotTop) / CHART_GRID_LINE_SEGMENTS) * index;

                return (
                  <line
                    key={`grid-${index}`}
                    x1={LEFT_MARGIN}
                    x2={SVG_WIDTH - RIGHT_MARGIN}
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={index === 1 || index === 2 ? '4 6' : undefined}
                  />
                );
              })}

              <text
                x={8}
                y={plotTop + 4}
                className="fill-slate-400 text-[12px] font-medium"
              >
                {yAxisLabels?.max}kg
              </text>
              <text
                x={8}
                y={plotBottom + 4}
                className="fill-slate-400 text-[12px] font-medium"
              >
                {yAxisLabels?.min}kg
              </text>

              {chartPath.area && (
                <path d={chartPath.area} fill="url(#body-weight-area-gradient)" />
              )}

              {chartPath.line && (
                <path
                  d={chartPath.line}
                  fill="none"
                  stroke="url(#body-weight-line-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartPoints.map((point, index) => (
                <g key={point.measuredOn}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={index === chartPoints.length - 1 ? 6 : 4}
                    fill={index === chartPoints.length - 1 ? '#0f172a' : '#ffffff'}
                    stroke="#0ea5e9"
                    strokeWidth="3"
                  >
                    <title>
                      {`${formatBodyWeightHistoryCompactDateLabel(point.measuredOn)} ${formatWeightKg(point.weightKg)}kg`}
                    </title>
                  </circle>
                </g>
              ))}

              {tickIndices.map((tickIndex) => {
                const point = chartPoints[tickIndex];

                if (!point) {
                  return null;
                }

                const isFirst = tickIndex === 0;
                const isLast = tickIndex === chartPoints.length - 1;

                return (
                  <text
                    key={`tick-${point.measuredOn}`}
                    x={point.x}
                    y={SVG_HEIGHT - 12}
                    textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                    className="fill-slate-500 text-[12px] font-medium"
                  >
                    {formatBodyWeightHistoryDateLabel(point.measuredOn)}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{stats.count}件の記録</span>
            <span>{formatBodyWeightHistoryWindowLabel(historyWindow)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
