import { Link, useSearchParams } from "react-router-dom";
import type { AdminAsset, AdminItem } from "../admin/api";
import { useAdminResource } from "../admin/useAdminResource";
import { SiteShell } from "../components/SiteShell";

type PreviewData = { collection: string; item: AdminItem; assets: AdminAsset[] };

function structuredText(value: unknown) {
  return value && typeof value === "object" && "text" in value ? String((value as { text: unknown }).text ?? "") : "";
}

export function PreviewPage() {
  const [params] = useSearchParams();
  const collection = params.get("collection") ?? "";
  const id = params.get("id") ?? "";
  const resource = useAdminResource<PreviewData>(
    `/api/admin/preview/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
  );
  const back = collection && id ? `/admin/collections/${collection}/items/${id}` : "/admin";
  if (resource.status === "loading") return <main className="admin-entry-state theme-light">Loading protected preview…</main>;
  if (resource.status === "error") return <main className="admin-entry-state theme-light"><h1>Preview could not load.</h1><p>{resource.error.message}</p><Link to={back}>Return to Admin</Link></main>;
  const data = resource.data.item.data;
  const asset = resource.data.assets.find((candidate) => candidate.id === data.hero_image);
  const blocks = Array.isArray(data.content_blocks) ? data.content_blocks as Array<Record<string, unknown>> : [];
  return (
    <SiteShell headerTheme="light">
      <section className="project-case-study theme-light" aria-labelledby="preview-heading">
        <div className="site-container project-case-study__top"><Link to={back}>Return to editor</Link><p>Protected draft preview / {resource.data.item.status}</p></div>
        <div className="site-container project-case-study__hero"><div className="page-header-copy page-header-copy--case"><p className="eyebrow page-header-copy__eyebrow">Unpublished CMS state</p><h1 className="page-header-copy__title" id="preview-heading">{String(data.title ?? "Untitled project")}</h1><p className="page-header-copy__summary">{String(data.short_summary ?? "Add a project summary in Admin.")}</p></div>{asset ? <img src={asset.url} alt={asset.decorative ? "" : asset.altText} style={{ objectPosition: `${asset.focalX * 100}% ${asset.focalY * 100}%` }} /> : <div className="project-case-study__missing-media">Select a hero image</div>}</div>
        <div className="site-container project-case-study__story">{[["Challenge", structuredText(data.challenge)], ["Approach", structuredText(data.approach)], ["Outcome", structuredText(data.outcome)]].map(([heading, copy]) => copy ? <article key={heading}><span>{heading}</span><p>{copy}</p></article> : null)}{blocks.map((block, index) => {
          const blockAsset = block.type === "image" ? resource.data.assets.find((candidate) => candidate.id === block.assetId) : undefined;
          return <article key={index} data-block-type={String(block.type ?? "story")}><span>{String(block.heading ?? block.type ?? "Story")}</span>{blockAsset ? <img src={blockAsset.url} alt={blockAsset.decorative ? "" : blockAsset.altText} style={{ objectPosition: `${blockAsset.focalX * 100}% ${blockAsset.focalY * 100}%` }} /> : <p>{String(block.text ?? "")}</p>}</article>;
        })}</div>
      </section>
    </SiteShell>
  );
}
