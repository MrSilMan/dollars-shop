import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export type AuditAction =
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DELETE"
  | "CATEGORY_CREATE"
  | "CATEGORY_UPDATE"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_COD_PAYMENT"
  | "ORDER_ECOCASH_REFUND"
  | "COUPON_CREATE"
  | "COUPON_UPDATE"
  | "COUPON_DELETE"
  | "STAFF_INVITE"
  | "STAFF_EDIT"
  | "STAFF_REMOVE"
  | "NEWSLETTER_SEND";

export interface AuditParams {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  entityLabel?: string;
  detail?: Prisma.InputJsonValue;
}

export function logAudit(params: AuditParams): void {
  // Fire-and-forget — never block the caller, never throw
  prisma.auditLog.create({ data: params }).catch(() => null);
}
