import axios, { type AxiosInstance } from "axios";

import { getMelhorEnvioToken } from "@/lib/melhor-envio";

export async function createMelhorEnvioClient(): Promise<AxiosInstance | null> {
  try {
    const token = await getMelhorEnvioToken();

    if (!token) {
      console.error(
        "[Melhor Envio Client] Não foi possível obter token válido",
      );
      return null;
    }

    const baseURL =
      process.env.MELHOR_ENVIO_SANDBOX === "true"
        ? "https://sandbox.melhorenvio.com.br/api/v2"
        : "https://melhorenvio.com.br/api/v2";

    console.log("[Melhor Envio Client] Cliente Axios criado com sucesso");

    return axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (error) {
    console.error("[Melhor Envio Client] Erro ao criar cliente:", error);
    return null;
  }
}
