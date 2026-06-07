import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateMigrationRecords } from "@/lib/migration";
import { generateMigrationRemediation, isAIConfigured } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MigrationRecordSchema = z.object({
  sourceSystem: z.string(),
  entityType: z.enum([
    "Account",
    "Policy",
    "Claim",
    "Exposure",
    "Contact",
    "BillingAccount"
  ]),
  externalId: z.string(),
  payload: z.record(z.unknown())
});

const BodySchema = z.object({
  records: z.array(MigrationRecordSchema)
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid migration records", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const issues = validateMigrationRecords(parsed.data.records);
  const remediation = await generateMigrationRemediation(
    parsed.data.records,
    issues
  );

  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    issues,
    remediation
  });
}
