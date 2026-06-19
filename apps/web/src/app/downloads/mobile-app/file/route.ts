import { NextResponse } from "next/server";

const FALLBACK_FILENAME = "portal-mitra.apk";

function buildDownloadHeaders(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const contentDisposition = response.headers.get("content-disposition");

  headers.set("content-type", contentType || "application/vnd.android.package-archive");
  headers.set(
    "content-disposition",
    contentDisposition || `attachment; filename="${FALLBACK_FILENAME}"`,
  );

  if (contentLength) {
    headers.set("content-length", contentLength);
  }

  headers.set("cache-control", "private, no-store, max-age=0");

  return headers;
}

export async function GET() {
  const sourceUrl = process.env.NEXT_PUBLIC_MOBILE_APP_DOWNLOAD_URL;

  if (!sourceUrl) {
    return NextResponse.json(
      { message: "Mobile app download URL belum dikonfigurasi." },
      { status: 404 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(sourceUrl, {
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    return NextResponse.json(
      { message: "Gagal menghubungi server file mobile app." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: "File mobile app tidak bisa diunduh saat ini." },
      { status: 502 },
    );
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: buildDownloadHeaders(upstream),
  });
}
