import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_URL = "https://cdn.banis.dev/upload";

/** Shape returned by cdn.banis.dev on success (HTTP 201) */
export interface BanisCdnUploadResult {
  ok: true;
  id: string;
  filename: string;
  url: string;
  info_url: string;
  size: number;
  mimetype: string;
  uploaded_at: string;
}

/** Headers from upstream that are safe / useful to forward to the client */
const FORWARDED_HEADERS = [
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "ratelimit-policy",
] as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type");

    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid 'file' field" },
        { status: 400 }
      );
    }

    // Rebuild FormData — do NOT set Content-Type manually.
    // fetch() will attach the correct multipart boundary automatically.
    const upstreamForm = new FormData();
    upstreamForm.append("file", file, file.name);

    const upstreamResponse = await fetch(UPSTREAM_URL, {
      method: "POST",
      body: upstreamForm,
    });

    const body = await upstreamResponse.json();

    // Pass through rate-limit headers so callers can back off gracefully
    const headers = new Headers();
    for (const key of FORWARDED_HEADERS) {
      const value = upstreamResponse.headers.get(key);
      if (value) headers.set(key, value);
    }

    // Upstream returns 201 on success — preserve it
    return NextResponse.json(body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    console.error("[baniscdn] Upload proxy error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to proxy upload to upstream" },
      { status: 502 }
    );
  }
}

