# Webine content entry guide

## Sign in

Open `/admin` and sign in with the Clerk account whose user ID matches `ADMIN_USER_ID`. The local development identity works only on this machine and is rejected on Vercel.

## Add media first

1. Open **Media**.
2. Choose or drag a JPEG, PNG, WebP, AVIF or animated GIF image no larger than 50 MB. GIFs retain their animation and may contain up to 500 frames.
3. Add meaningful alt text, or mark the image decorative only when it conveys no information.
4. Adjust the focal point so responsive crops preserve the important subject.
5. Complete the upload. The image can now be reused without uploading another copy.

Editors select images from the media library. They never paste a filesystem path or storage URL into an image field.

Archive is available directly on each asset card. An asset used by published content stays protected. Replace or unpublish that content first, then archive the asset. Archive removes the asset from ordinary selection without destroying its audit history.

## Create and publish a Project

1. Open **Collections**, then **Projects**.
2. Choose **New item**.
3. Complete the working title, slug, honest project kind, category, year, services, summary and hero image.
4. Label internal studies and concept work honestly. Do not add invented clients, results or testimonials.
5. Save the draft. Saving never changes the public website.
6. Use **Preview** to review the protected draft composition.
7. Fix required-field, reference, image or alt-text warnings.
8. Publish when the content is approved. Home and Works read the same published snapshot.

After later edits, save the new draft, preview it and choose **Republish**. Use **Unpublish** to remove the public version while keeping an editable draft. Use **Archive** when published work should leave the website but remain in Admin. Archived and draft Projects can be permanently deleted by typing `DELETE`; this purges the Project and its snapshots.

## Featured homepage order

In a Project, enable **Featured** and set **Featured order**. Lower numbers appear earlier. Reordering the values changes the homepage runway without a code change.

## Collections and fields

Open **Collections** and choose **New collection** for private structured content that does not fit an existing system collection. Define a stable snake_case key, singular and plural labels, a display field and ordered fields. Existing field keys should not be renamed after content depends on them.

Custom collections remain private until a developer deliberately connects them to a public component. Creating a collection does not automatically expose it on the website.

## Enquiries

Open **Enquiries** to review Contact submissions. Every accepted submission is stored here before notification is attempted. With the three Resend variables configured, a private email is sent to the owner and reply-to points to the visitor. The HTTPS webhook is an alternative. Pending means no provider is configured. Failed means delivery was attempted and can be retried after the environment is corrected. Never copy enquiry data into public CMS fields or application logs.

## Site Settings

**Site Settings** is the singleton source for the current Home, Works, Contact, privacy and footer copy. New databases receive the current website values instead of an empty draft. Save changes first, then publish them to update the public snapshot. Structured groups use valid JSON so nested CTA, process and principle values keep their shape.

Particle counts, object transforms and scroll choreography remain in `src/config/experience.ts`. Those values affect rendering performance and layout, so they are reviewed and tested as code rather than exposed as ordinary content fields.

## Safe operating rules

- Keep real credentials in Vercel, never in CMS content.
- Do not upload passwords, identity documents or payment details.
- Preview before every first publication and major republish.
- Use the database backup process before risky schema or bulk content work.
- Keep Project claims, credits, results and testimonials supported by real evidence.
