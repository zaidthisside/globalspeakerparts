import { NextRequest, NextResponse } from "next/server";

// Allowed domains for proxying to prevent open-relay proxy abuse
const ALLOWED_HOSTS = [
  "supabase.co",
  "supabase.in",
  "images.unsplash.com",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url") || searchParams.get("src");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
    }

    // Security check: Verify host is allowed
    const isAllowedHost = ALLOWED_HOSTS.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );

    if (!isAllowedHost) {
      return NextResponse.json({ error: "Host not allowed for proxy" }, { status: 403 });
    }

    // Check client cache (If-None-Match)
    const clientEtag = req.headers.get("if-none-match");

    // Fetch upstream media
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Nextjs-Media-Proxy/1.0",
        Accept: "image/*,video/*,*/*",
      },
      next: {
        revalidate: 31536000, // 1 year Next.js Data Cache
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream returned status ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const contentLength = upstreamRes.headers.get("content-length");
    const upstreamEtag = upstreamRes.headers.get("etag") || `W/"gsp-${Buffer.from(targetUrl).toString("base64").slice(0, 24)}"`;

    if (clientEtag && clientEtag === upstreamEtag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400",
          ETag: upstreamEtag,
        },
      });
    }

    const imageBuffer = await upstreamRes.arrayBuffer();

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400",
      "CDN-Cache-Control": "max-age=31536000",
      "Vercel-CDN-Cache-Control": "max-age=31536000",
      ETag: upstreamEtag,
      "Access-Control-Allow-Origin": "*",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("[Media Proxy Error]:", err);
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  const getRes = await GET(req);
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
