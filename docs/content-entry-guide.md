# Webine content entry guide

## Sign in

Open `/admin` and sign in with the Clerk account whose user ID matches `ADMIN_USER_ID`. The local development identity works only on this machine and is rejected by the Cloudflare production runtime.

## Add media first

1. Open **Media**.
2. Choose or drag up to 40 JPEG, PNG, WebP, AVIF, animated GIF or MP4 files. Images may be up to 15 MB and MP4 files up to 30 MB. GIFs retain their animation and may contain up to 500 frames.
3. Review every queued asset. Add meaningful alt text or a video description, or mark that asset decorative only when it conveys no information. Add an optional caption.
4. Adjust each image's focal point so responsive crops preserve the important subject.
5. Complete the upload. The queue uploads sequentially through short-lived R2 signed URLs. Successful assets leave the queue, while a failed asset keeps its metadata for correction and retry. Production originals become reusable after the Worker verifies their stored bytes.

Production uploads are usable immediately after the Worker verifies the original in R2. To reduce delivery size further, copy the Asset ID shown on its media card, download its verified source, generate and save the manifest, then persist the optional outputs:

```bash
npm run process:media-rendition -- --input <source-file> --output-dir <output-directory> > <manifest-file>
npm run persist:media-renditions -- --asset-id <asset-id> --manifest <manifest-file>
```

The second command needs the R2 S3 variables, `WEBINE_ADMIN_ORIGIN` and a short-lived `WEBINE_ADMIN_TOKEN` from the authenticated owner session. It uploads all three derivatives, then the Worker verifies them before marking the asset ready. Do not store that token in a repository file or shell profile.

Editors select media from the media library. They never paste a filesystem path or storage URL into a media field. Project cover, hover, Image and Bento fields accept ready images or MP4 assets. Social sharing remains image-only, while a Video block accepts one MP4.

Archive is available directly on each asset card. An asset used by published content stays protected. Replace or unpublish that content first, then archive the asset. Archive removes the asset from ordinary selection without destroying its audit history.

### Project image sizes

Prepare Project images around the website's 16:10 media frame:

- Cover and hover images: 2400 × 1500 px recommended, 1600 × 1000 px minimum
- Story images: use one to three images in an Image block. Two appear side by side and three form a responsive group.
- Bento images: mix landscape, square and portrait images at a consistent export quality. The layout keeps each image's real aspect ratio and balances the sequence into compact columns on larger screens, so a precomposed bento image is no longer needed.
- Social sharing image: 2400 × 1260 px, which is a 1.91:1 share ratio

Keep important text, logos and faces inside the central 80 percent of the image. The website fills the frame edge to edge and uses the saved focal point during responsive cropping and parallax. Any deliberate breathing room should be part of the exported image itself.

## Create and publish a Project

1. Open **Collections**, then **Projects**.
2. Choose **New item**.
3. Complete the working title, slug, honest project kind, category, year, services, summary, hero image and case-study accent colour.
4. Label internal studies and concept work honestly. Do not add invented clients, results or testimonials.
5. Save the draft. Saving never changes the public website.
6. Use **Preview** to review the protected draft composition.
7. Fix required-field, reference, image or alt-text warnings.
8. Publish when the content is approved. Home and Works read the same published snapshot.

After later edits, save the new draft, preview it and choose **Republish**. Use **Unpublish** to remove the public version while keeping an editable draft. Use **Archive** when published work should leave the website but remain in Admin. Archived and draft Projects can be permanently deleted by typing `DELETE`; this purges the Project and its snapshots.

The accent colour belongs only to that Project's `/works/:slug` galaxy nebula. The page keeps the shared Works particles and dark background, while the nebula derives its atmospheric gradient from the selected colour. It does not recolour the Works index, particles or Home runway.

For a shorter, image-led case study, keep Challenge, Approach and Outcome concise, then interleave an **Image** or **Bento** content block where it supports the story. Image blocks accept up to three ordered images. Use Bento when several images have different proportions, such as a vertical mobile screen beside a horizontal desktop screen. Add at least two images, order them in the editor and let their stored dimensions shape the responsive layout. The complete image remains visible rather than being forced into one shared crop. An optional heading and caption can still provide context.

## Arrange a Project story

The **Project story** field is the one place to arrange the case study. Challenge, Approach and Outcome are always present because they are required before publication. They can be moved around custom statement, text, image, Bento and video blocks, but they cannot be removed or changed into another block type. Their text is edited inside the matching entry.

Each story entry and custom block has one **Show divider and bottom spacing** toggle. Turning it off removes both the divider and that entry's bottom padding. About the client stays fixed above the arranged story. Older Projects keep their original Challenge, Approach and Outcome followed by custom blocks until they are next saved, then receive stable story IDs automatically.

## Featured homepage order

In a Project, enable **Featured** to include it in the homepage runway. New Projects automatically receive the next **Featured order** number. Higher numbers appear first, so a new Project numbered `2` appears before an older Project numbered `1` on both Home and Works. You can still edit the number manually when a different sequence is needed.

## Collections and fields

Open **Collections** and choose **New collection** for private structured content that does not fit an existing system collection. Define a stable snake_case key, singular and plural labels, a display field and ordered fields. Existing field keys should not be renamed after content depends on them.

Custom collections remain private until a developer deliberately connects them to a public component. Creating a collection does not automatically expose it on the website.

## Enquiries

Open **Enquiries** to review Contact submissions. Every accepted submission is stored here before notification is attempted. With the three Resend variables configured, a private email is sent to the owner and reply-to points to the visitor. The HTTPS webhook is an alternative. Pending means no provider is configured. Failed means delivery was attempted and can be retried after the environment is corrected. Never copy enquiry data into public CMS fields or application logs.

## Site Settings

**Site Settings** is the singleton source for the current Home, Works, Contact, privacy and footer copy. New databases receive the current website values instead of an empty draft. Save changes first, then publish them to update the public snapshot. Structured groups use valid JSON so nested CTA, process and principle values keep their shape.

Particle counts, object transforms and scroll choreography remain in `src/config/experience.ts`. Those values affect rendering performance and layout, so they are reviewed and tested as code rather than exposed as ordinary content fields.

## Safe operating rules

- Keep real credentials in Cloudflare Worker secrets, never in CMS content.
- Do not upload passwords, identity documents or payment details.
- Preview before every first publication and major republish.
- Use the database backup process before risky schema or bulk content work.
- Keep Project claims, credits, results and testimonials supported by real evidence.
