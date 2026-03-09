import { NextRequest, NextResponse } from "next/server";
import { isValidCronRequest } from "@/lib/security/cron";
import { processRetryJobsForAllStores } from "@/lib/jobs/queue";

export async function GET(req: NextRequest) {
  if (!isValidCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized_cron_request" }, { status: 401 });
  }

  const result = await processRetryJobsForAllStores({
    storeLimit: 50,
    jobLimitPerStore: 20
  });

  return NextResponse.json({ ok: true, ...result });
}
