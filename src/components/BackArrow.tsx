type BackArrowProps = {
  className?: string;
};

export function BackArrow({ className = "" }: BackArrowProps) {
  const classes = ["back-arrow", className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M6 12H18M6 12L11 7M6 12L11 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
