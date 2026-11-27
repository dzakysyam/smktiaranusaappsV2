import { NextRequest, NextResponse } from "next/server";
import * as oidc from "openid-client";
import { oidcConfig, roleFromClaims, safeReturn, seal, unseal } from "@/lib/auth";

type Flow = {
  verifier: string;
  state: string;
  target: string;
  expires: number;
};

export async function GET(req: NextRequest) {
  const flow = unseal<Flow>(req.cookies.get("tu_flow")?.value ?? "");

  if (!flow || flow.expires < Date.now()) {
    return new NextResponse("Alur login kedaluwarsa", { status: 401 });
  }

  try {
    const cfg = await oidcConfig();
    const tokens = await oidc.authorizationCodeGrant(cfg, new URL(req.url), {
      pkceCodeVerifier: flow.verifier,
      expectedState: flow.state,
      expectedNonce: undefined,
    });

    const claims = tokens.claims();
    if (!claims?.sub) throw new Error("Subjek OIDC kosong");

    const user = await oidc.fetchUserInfo(cfg, tokens.access_token, claims.sub);
    const role = roleFromClaims(user as Record<string, unknown>);

    if (!role) {
      return new NextResponse("Akses TU tidak diizinkan", { status: 403 });
    }

    const res = NextResponse.redirect(new URL(safeReturn(flow.target), req.url));

    res.cookies.set(
      "tu_session",
      seal({
        actor: { subject: claims.sub, role },
        expires: Date.now() + 3_600_000,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600,
        path: "/",
      },
    );

    res.cookies.delete("tu_flow");
    return res;
  } catch {
    return new NextResponse("Autentikasi gagal", { status: 401 });
  }
}