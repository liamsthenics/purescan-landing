// Small line icons, drawn to match SF Symbols' regular weight.

interface IconProps {
  size?: number;
  className?: string;
}

function iconProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className,
  };
}

export function ChevronRightIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function PlusIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...iconProps(size, className)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
