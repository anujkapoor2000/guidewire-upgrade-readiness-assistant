import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateReadiness } from "@/lib/readiness";
import { generateReadinessAdvisory, isAIConfigured } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const IntegrationSchema = z.object({
  name: z.string(),
  type: z.enum(["REST", "SOAP", "FILE", "EVENT", "DB"]),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH"]),
  hasContractTest: z.boolean(),
  hasMock: z.boolean()
});

const ReadinessInputSchema = z.object({
  currentVersion: z.string(),
  targetVersion: z.string(),
  applications: z.array(z.string()),
  customGosuClasses: z.number().nonnegative(),
  customEntities: z.number().nonnegative(),
  customTypelists: z.number().nonnegative(),
  customPcfFiles: z.number().nonnegative(),
  integrations: z.array(IntegrationSchema),
  batchProcesses: z.number().nonnegative(),
  regressionCoveragePercent: z.number().min(0).max(100),
  apiTestCoveragePercent: z.number().min(0).max(100),
  dataQualityScorePercent: z.number().min(0).max(100),
  knownUpgradeBlockers: z.number().nonnegative()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ReadinessInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid readiness input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = calculateReadiness(parsed.data);
  const advisory = await generateReadinessAdvisory(parsed.data, result);

  return NextResponse.json({
    aiConfigured: isAIConfigured(),
    result,
    advisory
  });
}
