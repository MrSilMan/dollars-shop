import { Resend } from "resend";
import { orderConfirmedHtml } from "./templates/orderConfirmed";
import { paymentReceivedHtml } from "./templates/paymentReceived";
import { statusUpdateHtml } from "./templates/statusUpdate";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}
const FROM = process.env.EMAIL_FROM ?? "Dollar Shop <orders@dollarshop.co.zw>";

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
  shippingAddress: { line1: string; line2?: string | null; city: string; province: string };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order Confirmed — ${data.orderNumber} | Dollar Shop`,
    html: orderConfirmedHtml(data),
  });
}

export async function sendPaymentReceivedEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Payment Received — ${data.orderNumber} | Dollar Shop`,
    html: paymentReceivedHtml(data),
  });
}

export async function sendOrderStatusUpdateEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: string;
  total: number;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Order Update — ${data.orderNumber} | Dollar Shop`,
    html: statusUpdateHtml(data),
  });
}
