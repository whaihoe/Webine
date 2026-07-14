type DirectionalArrowProps = {
  direction?: "up-right" | "down";
  className?: string;
};

export function DirectionalArrow({
  direction = "up-right",
  className = "",
}: DirectionalArrowProps) {
  const classes = [
    "directional-arrow",
    `directional-arrow--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <svg viewBox="0 0 12 12" focusable="false">
        {direction === "down" ? (
          <path d="M6 1.5v9M2.5 7 6 10.5 9.5 7" />
        ) : (
          <path d="M2 10 10 2M4 2h6v6" />
        )}
      </svg>
    </span>
  );
}
