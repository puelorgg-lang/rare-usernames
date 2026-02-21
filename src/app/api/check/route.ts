import { NextResponse } from "next/server";
import { checkUsername } from "@/lib/checker";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const platform = searchParams.get("platform");

  if (!username || !platform) {
    return NextResponse.json({ error: "Missing username or platform" }, { status: 400 });
  }

  const result = await checkUsername(username, platform);
  return NextResponse.json(result);
}
