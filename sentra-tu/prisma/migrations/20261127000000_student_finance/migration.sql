CREATE TABLE "StudentCharge" (
 "id" TEXT NOT NULL,
 "studentRef" TEXT NOT NULL,
 "kind" TEXT NOT NULL,
 "period" TEXT NOT NULL,
 "amount" INTEGER NOT NULL,
 "createdBy" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudentCharge_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "StudentCharge_amount_check" CHECK ("amount" > 0 AND "amount" <= 2000000000),
 CONSTRAINT "StudentCharge_kind_check" CHECK ("kind" IN ('SPP','SPMB','TAHUNAN'))
);
CREATE UNIQUE INDEX "StudentCharge_studentRef_kind_period_key" ON "StudentCharge"("studentRef","kind","period");
CREATE INDEX "StudentCharge_studentRef_idx" ON "StudentCharge"("studentRef");
CREATE TABLE "StudentPayment" (
 "id" TEXT NOT NULL,
 "chargeId" TEXT NOT NULL,
 "amount" INTEGER NOT NULL,
 "reference" TEXT NOT NULL,
 "recordedBy" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "verifiedBy" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudentPayment_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "StudentPayment_amount_check" CHECK ("amount" > 0 AND "amount" <= 2000000000),
 CONSTRAINT "StudentPayment_status_check" CHECK ("status" IN ('PENDING','VERIFIED'))
);
CREATE UNIQUE INDEX "StudentPayment_reference_key" ON "StudentPayment"("reference");
CREATE INDEX "StudentPayment_chargeId_idx" ON "StudentPayment"("chargeId");
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "StudentCharge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "FinanceAudit" (
 "id" TEXT NOT NULL,
 "targetId" TEXT NOT NULL,
 "action" TEXT NOT NULL,
 "actorId" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "FinanceAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FinanceAudit_targetId_createdAt_idx" ON "FinanceAudit"("targetId","createdAt");
