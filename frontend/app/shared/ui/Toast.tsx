import { AlertCircle, CheckCircle2 } from 'lucide-react';

type ToastTone = 'success' | 'error';

type ToastProps = {
  message: string;
  tone: ToastTone;
};

const TOAST_TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-amber-200 bg-amber-50 text-amber-900',
};

export function Toast({ message, tone }: ToastProps) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={tone === 'success' ? 'status' : 'alert'}
      aria-live={tone === 'success' ? 'polite' : 'assertive'}
      className={`pointer-events-none fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${TOAST_TONE_CLASS[tone]}`}
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="text-sm font-medium leading-6">{message}</p>
    </div>
  );
}
