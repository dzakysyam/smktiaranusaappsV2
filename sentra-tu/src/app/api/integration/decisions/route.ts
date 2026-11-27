import { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { z } from "zod";

import { store } from "@/lib/prisma-store";
import { respond } from "@/lib/request";
import { applyDecision, DomainError } from "@/lib/workflow";

const shape = z
  .object({
    id: z.string().uuid(),
    reportId: z.string().uuid(),
    version: z.number().int().positive(),
    action: z.enum(["approve", "revision"]),
    feedback: z.string().max(2000),
    actor: z.string().min(1),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const issuer = process.env.OIDC_ISSUER;
    const jwks = process.env.OIDC_JWKS_URI;
    const audience = process.env.OIDC_SERVICE_AUDIENCE;

    if (!issuer || !jwks || !audience) {
      throw new DomainError(503, "OIDC layanan belum diatur");
    }

    const bearer = req.headers.get("authorization");
    if (!bearer?.startsWith("Bearer ")) {
      throw new DomainError(401, "Token layanan diperlukan");
    }

    const { payload } = await jwtVerify(
      bearer.slice(7),
      createRemoteJWKSet(new URL(jwks)),
      { issuer, audience },
    );

    const scopes = typeof payload.scope === "string"
      ? payload.scope.split(" ")
      : [];

    if (!scopes.includes("tu:review:write")) {
      throw new DomainError(403, "Scope tidak cukup");
    }

    const input = shape.safeParse(await req.json());
    if (!input.success) {
      throw new DomainError(400, "Keputusan tidak valid");
    }

    if (payload.sub !== input.data.actor) {
      throw new DomainError(403, "Identitas tidak cocok");
    }

    const result = await applyDecision(store, input.data);
    return Response.json(result);
  } catch (error) {
    return respond(error);
  }
}