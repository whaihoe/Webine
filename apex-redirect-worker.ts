const canonicalHostname = "www.madebywebine.com";

export default {
  fetch(request: Request) {
    const destination = new URL(request.url);
    destination.protocol = "https:";
    destination.hostname = canonicalHostname;

    return new Response(null, {
      status: 308,
      headers: {
        Location: destination.href,
        "Cache-Control": "public, max-age=3600",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
