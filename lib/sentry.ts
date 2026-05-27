import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export function capturePaymentError(
  error: unknown,
  context: { method: string; orderId?: string; amount?: number; customerPhone?: string }
) {
  Sentry.captureException(error, {
    tags: { component: "payment", method: context.method },
    extra: context,
  });
}
