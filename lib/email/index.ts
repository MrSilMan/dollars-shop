import nodemailer from "nodemailer";
import { orderConfirmedHtml } from "./templates/orderConfirmed";
import { paymentReceivedHtml } from "./templates/paymentReceived";
import { statusUpdateHtml } from "./templates/statusUpdate";
import { staffInviteHtml } from "./templates/staffInvite";
import { promotionalDealHtml } from "./templates/promotionalDeal";
import { getAppSettings } from "@/lib/app-settings";

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? "Dollar Shop <noreply@dollarshop.co.zw>";

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function send(to: string, subject: string, html: string, attachments?: { filename: string; content: Buffer; contentType: string }[]) {
  if (!isConfigured()) return;
  await getTransporter().sendMail({ from: FROM, to, subject, html, attachments });
}

export { isConfigured };

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number; variantSnapshot?: string | null }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  fulfillmentType?: "DELIVERY" | "PICKUP";
  shippingAddress: { line1: string; line2?: string | null; city: string; province: string };
  receiptPdf?: Buffer;
}

function receiptAttachment(data: OrderEmailData) {
  if (!data.receiptPdf) return undefined;
  return [{ filename: `receipt-${data.orderNumber}.pdf`, content: data.receiptPdf, contentType: "application/pdf" }];
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  await send(data.customerEmail, `Order Confirmed — ${data.orderNumber} | Dollar Shop`, orderConfirmedHtml(data), receiptAttachment(data));
}

export async function sendPaymentReceivedEmail(data: OrderEmailData) {
  await send(data.customerEmail, `Payment Received — ${data.orderNumber} | Dollar Shop`, paymentReceivedHtml(data), receiptAttachment(data));
}

export async function sendOrderStatusUpdateEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  total: number;
}) {
  await send(data.customerEmail, `Order Update — ${data.orderNumber} | Dollar Shop`, statusUpdateHtml(data));
}

export async function sendStaffInvitationEmail(data: {
  to: string;
  inviterName: string;
  roleLabel: string;
  role: string;
  acceptUrl: string;
  appName: string;
}) {
  const settings = await getAppSettings().catch(() => null);
  const baseUrl = (process.env.AUTH_URL ?? "https://invgest.com").replace(/\/$/, "");
  const rawLogo = settings?.logoUrl ?? null;
  const logoUrl = rawLogo
    ? rawLogo.startsWith("http") ? rawLogo : `${baseUrl}${rawLogo}`
    : null;
  await send(
    data.to,
    `You're invited to join ${data.appName}`,
    staffInviteHtml({
      ...data,
      expiresHours: 48,
      primaryColor: settings?.primaryColor ?? undefined,
      logoUrl,
    }),
  );
}

export async function sendPromotionalDealEmail(data: { to: string; subject: string; bodyHtml: string; ctaText?: string | null; ctaUrl?: string | null }) {
  await send(data.to, data.subject, promotionalDealHtml(data));
}
