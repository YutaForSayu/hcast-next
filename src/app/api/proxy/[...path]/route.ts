import { NextRequest, NextResponse } from "next/server";
import {
  UPSTREAM,
  BROWSER_HEADERS,
  getUpstreamSession,
  invalidateSession,
} from "@/lib/upstream-session";
import { getAuthUser } from "@/lib/auth";

// ─── Headers dari client yang TIDAK diteruskan ke upstream ───────────────────
// Pakai blacklist agar cookie dan header lain tetap ikut diteruskan.
// Header internal Vercel/Next.js yang besar di-drop di sini.

const DROP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  // Header internal Next.js / Vercel — drop agar tidak membengkak
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
  "x-vercel-id",
  "x-vercel-deployment-url",
  "x-vercel-forwarded-for",
  "x-vercel-ip-city",
  "x-vercel-ip-country",
  "x-vercel-ip-country-region",
  "x-vercel-ip-latitude",
  "x-vercel-ip-longitude",
  "x-vercel-ip-timezone",
  "x-middleware-subrequest",
  "x-middleware-invoke",
  "x-invoke-path",
  "x-invoke-query",
  "x-nextjs-data",
  // XSRF kita kelola sendiri via session
  "x-xsrf-token",
]);

// ─── Response headers yang tidak perlu diteruskan ke browser ─────────────────

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "te",
  "trailer",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",         // jangan bocorkan session upstream ke browser
  "strict-transport-security",
  "x-powered-by",
]);

// ─── Core proxy ───────────────────────────────────────────────────────────────

async function proxy(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = pathSegments.join("/");

  // Build upstream URL dengan query string asli
  const upstreamUrl = new URL(`${UPSTREAM}/${path}`);
  req.nextUrl.searchParams.forEach((v, k) => upstreamUrl.searchParams.set(k, v));

  // Mulai dari browser headers bawaan
  const headers: Record<string, string> = { ...BROWSER_HEADERS };

  // Forward semua header dari client kecuali yang di-drop
  req.headers.forEach((value, key) => {
    if (!DROP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Inject session upstream (cookie + XSRF) — override cookie dari client
  const session = await getUpstreamSession();
  if (session.cookieHeader) {
    // Gabungkan: cookie upstream dulu, lalu cookie client (jika ada)
    const clientCookie = req.headers.get("cookie");
    headers["Cookie"] = clientCookie
      ? `${session.cookieHeader}; ${clientCookie}`
      : session.cookieHeader;
  }
  if (session.xsrfToken) headers["X-XSRF-TOKEN"] = session.xsrfToken;

  // Body untuk non-GET/HEAD
  const body = (req.method !== "GET" && req.method !== "HEAD")
    ? await req.arrayBuffer()
    : undefined;

  let res = await fetch(upstreamUrl.toString(), {
    method:   req.method,
    headers,
    body,
    cache:    "no-store",
    redirect: "follow",
  });

  // Session expired / CSRF mismatch → refresh sekali lalu retry
  if (res.status === 401 || res.status === 419 || res.status === 403) {
    console.warn(`[proxy] Upstream ${res.status} on ${path} — refreshing session`);
    invalidateSession();
    const fresh = await getUpstreamSession();
    if (fresh.cookieHeader) {
      const clientCookie = req.headers.get("cookie");
      headers["Cookie"] = clientCookie
        ? `${fresh.cookieHeader}; ${clientCookie}`
        : fresh.cookieHeader;
    }
    if (fresh.xsrfToken) headers["X-XSRF-TOKEN"] = fresh.xsrfToken;

    res = await fetch(upstreamUrl.toString(), {
      method:   req.method,
      headers,
      body,
      cache:    "no-store",
      redirect: "follow",
    });
  }

  // Forward response body
  const blob = await res.arrayBuffer();

  // Build response headers yang bersih
  const outHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      outHeaders.set(key, value);
    }
  });
  outHeaders.set("Access-Control-Allow-Origin", "*");
  if (!outHeaders.has("content-type")) {
    outHeaders.set("content-type", "application/json");
  }

  return new NextResponse(blob, { status: res.status, headers: outHeaders });
}

// ─── Route exports ────────────────────────────────────────────────────────────

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: RouteCtx) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: RouteCtx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  return proxy(req, (await ctx.params).path);
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    },
  });
}
