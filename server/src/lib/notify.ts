import { db } from "../db";
import { notifications } from "../db/schema";

export async function createNotification(params: {
  orgId: string;
  type: string;
  title: string;
  message: string;
  severity?: string;
}) {
  const [notification] = await db.insert(notifications).values({
    organizationId: params.orgId,
    type: params.type,
    title: params.title,
    message: params.message,
    severity: params.severity ?? "info",
  }).returning();
  return notification;
}
