import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { readFile } from "fs/promises";
import { join } from "path";
import { formatUSD } from "@/lib/utils/currency";
import { getAppSettings } from "@/lib/app-settings";

const DEFAULT_LOGO_PATH = join(process.cwd(), "public", "images", "logo-1.png");
const DEFAULT_PRIMARY_COLOR = "#E3029A";
const DEFAULT_ACCENT_COLOR = "#A315E1";

export async function resolveReceiptBranding(): Promise<{
  appName: string;
  logoBuffer: Buffer | null;
  primaryColor: string;
  accentColor: string;
}> {
  const settings = await getAppSettings().catch(() => null);
  const appName = settings?.appName ?? "Dollar Shop";
  const primaryColor = settings?.primaryColor ?? DEFAULT_PRIMARY_COLOR;
  const accentColor = settings?.accentColor ?? DEFAULT_ACCENT_COLOR;
  const logoPath = settings?.logoUrl
    ? join(process.cwd(), "public", settings.logoUrl.replace(/^\//, ""))
    : DEFAULT_LOGO_PATH;

  const logoBuffer = await readFile(logoPath).catch(() =>
    logoPath === DEFAULT_LOGO_PATH ? null : readFile(DEFAULT_LOGO_PATH).catch(() => null)
  );

  return { appName, logoBuffer, primaryColor, accentColor };
}

export interface ReceiptItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  subtotal: number;
  variantSnapshot?: string | null;
}

export interface ReceiptData {
  orderNumber: string;
  createdAt: Date;
  paymentMethod: string;
  fulfillmentType?: "DELIVERY" | "PICKUP";
  customerName: string;
  customerPhone?: string | null;
  items: ReceiptItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    province: string;
    country: string;
  };
  appName: string;
  logoBuffer?: Buffer | null;
  primaryColor: string;
  accentColor: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  ECOCASH: "EcoCash",
  INNBUCKS: "InnBucks",
};

function createStyles(primaryColor: string, accentColor: string) {
  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: "#1a1a1a", fontFamily: "Helvetica" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 16 },
    headerRule: { height: 3, marginBottom: 28, flexDirection: "row" },
    headerRuleHalf: { flex: 1 },
    logo: { width: 56, height: 56, objectFit: "contain" },
    tagline: { fontSize: 8, color: "#999", marginTop: 6 },
    companyInfo: { marginTop: 8 },
    companyInfoText: { fontSize: 8, color: "#999", lineHeight: 1.5 },
    receiptTitle: { fontSize: 18, fontWeight: 700, textAlign: "right", letterSpacing: 1 },
    orderNumber: { fontSize: 10, color: primaryColor, fontWeight: 700, textAlign: "right", marginTop: 4, fontFamily: "Courier" },
    metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    metaBlock: { width: "48%" },
    label: { fontSize: 8, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4, fontWeight: 700 },
    value: { fontSize: 10, lineHeight: 1.6, color: "#333" },
    nameValue: { fontSize: 11, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 },
    table: { marginTop: 4 },
    tableHeaderRow: { flexDirection: "row", backgroundColor: "#f7f7f7", paddingVertical: 8, paddingHorizontal: 8, borderTopWidth: 2, borderTopColor: primaryColor },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 9, paddingHorizontal: 8 },
    colItem: { width: "40%" },
    colSku: { width: "18%" },
    colQty: { width: "10%", textAlign: "center" },
    colPrice: { width: "16%", textAlign: "right" },
    colSubtotal: { width: "16%", textAlign: "right" },
    headerCell: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#888" },
    itemName: { fontWeight: 700, color: "#1a1a1a" },
    sku: { fontSize: 9, color: "#888", fontFamily: "Courier" },
    variant: { fontSize: 8, color: "#999", marginTop: 2 },
    totals: { marginTop: 16, alignItems: "flex-end" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 5 },
    totalsLabel: { fontSize: 10, color: "#777" },
    totalsValue: { fontSize: 10, color: "#333" },
    grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 8, paddingTop: 8, borderTopWidth: 1.5, borderTopColor: "#1a1a1a" },
    grandTotalLabel: { fontSize: 13, fontWeight: 700 },
    grandTotalValue: { fontSize: 13, fontWeight: 700, color: primaryColor },
    footer: { position: "absolute", bottom: 40, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#aaa", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12 },
  });
}

function ReceiptDocument({ data }: { data: ReceiptData }) {
  const addr = data.shippingAddress;
  const isPickup = data.fulfillmentType === "PICKUP";
  const styles = createStyles(data.primaryColor, data.accentColor);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {data.logoBuffer && <Image style={styles.logo} src={data.logoBuffer} />}
            <Text style={styles.tagline}>Quality Everyday. Every Dollar Counts.</Text>
            <View style={styles.companyInfo}>
              <Text style={styles.companyInfoText}>{data.appName}</Text>
              <Text style={styles.companyInfoText}>123 Samora Machel Ave, Harare, Zimbabwe</Text>
              <Text style={styles.companyInfoText}>+263 77 256 6468 · hello@dollarshop.co.zw</Text>
            </View>
          </View>
          <View>
            <Text style={styles.receiptTitle}>RECEIPT</Text>
            <Text style={styles.orderNumber}>{data.orderNumber}</Text>
          </View>
        </View>

        <View style={styles.headerRule}>
          <View style={[styles.headerRuleHalf, { backgroundColor: data.primaryColor }]} />
          <View style={[styles.headerRuleHalf, { backgroundColor: data.accentColor }]} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.label}>{isPickup ? "Collect At" : "Billed To"}</Text>
            <Text style={styles.nameValue}>{isPickup ? data.appName : data.customerName}</Text>
            <Text style={styles.value}>
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
            </Text>
            <Text style={styles.value}>{addr.city}, {addr.province}, {addr.country}</Text>
            {isPickup
              ? <Text style={styles.value}>For: {data.customerName}{data.customerPhone ? ` · ${data.customerPhone}` : ""}</Text>
              : data.customerPhone && <Text style={styles.value}>{data.customerPhone}</Text>}
          </View>
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.label}>Order Date</Text>
            <Text style={[styles.value, { marginBottom: 10 }]}>
              {data.createdAt.toLocaleDateString("en-ZW", { year: "numeric", month: "long", day: "numeric" })}
            </Text>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={[styles.value, { marginBottom: 10 }]}>
              {isPickup && data.paymentMethod === "CASH_ON_DELIVERY"
                ? "Cash on Collection"
                : PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}
            </Text>
            <Text style={styles.label}>Fulfillment</Text>
            <Text style={styles.value}>{isPickup ? "Collect in store" : "Delivery"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colItem, styles.headerCell]}>Item</Text>
            <Text style={[styles.colSku, styles.headerCell]}>SKU</Text>
            <Text style={[styles.colQty, styles.headerCell]}>Qty</Text>
            <Text style={[styles.colPrice, styles.headerCell]}>Price</Text>
            <Text style={[styles.colSubtotal, styles.headerCell]}>Subtotal</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.variantSnapshot && <Text style={styles.variant}>{item.variantSnapshot}</Text>}
              </View>
              <Text style={[styles.colSku, styles.sku]}>{item.sku}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatUSD(item.price)}</Text>
              <Text style={styles.colSubtotal}>{formatUSD(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatUSD(data.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{isPickup ? "Collection" : "Delivery Fee"}</Text>
            <Text style={styles.totalsValue}>{data.deliveryFee > 0 ? formatUSD(data.deliveryFee) : "Free"}</Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{formatUSD(data.discount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatUSD(data.total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Thank you for shopping with {data.appName}.</Text>
      </Page>
    </Document>
  );
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument data={data} />);
}
