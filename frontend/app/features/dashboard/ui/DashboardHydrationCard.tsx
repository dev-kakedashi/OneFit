import { HydrationDroplet } from './HydrationDroplet';

type DashboardHydrationCardProps = {
  waterIntakeMl: number;
  targetWaterIntakeMl: number | null;
  remainingWaterIntakeMl: number | null;
};

export function DashboardHydrationCard({
  waterIntakeMl,
  targetWaterIntakeMl,
  remainingWaterIntakeMl,
}: DashboardHydrationCardProps) {
  const waterPercentage =
    targetWaterIntakeMl && targetWaterIntakeMl > 0
      ? Math.round((waterIntakeMl / targetWaterIntakeMl) * 100)
      : null;

  const waterProgressWidth =
    targetWaterIntakeMl && targetWaterIntakeMl > 0
      ? Math.min((waterIntakeMl / targetWaterIntakeMl) * 100, 100)
      : 0;

  const waterDescription =
    targetWaterIntakeMl === null
      ? '目標を設定すると達成状況を表示できます'
      : remainingWaterIntakeMl === 0
        ? '目標達成です'
        : `あと ${remainingWaterIntakeMl} ml`;

  return (
    <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-cyan-100">水分摂取量</div>

          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold text-white">
              {waterIntakeMl}
              {targetWaterIntakeMl !== null && (
                <>
                  <span className="mx-2 text-cyan-100/70">/</span>
                  {targetWaterIntakeMl}
                </>
              )}
            </span>
            <span className="pb-1 text-sm text-cyan-100">ml</span>
          </div>

          <p className="mt-2 text-sm text-cyan-50">{waterDescription}</p>

          {waterPercentage !== null && (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-all"
                  style={{ width: `${Math.max(0, waterProgressWidth)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-cyan-100">
                {waterPercentage}%
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center sm:justify-end">
          <HydrationDroplet
            valueMl={waterIntakeMl}
            goalMl={targetWaterIntakeMl}
          />
        </div>
      </div>
    </div>
  );
}
