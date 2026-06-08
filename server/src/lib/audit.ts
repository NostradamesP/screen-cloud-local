import { db } from "../db";
import { auditLogs } from "../db/schema";

export async function logAudit(params: {
  orgId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    organizationId: params.orgId,
    userId: params.userId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    changes: params.changes ?? null,
  });
}
