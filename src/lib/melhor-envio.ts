import { db } from "@/db";
import { melhorEnvioTokenTable } from "@/db/schema";

type MelhorEnvioTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

const getOAuthBaseUrl = () =>
  process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";

export async function getMelhorEnvioToken(): Promise<string | null> {
  try {
    const tokenRecord = await db.query.melhorEnvioTokenTable.findFirst({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    if (!tokenRecord) {
      console.log("[Melhor Envio] Nenhum token encontrado no banco");
      return null;
    }

    const isExpired = tokenRecord.expiresAt.getTime() <= Date.now();

    if (!isExpired) {
      console.log("[Melhor Envio] Token válido encontrado no banco");
      return tokenRecord.accessToken;
    }

    console.log("[Melhor Envio] Token expirado, iniciando refresh automático");

    const refreshResponse = await fetch(`${getOAuthBaseUrl()}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
        client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
        refresh_token: tokenRecord.refreshToken,
      }),
    });

    const refreshData =
      (await refreshResponse.json()) as MelhorEnvioTokenResponse;

    if (!refreshResponse.ok) {
      console.error("[Melhor Envio] Falha ao atualizar token:", refreshData);
      return null;
    }

    if (
      !refreshData.access_token ||
      !refreshData.refresh_token ||
      !refreshData.expires_in
    ) {
      console.error(
        "[Melhor Envio] Resposta de refresh inválida:",
        refreshData,
      );
      return null;
    }

    const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000);

    await db.delete(melhorEnvioTokenTable);
    await db.insert(melhorEnvioTokenTable).values({
      accessToken: refreshData.access_token,
      refreshToken: refreshData.refresh_token,
      expiresAt,
      updatedAt: new Date(),
    });

    console.log("[Melhor Envio] Token atualizado e salvo com sucesso");

    return refreshData.access_token;
  } catch (error) {
    console.error("[Melhor Envio] Erro ao obter token:", error);
    return null;
  }
}
