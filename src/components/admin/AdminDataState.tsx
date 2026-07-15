type AdminDataStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "error";
};

export function AdminDataState({
  title,
  description,
  actionLabel,
  onAction,
  tone = "neutral",
}: AdminDataStateProps) {
  return (
    <section
      className="admin-data-state"
      data-tone={tone}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      <p className="eyebrow">Admin status</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
