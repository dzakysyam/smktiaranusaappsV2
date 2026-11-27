import { NextRequest } from "next/server";
import * as oidc from "openid-client";
import { oidcConfig } from "@/lib/auth";
import { store } from "@/lib/prisma-store";
import { actor, guard } from "@/lib/request";
import { deliverReport } from "@/lib/report-delivery";
import { flushOutbox, DomainError } from "@/lib/workflow";

export async function POST(req: NextRequest) {
  return guard(req, async () => {
    if (actor(req).role !== "tu_staff") throw new DomainError(403, "Akses ditolak");
    const url = process.env.HUMANIS_REPORT_URL;
    if (!url || !process.env.OIDC_CLIENT_SECRET) throw new DomainError(503, "Pengiriman laporan belum dikonfigurasi");
    // IdP wajib menerbitkan token layanan dengan audience/scope yang disepakati bersama Humanis.
    await flushOutbox(store, async (payload, eventId) => {
      const tokens = await oidc.clientCredentialsGrant(await oidcConfig(), { scope: "reports:submit" });
      await deliverReport(payload, eventId, { url, token: tokens.access_token });
    });
    return { ok: true };
  });
}
