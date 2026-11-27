/** Pengirim outbox SENTRA. Endpoint penerima wajib memberikan receipt versi. */
export async function deliverReport(
  payload: unknown,
  eventId: string,
  config: { url: string; token: string },
  fetcher: typeof fetch = fetch,
): Promise<void> {
  const url = new URL(config.url);
  if (url.protocol !== "https:") throw Error("Tujuan laporan wajib HTTPS");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)) throw Error("Kunci idempotensi tidak valid");
  if (!config.token) throw Error("Token layanan kosong");
  const version = (payload as { version?: unknown } | null)?.version;
  if (!Number.isInteger(version)) throw Error("Versi laporan tidak valid");
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.token}`,
      "idempotency-key": eventId,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw Error(`Pengiriman gagal: HTTP ${response.status}`);
  const receipt: unknown = await response.json();
  if (!receipt || typeof receipt !== "object" || (receipt as { acceptedVersion?: unknown }).acceptedVersion !== version) {
    throw Error("Konfirmasi versi laporan tidak cocok");
  }
}
