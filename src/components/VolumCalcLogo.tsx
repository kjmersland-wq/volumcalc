import { cn } from "@/lib/utils";

type VolumCalcLogoProps = {
  className?: string;
  markClassName?: string;
  compact?: boolean;
};

export function VolumCalcMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-10", className)}
      fill="none"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" />
      <path
        d="m20 8 10 5.5v12L20 32 10 26V14l10-6Z"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m10 14 10 6 10-6M20 20v12M20 20 14 23.5"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VolumCalcLogo({ className, markClassName, compact = false }: VolumCalcLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <VolumCalcMark className={cn("text-primary", markClassName)} />
      {!compact && (
        <span className="text-xl font-extrabold text-foreground">
          VolumCalc<span className="text-primary">.</span>
        </span>
      )}
    </span>
  );
}