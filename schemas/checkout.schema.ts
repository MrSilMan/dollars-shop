import { z } from "zod";

const ZWPhoneRegex = /^(077|078|071|073|074)\d{7}$/;

export const CheckoutContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(ZWPhoneRegex, "Enter a valid Zimbabwean mobile number (07X XXXXXXX)"),
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
    "Enter a valid Zimbabwean mobile number (07X XXXXXXX)"
  ),
  innbucksNumber: z.string().optional().refine(
    (val) => !val || ZWPhoneRegex.test(val),
    "Enter a valid Zimbabwean mobile number (07X XXXXXXX)"
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
