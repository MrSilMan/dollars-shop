-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "contactAddress" TEXT NOT NULL DEFAULT '123 Samora Machel Ave, Harare, Zimbabwe',
ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT 'hello@dollarshop.co.zw',
ADD COLUMN     "contactHours" TEXT NOT NULL DEFAULT 'Mon–Sat: 8AM–6PM
Sun: 9AM–1PM',
ADD COLUMN     "contactPhone" TEXT NOT NULL DEFAULT '+263 77 256 6468',
ADD COLUMN     "facebookUrl" TEXT NOT NULL DEFAULT 'https://facebook.com/dollarshopzw',
ADD COLUMN     "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/dollarshopzw';

