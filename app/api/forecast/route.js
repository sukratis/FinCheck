import { getPrediction } from "@/lib/forecast";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getPrediction();
  return NextResponse.json({ data });
}

