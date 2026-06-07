import { NextRequest, NextResponse } from "next/server";
import { createVendorMockResponse } from "@/lib/mockVendors";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ vendor: string }> }
) {
  const { vendor } = await context.params;
  const body = await req.json();

  const scenario = req.nextUrl.searchParams.get("scenario");

  if (scenario === "timeout") {
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  if (scenario === "server-error") {
    return NextResponse.json(
      {
        error: "Simulated vendor server error",
        vendor
      },
      { status: 500 }
    );
  }

  if (scenario === "unauthorised") {
    return NextResponse.json(
      {
        error: "Simulated unauthorised vendor response",
        vendor
      },
      { status: 401 }
    );
  }

  const response = createVendorMockResponse(vendor, body);

  return NextResponse.json(response);
}