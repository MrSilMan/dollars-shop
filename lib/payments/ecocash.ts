import { logger } from "@/lib/logger";

/**
 * EcoCash Instant Payment (EIP) API v3 client.
 *
 * All money-state decisions are made from the Query Transaction endpoint
 * (server-to-server, Basic Auth) — never from webhook payloads, which EcoCash
 * does not sign. See confirmEcoCashPayment in lib/payments/fulfillment.ts.
 *
 * PAYMENT_MODE=sandbox short-circuits all network calls so the checkout flow
 * can be exercised locally without touching the EcoCash preprod environment.
 */

export const isSandbox = process.env.PAYMENT_MODE === "sandbox";

interface EcoCashConfig {
  baseUrl: string;
  username: string;
  password: string;
  merchantCode: string;
  merchantPin: string;
  merchantNumber: string;
  terminalId: string;
  location: string;
  superMerchantName: string;
  merchantName: string;
}

function getConfig(): EcoCashConfig {
  const cfg = {
    baseUrl: process.env.ECOCASH_API_BASE_URL,
    username: process.env.ECOCASH_API_USERNAME,
    password: process.env.ECOCASH_API_PASSWORD,
    merchantCode: process.env.ECOCASH_MERCHANT_CODE,
    merchantPin: process.env.ECOCASH_MERCHANT_PIN,
    merchantNumber: process.env.ECOCASH_MERCHANT_NUMBER,
    terminalId: process.env.ECOCASH_TERMINAL_ID ?? "WEB001",
    location: process.env.ECOCASH_LOCATION ?? "Harare Zimbabwe",
    superMerchantName: process.env.ECOCASH_SUPER_MERCHANT_NAME ?? "DOLLAR SHOP",
    merchantName: process.env.ECOCASH_MERCHANT_NAME ?? "DOLLAR SHOP",
  };
  for (const [key, value] of Object.entries(cfg)) {
    if (!value) throw new Error(`EcoCash config missing: ${key}`);
  }
  return cfg as EcoCashConfig;
}

/**
 * Normalize a Zimbabwean mobile number to international MSISDN format
 * (e.g. "077 722 2093" → "263777222093"). Returns null if it is not a
 * plausible Zimbabwean mobile number.
 */
export function normalizeEcoCashMsisdn(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  let msisdn: string;
  if (digits.startsWith("263")) msisdn = digits;
  else if (digits.startsWith("0")) msisdn = `263${digits.slice(1)}`;
  else if (digits.startsWith("7")) msisdn = `263${digits}`;
  else return null;
  return /^263(71|73|74|77|78)\d{7}$/.test(msisdn) ? msisdn : null;
}

async function eipRequest(path: string, init: { method: "GET" | "POST"; body?: unknown }) {
  const cfg = getConfig();
  const auth = Buffer.from(`${cfg.username}:${cfg.password}`).toString("base64");
  return fetch(`${cfg.baseUrl}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
}

export interface EcoCashChargeParams {
  clientCorrelator: string;
  msisdn: string;
  amount: number;
  currency: "USD" | "ZWG";
  referenceCode: string;
  description: string;
}

export type EcoCashChargeResult =
  | { accepted: true }
  | { accepted: false; error: string };

/**
 * Charge Request — pushes a USSD payment prompt to the subscriber's phone.
 * A 200 response only means the prompt was sent ("PENDING SUBSCRIBER
 * VALIDATION"); the final outcome arrives via notifyUrl and must be
 * confirmed with queryEcoCashTransaction.
 */
export async function initiateEcoCashCharge(params: EcoCashChargeParams): Promise<EcoCashChargeResult> {
  if (isSandbox) {
    logger.info("EcoCash sandbox charge initiated", {
      clientCorrelator: params.clientCorrelator,
      amount: params.amount,
    });
    return { accepted: true };
  }

  const cfg = getConfig();
  try {
    const res = await eipRequest("/payment/v1/transactions/amount", {
      method: "POST",
      body: {
        clientCorrelator: params.clientCorrelator,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=ecocash`,
        referenceCode: params.referenceCode,
        tranType: "MER",
        endUserId: params.msisdn,
        remarks: params.description,
        transactionOperationStatus: "Charged",
        paymentAmount: {
          charginginformation: {
            amount: params.amount,
            currency: params.currency,
            description: params.description,
          },
          chargeMetaData: {
            channel: "WEB",
            purchaseCategoryCode: "Online Payment",
            onBeHalfOf: cfg.merchantName,
          },
        },
        merchantCode: cfg.merchantCode,
        merchantPin: cfg.merchantPin,
        merchantNumber: cfg.merchantNumber,
        currencyCode: params.currency,
        countryCode: "ZW",
        terminalID: cfg.terminalId,
        location: cfg.location,
        superMerchantName: cfg.superMerchantName,
        merchantName: cfg.merchantName,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error("EcoCash charge rejected", {
        clientCorrelator: params.clientCorrelator,
        httpStatus: res.status,
        body: text.slice(0, 500),
      });
      return { accepted: false, error: "Payment request was rejected by EcoCash" };
    }

    const data = await res.json();
    const status = String(data.transactionOperationStatus ?? "").toUpperCase();
    if (status === "FAILED") {
      logger.warn("EcoCash charge failed immediately", {
        clientCorrelator: params.clientCorrelator,
        status,
        remarks: data.remarks,
      });
      return { accepted: false, error: "EcoCash could not process this payment request" };
    }

    logger.info("EcoCash charge accepted", {
      clientCorrelator: params.clientCorrelator,
      status,
    });
    return { accepted: true };
  } catch (error) {
    logger.error("EcoCash charge request error", { error, clientCorrelator: params.clientCorrelator });
    return { accepted: false, error: "Could not reach EcoCash. Please try again." };
  }
}

export interface EcoCashQueryResult {
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number | null;
  currency: string | null;
  ecocashReference: string | null;
}

/**
 * Query Transaction — the authoritative source for a transaction's outcome.
 * Network/HTTP errors deliberately map to PENDING so callers keep polling
 * instead of failing an order whose money may already have moved.
 */
export async function queryEcoCashTransaction(
  msisdn: string,
  clientCorrelator: string
): Promise<EcoCashQueryResult> {
  try {
    const res = await eipRequest(
      `/payment/v1/${encodeURIComponent(msisdn)}/transactions/amount/${encodeURIComponent(clientCorrelator)}`,
      { method: "GET" }
    );
    if (!res.ok) {
      logger.warn("EcoCash query non-OK response", { clientCorrelator, httpStatus: res.status });
      return { status: "PENDING", amount: null, currency: null, ecocashReference: null };
    }

    const data = await res.json();
    const raw = String(data.transactionOperationStatus ?? "").toUpperCase();
    const status: EcoCashQueryResult["status"] =
      raw === "COMPLETED" ? "COMPLETED"
      : raw === "FAILED" || raw === "CANCELLED" ? "FAILED"
      : "PENDING";

    const charging = data.paymentAmount?.charginginformation;
    const total = Number(data.paymentAmount?.totalAmountCharged);
    return {
      status,
      amount: Number.isFinite(total) && total > 0 ? total : Number.isFinite(Number(charging?.amount)) ? Number(charging.amount) : null,
      currency: charging?.currency ?? null,
      ecocashReference: data.ecocashReference ?? data.serverReferenceCode ?? null,
    };
  } catch (error) {
    logger.error("EcoCash query error", { error, clientCorrelator });
    return { status: "PENDING", amount: null, currency: null, ecocashReference: null };
  }
}

export interface EcoCashRefundParams {
  clientCorrelator: string;
  msisdn: string;
  amount: number;
  currency: "USD" | "ZWG";
  originalEcocashReference: string;
  referenceCode: string;
  description: string;
}

export type EcoCashRefundResult =
  | { status: "COMPLETED"; ecocashReference: string | null }
  | { status: "FAILED" | "PENDING"; error: string };

/**
 * Refund Request — reverses a completed charge back to the subscriber.
 * The body mirrors the charge request plus originalEcocashReference,
 * exactly as in the EIP v3 sample (which uses tranType "MER" even for refunds).
 */
export async function refundEcoCashTransaction(params: EcoCashRefundParams): Promise<EcoCashRefundResult> {
  if (isSandbox) {
    logger.info("EcoCash sandbox refund", { clientCorrelator: params.clientCorrelator, amount: params.amount });
    return { status: "COMPLETED", ecocashReference: `SANDBOX-REF-${params.clientCorrelator}` };
  }

  const cfg = getConfig();
  try {
    const res = await eipRequest("/payment/v1/transactions/refund", {
      method: "POST",
      body: {
        clientCorrelator: params.clientCorrelator,
        endUserId: params.msisdn,
        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=ecocash`,
        originalEcocashReference: params.originalEcocashReference,
        referenceCode: params.referenceCode,
        tranType: "MER",
        remarks: params.description,
        transactionOperationStatus: "Charged",
        paymentAmount: {
          charginginformation: {
            amount: params.amount,
            currency: params.currency,
            description: params.description,
          },
          chargeMetaData: {
            channel: "WEB",
            purchaseCategoryCode: "Online Payment",
            onBeHalfOf: cfg.merchantName,
          },
        },
        merchantCode: cfg.merchantCode,
        merchantPin: cfg.merchantPin,
        merchantNumber: cfg.merchantNumber,
        currencyCode: params.currency,
        countryCode: "ZW",
        terminalID: cfg.terminalId,
        location: cfg.location,
        superMerchantName: cfg.superMerchantName,
        merchantName: cfg.merchantName,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error("EcoCash refund rejected", {
        clientCorrelator: params.clientCorrelator,
        httpStatus: res.status,
        body: text.slice(0, 500),
      });
      return { status: "FAILED", error: "Refund was rejected by EcoCash" };
    }

    const data = await res.json();
    const raw = String(data.transactionOperationStatus ?? "").toUpperCase();
    if (raw === "COMPLETED") {
      return { status: "COMPLETED", ecocashReference: data.ecocashReference ?? data.serverReferenceCode ?? null };
    }
    if (raw === "FAILED") {
      logger.error("EcoCash refund failed", { clientCorrelator: params.clientCorrelator, remarks: data.remarks });
      return { status: "FAILED", error: data.remarks ?? "Refund failed" };
    }
    return { status: "PENDING", error: "Refund is still processing — check EcoCash before retrying" };
  } catch (error) {
    logger.error("EcoCash refund error", { error, clientCorrelator: params.clientCorrelator });
    return { status: "FAILED", error: "Could not reach EcoCash to process the refund" };
  }
}
