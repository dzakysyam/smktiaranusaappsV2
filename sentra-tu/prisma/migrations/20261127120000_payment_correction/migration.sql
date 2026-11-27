ALTER TABLE "StudentPayment" DROP CONSTRAINT "StudentPayment_status_check";
ALTER TABLE "StudentPayment" ADD COLUMN "voidedBy" TEXT;
ALTER TABLE "StudentPayment" ADD COLUMN "reason" TEXT;
ALTER TABLE "StudentPayment" ADD COLUMN "replacesPaymentId" TEXT;
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_status_check" CHECK ("status" IN ('PENDING','VERIFIED','REJECTED','VOIDED'));
CREATE INDEX "StudentPayment_status_idx" ON "StudentPayment"("status");
