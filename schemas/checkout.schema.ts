import { z } from "zod";
// "mobile" metadata: per-country mobile numbering rules only, which is both the
// rule we want and a third of the bundle of the full dataset.
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/mobile";

const ZWPhoneRegex = /^(077|078|071|073|074)\d{7}$/;
/** The same local number once normalised to E.164 by ContactPhoneSchema. */
const ZWPhoneE164Regex = /^\+263(71|73|74|77|78)\d{7}$/;

export const ZWPhoneMessage = "Enter a valid Zimbabwean mobile number (07X XXXXXXX)";

/**
 * Strict Zimbabwean mobile. EcoCash and InnBucks can only prompt a local
 * wallet, so every number that ends up as an MSISDN keeps this rule — only the
 * contact number below is allowed to be foreign.
 */
export const ZWPhoneSchema = z.string().regex(ZWPhoneRegex, ZWPhoneMessage);

/**
 * Contact number for order updates. Customers abroad order for family here, so
 * any country's mobile number is accepted, validated against that country's own
 * numbering rules rather than one regex. A bare local number ("07XXXXXXXX") is
 * still read as Zimbabwean, and everything is stored in E.164 so notifications
 * and the admin tools see one format.
 */
export const ContactPhoneSchema = z
  .string()
  .trim()
  .refine(
    (val) => isValidPhoneNumber(val, "ZW"),
    "Enter a valid mobile number — if you are outside Zimbabwe, include your country code, starting with +"
  )
  .transform((val) => parsePhoneNumberFromString(val, "ZW")?.number ?? val);

export const CheckoutContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: ContactPhoneSchema,
});

// Omitted by older clients, so it stays optional and callers treat a missing
// value as DELIVERY — the behaviour before pickup existed.
export const FulfillmentSchema = z.object({
  fulfillmentType: z.enum(["DELIVERY", "PICKUP"]).optional(),
});

export const ProvinceEnum = z.enum([
  "Harare",
  "Bulawayo",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
]);

export const AddressLine1Schema = z.string().min(5, "Address must be at least 5 characters");
export const AddressCitySchema = z.string().min(2, "Enter your city");

// Address fields are only filled in for DELIVERY orders — a PICKUP order is
// collected at the shop, so they are left blank here and enforced by the refine
// on CheckoutFormSchema below.
export const CheckoutAddressSchema = z.object({
  line1: AddressLine1Schema.optional(),
  line2: z.string().optional(),
  city: AddressCitySchema.optional(),
  province: ProvinceEnum.optional(),
});

export const CheckoutPaymentSchema = z.object({
  method: z.enum(["ECOCASH", "INNBUCKS", "CASH_ON_DELIVERY"]),
  // Which currency the EcoCash charge is settled in (prices are always USD)
  paymentCurrency: z.enum(["USD", "ZWG"]).optional(),
  ecocashNumber: z.string().optional().refine(
    (val) => !val || ZWPhoneRegex.test(val),
    ZWPhoneMessage
  ),
  innbucksNumber: z.string().optional().refine(
    (val) => !val || ZWPhoneRegex.test(val),
    ZWPhoneMessage
  ),
});

export const CouponField = z.object({
  couponCode: z.string().optional(),
  couponId: z.string().optional(),
  discountAmount: z.number().min(0).optional(),
});

export const CheckoutFormSchema = CheckoutContactSchema
  .merge(CheckoutAddressSchema)
  .merge(CheckoutPaymentSchema)
  .merge(CouponField)
  .merge(FulfillmentSchema)
  .superRefine((data, ctx) => {
    // The wallet prompt falls back to the contact number when its own field is
    // left blank, which only holds up while that number is Zimbabwean. A
    // foreign contact number has to name the local wallet to charge.
    if (!ZWPhoneE164Regex.test(data.phone)) {
      if (data.method === "ECOCASH" && !data.ecocashNumber) {
        ctx.addIssue({ code: "custom", path: ["ecocashNumber"], message: ZWPhoneMessage });
      }
      if (data.method === "INNBUCKS" && !data.innbucksNumber) {
        ctx.addIssue({ code: "custom", path: ["innbucksNumber"], message: ZWPhoneMessage });
      }
    }

    if (data.fulfillmentType === "PICKUP") return;
    if (!data.line1 || data.line1.length < 5) {
      ctx.addIssue({ code: "custom", path: ["line1"], message: "Address must be at least 5 characters" });
    }
    if (!data.city || data.city.length < 2) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your city" });
    }
    if (!data.province) {
      ctx.addIssue({ code: "custom", path: ["province"], message: "Select your province" });
    }
  });

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
export type CheckoutContact = z.infer<typeof CheckoutContactSchema>;
export type CheckoutAddress = z.infer<typeof CheckoutAddressSchema>;
export type CheckoutPayment = z.infer<typeof CheckoutPaymentSchema>;
