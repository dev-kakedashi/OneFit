import { Link } from 'react-router';
import type { DashboardCurrentPlan } from '../../dashboard/types';
import { buildBodyWeightGoalSnapshot } from '../lib/goal';
import { formatWeightKg } from '../lib/format';
import type { BodyWeightLog } from '../types';

type BodyWeightGoalCardProps = {
  plan: DashboardCurrentPlan | null;
  latestLog: BodyWeightLog | null;
  loading: boolean;
  error: string;
};

type BodyWeightGoalSnapshot = ReturnType<typeof buildBodyWeightGoalSnapshot>;

const getToneClass = (tone: BodyWeightGoalSnapshot['tone']): string => {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  if (tone === 'info') {
    return 'border-blue-200 bg-blue-50 text-blue-800';
  }

  return 'border-gray-200 bg-gray-50 text-gray-700';
};

export function BodyWeightGoalCard({
  plan,
  latestLog,
  loading,
  error,
}: BodyWeightGoalCardProps) {
  const snapshot = buildBodyWeightGoalSnapshot(plan, latestLog);
  const ctaClass =
    snapshot.tone === 'success'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : snapshot.tone === 'info'
        ? 'bg-blue-600 hover:bg-blue-700'
        : 'bg-gray-900 hover:bg-gray-800';

  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            {snapshot.title}
          </p>

          {loading ? (
            <p className="mt-2 text-sm text-gray-500">体重を読み込み中です...</p>
          ) : latestLog ? (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900">
                  {formatWeightKg(latestLog.weightKg)}kg
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getToneClass(snapshot.tone)}`}>
                  {snapshot.statusLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{snapshot.detailLabel}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {snapshot.statusLabel}
              </p>
              <p className="mt-1 text-sm text-gray-500">{snapshot.detailLabel}</p>
            </>
          )}

          {error && !loading && (
            <p className="mt-2 text-sm text-gray-500">{error}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link
            to={snapshot.ctaHref}
            className={`inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${ctaClass}`}
          >
            {snapshot.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
