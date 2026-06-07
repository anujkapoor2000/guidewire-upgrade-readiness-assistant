import { NextRequest, NextResponse } from "next/server";
import { validateContract, contractSchemas } from "@/lib/contracts";

type ContractName = keyof typeof contractSchemas;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const contractName = body.contractName as ContractName;
  const payload = body.payload;

  if (!contractName || !(contractName in contractSchemas)) {
    return NextResponse.json(
      {
        error: "Unknown contract name",
        availableContracts: Object.keys(contractSchemas)
      },
      { status: 400 }
    );
  }

  const result = validateContract(contractName, payload);

  return NextResponse.json({
    status: result.valid ? "PASS" : "FAIL",
    ...result
  });
}