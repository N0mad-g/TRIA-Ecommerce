import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { melhorEnvioTokenTable } from "@/db/schema";

type MelhorEnvioOAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code não recebido" }, { status: 400 });
    }

    const tokenUrl =
      process.env.MELHOR_ENVIO_SANDBOX === "true"
        ? "https://sandbox.melhorenvio.com.br/oauth/token"
        : "https://melhorenvio.com.br/oauth/token";

    console.log("[Melhor Envio Callback] Iniciando troca de code por token");

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
        client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
        redirect_uri: "https://smgrow.com.br/api/melhorenvio/callback",
        code,
      }),
    });

    const data = (await response.json()) as MelhorEnvioOAuthResponse;

    if (!response.ok) {
      console.error("[Melhor Envio Callback] Erro ao obter token:", data);
      return NextResponse.json(
        {
          error: data.error ?? "Erro ao obter token do Melhor Envio",
          details: data.error_description,
        },
        { status: 400 },
      );
    }

    if (!data.access_token || !data.refresh_token || !data.expires_in) {
      console.error("[Melhor Envio Callback] Payload inválido:", data);
      return NextResponse.json(
        { error: "Resposta de token inválida do Melhor Envio" },
        { status: 500 },
      );
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await db.delete(melhorEnvioTokenTable);
    await db.insert(melhorEnvioTokenTable).values({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      updatedAt: new Date(),
    });

    console.log("[Melhor Envio Callback] Tokens salvos com sucesso");

    return NextResponse.json({
      success: true,
      message: "Autenticação do Melhor Envio concluída com sucesso",
    });
  } catch (error) {
    console.error("[Melhor Envio Callback] Erro inesperado:", error);
    return NextResponse.json(
      { error: "Falha ao processar callback do Melhor Envio" },
      { status: 500 },
    );
  }
}
