import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code não recebido" }, { status: 400 });
  }

  const response = await fetch(
    "https://sandbox.melhorenvio.com.br/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
        client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
        redirect_uri:
          "https://preornamental-mina-nutritively.ngrok-free.dev/api/melhorenvio/callback",
        code: code,
      }),
    },
  );

  const data = await response.json();

  return NextResponse.json(data);
}
