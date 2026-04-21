import { RefreshCw } from 'lucide-react';
import type { BodyWeightReflectionSnapshot } from '../lib/reflection';

type BodyWeightReflectionCardProps = {
  snapshot: BodyWeightReflectionSnapshot | null;
  saving: boolean;
  onReflect: () => void;
};

const getContainerClass = (
  variant: BodyWeightReflectionSnapshot['variant'],
): string =>
  variant === 'strong'
    ? 'border-blue-200 bg-blue-50'
    : 'border-gray-200 bg-gray-50';

const getButtonClass = (
  variant: BodyWeightReflectionSnapshot['variant'],
): string =>
  variant === 'strong'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-slate-700 hover:bg-slate-800';

export function BodyWeightReflectionCard({
  snapshot,
  saving,
  onReflect,
}: BodyWeightReflectionCardProps) {
  if (!snapshot) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-4 shadow-sm ${getContainerClass(snapshot.variant)}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
            体重の反映
          </p>

          <p className="mt-2 text-base font-semibold text-gray-900">
            {snapshot.differenceLabel}
          </p>

          <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <div>{snapshot.latestWeightLabel}</div>
            <div>{snapshot.currentWeightLabel}</div>
          </div>

          {snapshot.variant === 'strong' && (
            <p className="mt-3 text-sm text-gray-600">{snapshot.helperLabel}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onReflect}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${getButtonClass(snapshot.variant)}`}
        >
          <RefreshCw size={16} />
          {saving ? '反映中...' : snapshot.ctaLabel}
        </button>
      </div>
    </div>
  );
}
