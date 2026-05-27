import { z } from "zod";

const ZWPhoneRegex = /^(077|078|071|073|074)\d{7}$/;

export const CheckoutContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(ZWPhoneRegex, "Enter a valid Zimbabwean mobile number (07X XXXXXXX)"),
});

export const CheckoutAddressSchema = z.object({
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2),
  province: z.enum([
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
  ]),
});

export const CheckoutPaymentSchema = z.object({
  method: z.enum(["ECOCASH", "INNBUCKS"]),
  ecocashNumber: z.string().regex(ZWPhoneRegex).optional(),
  innbucksNumber: z.string().regex(ZWPhoneRegex).optional(),
});

export const CheckoutFormSchema = CheckoutContactSchema.merge(CheckoutAddressSchema).merge(
  CheckoutPaymentSchema
);

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
export type CheckoutContact = z.infer<typeof CheckoutContactSchema>;
export type CheckoutAddress = z.infer<typeof CheckoutAddressSchema>;
export type CheckoutPayment = z.infer<typeof CheckoutPaymentSchema>;
