import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/id/downloads/mobile-app";
  return NextResponse.redirect(url);
}
