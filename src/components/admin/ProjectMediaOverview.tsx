import type { AdminAsset } from "../../admin/api";
import { useAdminResource } from "../../admin/useAdminResource";

function storyAssetIds(data: Record<string, unknown>) {
  const blocks = Array.isArray(data.content_blocks) ? data.content_blocks : [];
  return blocks.flatMap((block) => {
    if (!block || typeof block !== "object") return [];
    const candidate = block as Record<string, unknown>;
    return candidate.type === "image" && typeof candidate.assetId === "string" ? [candidate.assetId] : [];
  });
}

export function ProjectMediaOverview({ data, dirty }: { data: Record<string, unknown>; dirty: boolean }) {
  const resource = useAdminResource<AdminAsset[]>("/api/admin/media");
  const roles = [
    { key: "hero_image", label: "Cover", ids: typeof data.hero_image === "string" ? [data.hero_image] : [] },
    { key: "hover_image", label: "Hover", ids: typeof data.hover_image === "string" ? [data.hover_image] : [] },
    { key: "content_blocks", label: "Story", ids: storyAssetIds(data) },
    { key: "social_image", label: "Social", ids: typeof data.social_image === "string" ? [data.social_image] : [] },
  ];
  const byId = new Map(resource.status === "ready" ? resource.data.map((asset) => [asset.id, asset]) : []);

  return (
    <section className="admin-project-media-overview" aria-labelledby="project-media-heading">
      <div className="admin-project-media-overview__heading">
        <div><span>Project media</span><h2 id="project-media-heading">Images assigned to this project</h2></div>
        <strong data-dirty={dirty}>{dirty ? "Changes not saved" : "All changes saved"}</strong>
      </div>
      <p>Upload inside each image field or choose from the shared library. Assignments become part of this project when the draft is saved.</p>
      <div className="admin-project-media-overview__roles">
        {roles.map((role) => (
          <a key={role.key} href={`#field-${role.key}`}>
            <span>{role.label}</span>
            {role.ids.length ? (
              <div className="admin-project-media-overview__thumbs">
                {role.ids.slice(0, 3).map((id) => {
                  const asset = byId.get(id);
                  return asset ? <img key={id} src={asset.url} alt="" /> : <i key={id} />;
                })}
                {role.ids.length > 3 ? <small>+{role.ids.length - 3}</small> : null}
              </div>
            ) : <small>Not assigned</small>}
          </a>
        ))}
      </div>
    </section>
  );
}
