import { useSiteSettings } from "../../content/SiteSettingsProvider";

type InterludeChapterContentProps = {
  headingId: string;
};

export function InterludeChapterContent({
  headingId,
}: InterludeChapterContentProps) {
  const { interlude } = useSiteSettings();
  return (
    <div className="site-container quiet-interlude__layout">
      <div className="quiet-interlude__heading-group">
        <p className="eyebrow" data-interlude-reveal>
          {interlude.eyebrow}
        </p>
        <h2 id={headingId} data-interlude-reveal>
          {interlude.titleLead} {" "}
          <em>{interlude.titleAccent}</em>
        </h2>
      </div>
      <div className="quiet-interlude__detail-group">
        <p className="quiet-interlude__statement" data-interlude-reveal>
          {interlude.statement}
        </p>
        <ul className="quiet-interlude__foundations" data-interlude-reveal>
          {interlude.foundations.map((foundation, index) => (
            <li key={foundation}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {foundation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
