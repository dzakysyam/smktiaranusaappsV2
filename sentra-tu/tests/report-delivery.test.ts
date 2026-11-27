import { test } from "node:test";
import assert from "node:assert/strict";
import { deliverReport } from "../src/lib/report-delivery";

const eventId = "6b606a34-8be4-414c-8b3d-f32c77f20ee7";
const payload = { sourceSystem: "SENTRA", reportId: "report-1", version: 1 };
const config = { url: "https://humanis.example/api/v1/integrations/tu/reports", token: "uji-token" };

test("pengiriman laporan memakai bearer layanan dan idempotency key", async () => {
  let request: Request | undefined;
  await deliverReport(payload, eventId, config, async (input, init) => {
    request = new Request(input, init);
    return Response.json({ acceptedVersion: 1 }, { status: 200 });
  });
  assert.equal(request?.method, "POST");
  assert.equal(request?.headers.get("authorization"), "Bearer uji-token");
  assert.equal(request?.headers.get("idempotency-key"), eventId);
  assert.deepEqual(await request?.json(), payload);
});

test("respons tidak cocok dan kegagalan HTTP tidak menandai terkirim", async () => {
  await assert.rejects(deliverReport(payload, eventId, config, async () => Response.json({ acceptedVersion: 2 })), /konfirmasi/i);
  await assert.rejects(deliverReport(payload, eventId, config, async () => new Response(null, { status: 503 })), /gagal/i);
});

test("tujuan tanpa HTTPS dan kunci tidak valid ditolak sebelum jaringan", async () => {
  let called = false;
  const fetcher = async () => { called = true; return Response.json({ acceptedVersion: 1 }); };
  await assert.rejects(deliverReport(payload, eventId, { ...config, url: "http://humanis.example/reports" }, fetcher), /HTTPS/);
  await assert.rejects(deliverReport(payload, "invalid", config, fetcher), /idempotensi/i);
  assert.equal(called, false);
});
