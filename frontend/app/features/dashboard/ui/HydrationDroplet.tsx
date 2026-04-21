import { useId } from 'react';

type HydrationDropletProps = {
  valueMl: number;
  goalMl: number | null;
  size?: 'sm' | 'md';
};

const DROPLET_PATH =
  'M50 4 C43 15 33 28 24 40 C16 51 12 61 12 72 C12 92 28 106 50 106 C72 106 88 92 88 72 C88 61 84 51 76 40 C67 28 57 15 50 4 Z';

export function HydrationDroplet({
  valueMl,
  goalMl,
  size = 'md',
}: HydrationDropletProps) {
  const rawId = useId().replace(/:/g, '');
  const clipId = `hydration-clip-${rawId}`;
  const gradientId = `hydration-gradient-${rawId}`;

  const progress =
    goalMl && goalMl > 0
      ? Math.max(0, Math.min(valueMl / goalMl, 1))
      : valueMl > 0
        ? 0.18
        : 0;

  const fillTop = 104 - progress * 88;
  const containerSize =
    size === 'sm' ? 'h-[88px] w-[64px]' : 'h-[108px] w-[80px]';

  return (
    <div className={containerSize} aria-hidden="true">
      <svg
        viewBox="0 0 100 110"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="50" y1="18" x2="50" y2="106">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#1D9BF0" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={DROPLET_PATH} />
          </clipPath>
        </defs>

        <path
          d={DROPLET_PATH}
          fill="rgba(255,255,255,0.05)"
          stroke="#38BDF8"
          strokeWidth="5"
        />

        <g clipPath={`url(#${clipId})`}>
          <rect
            x="0"
            y={fillTop}
            width="100"
            height={110 - fillTop}
            fill={`url(#${gradientId})`}
            opacity={goalMl === null ? 0.72 : 1}
          />
          {progress > 0 && (
            <>
              <ellipse
                cx="50"
                cy={fillTop}
                rx="34"
                ry="5.5"
                fill="rgba(255,255,255,0.28)"
              />
              <circle
                cx="38"
                cy={Math.max(fillTop + 16, 44)}
                r="3.4"
                fill="rgba(255,255,255,0.24)"
              />
              <circle
                cx="61"
                cy={Math.max(fillTop + 28, 58)}
                r="2.5"
                fill="rgba(255,255,255,0.2)"
              />
            </>
          )}
        </g>

        <path
          d="M62 22 C69 31 80 46 82 60"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
