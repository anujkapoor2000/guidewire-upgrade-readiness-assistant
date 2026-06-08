import { NextResponse } from "next/server";
import { runContractSuite } from "@/lib/contractSuite";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(runContractSuite());
}
