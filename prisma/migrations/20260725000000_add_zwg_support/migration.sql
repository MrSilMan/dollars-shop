-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "zwgRate" DECIMAL(12,4) NOT NULL DEFAULT 39;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "exchangeRate" DECIMAL(12,4);

