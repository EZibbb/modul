import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });
  const items = await searchProducts(q, 6);
  return NextResponse.json({ items });
}
