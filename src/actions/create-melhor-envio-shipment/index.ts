"use server";

import { AxiosError } from "axios";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { createMelhorEnvioClient } from "@/lib/melhor-envio-client";

import {
  type CreateMelhorEnvioShipmentResponse,
  type CreateMelhorEnvioShipmentSchema,
  createMelhorEnvioShipmentSchema,
} from "./schema";

type MelhorEnvioCartResponse = {
  id?: string; // cart / order UUID returned by Melhor Envio
  protocol?: string; // human-readable protocol
  status?: string;
  service_id?: number;
  price?: number;
  error?: string;
  message?: string;
};

type MelhorEnvioShipmentResponse = {
  id?: string;
  status?: string;
  error?: string;
};

type MelhorEnvioTrackingResponse = {
  id?: string;
  protocol?: string;
  tracking?: string;
  label?: string;
  print_url?: string;
  self_tracking?: string;
  error?: string;
};

export const createMelhorEnvioShipment = async (
  data: CreateMelhorEnvioShipmentSchema,
): Promise<CreateMelhorEnvioShipmentResponse> => {
  try {
    createMelhorEnvioShipmentSchema.parse(data);

    console.log("[Create Melhor Envio Shipment] Iniciando criação de etiqueta");

    // Fetch order with items
    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, data.orderId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error("[Create Melhor Envio Shipment] Pedido não encontrado");
      return {
        ok: false,
        error: "Pedido não encontrado",
      };
    }

    // If order already has tracking, skip creation
    if (order.trackingCode) {
      console.log(
        "[Create Melhor Envio Shipment] Pedido já possui rastreamento, pulando criação",
      );

      return {
        ok: true,
        data: {
          melhorEnvioOrderId: order.melhorEnvioOrderId ?? "",
          trackingCode: order.trackingCode ?? "",
          shippingLabelUrl: order.shippingLabelUrl ?? "",
        },
      };
    }

    // Use shippingServiceId stored on the order (copied from cart at checkout)
    const shippingServiceId = order.shippingServiceId;

    console.log("📦 Using shipping service:", shippingServiceId);

    if (!shippingServiceId) {
      console.error(
        "[Create Melhor Envio Shipment] Pedido não possui serviço de envio configurado",
      );
      return {
        ok: false,
        error:
          "Pedido não possui serviço de envio configurado. Certifique-se de que o frete foi calculado durante o checkout.",
      };
    }

    const client = await createMelhorEnvioClient();

    if (!client) {
      console.error(
        "[Create Melhor Envio Shipment] Cliente Melhor Envio indisponível",
      );
      return {
        ok: false,
        error: "Serviço de envio indisponível no momento",
      };
    }

    // Step 1: Create cart in Melhor Envio
    console.log(
      "[Create Melhor Envio Shipment] Passo 1: Criando carrinho no Melhor Envio",
    );
    // Validate and sanitize sender documents (CPF/CNPJ) from env
    const fromDocumentRaw = process.env.MELHOR_ENVIO_FROM_DOCUMENT || "";
    const fromCompanyRaw = process.env.MELHOR_ENVIO_FROM_CNPJ || "";
    const fromDocument = String(fromDocumentRaw).replace(/\D/g, "");
    const companyDocument = String(fromCompanyRaw).replace(/\D/g, "");

    const isSandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";

    if (
      !isSandbox &&
      (fromDocument.length !== 11 || companyDocument.length !== 14)
    ) {
      return {
        ok: false,
        error:
          "Configuração inválida do remetente para Melhor Envio. Defina MELHOR_ENVIO_FROM_DOCUMENT (CPF - 11 dígitos) e MELHOR_ENVIO_FROM_CNPJ (CNPJ - 14 dígitos) em .env.local",
      };
    }

    const cartPayload = {
      service: Number(shippingServiceId),
      agency: null,
      from: {
        name: process.env.MELHOR_ENVIO_FROM_NAME || "Studio Montenegro",
        phone: process.env.MELHOR_ENVIO_FROM_PHONE
          ? String(process.env.MELHOR_ENVIO_FROM_PHONE).replace(/\D/g, "")
          : "11999999999",
        email:
          process.env.MELHOR_ENVIO_FROM_EMAIL ||
          "contato@studiomontenegro.com.br",
        document: fromDocument,
        company_document: companyDocument,
        state_register: "",
        postal_code: process.env.MELHOR_ENVIO_FROM_POSTAL_CODE,
        address: process.env.MELHOR_ENVIO_FROM_ADDRESS,
        number: process.env.MELHOR_ENVIO_FROM_NUMBER || "123",
        complement: "",
        district: process.env.MELHOR_ENVIO_FROM_DISTRICT || "Centro",
        city: process.env.MELHOR_ENVIO_FROM_CITY,
        state_abbr: process.env.MELHOR_ENVIO_FROM_STATE,
        country_id: "BR",
      },
      to: {
        name: order.recipientName,
        phone: order.phone ? order.phone.replace(/\D/g, "") : "",
        email: order.email,
        document: order.cpfOrCnpj ? order.cpfOrCnpj.replace(/\D/g, "") : "",
        postal_code: order.zipCode ? order.zipCode.replace(/\D/g, "") : "",
        address: order.street,
        number: order.number,
        complement: order.complement || "",
        district: order.neighborhood,
        city: order.city,
        state_abbr: order.state,
        country_id: "BR",
      },
      products: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitary_value: item.priceInCents / 100,
      })),
      volumes: [
        {
          height: 10,
          width: 15,
          length: 20,
          weight: 0.5,
        },
      ],
      options: {
        insurance_value: order.totalPriceInCents / 100,
        receipt: false,
        own_hand: false,
        collect: false,
      },
    };

    console.log(
      "[Create Melhor Envio Shipment] Payload do carrinho:",
      JSON.stringify(cartPayload, null, 2),
    );
    let cartResponse;
    try {
      cartResponse = await client.post<MelhorEnvioCartResponse>(
        "/me/cart",
        cartPayload,
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error(
        "[Create Melhor Envio Shipment] Melhor Envio /me/cart error:",
        error?.response?.data ?? err,
      );
      const responseData = error?.response?.data as
        | MelhorEnvioCartResponse
        | undefined;
      const msg =
        responseData?.message ||
        responseData?.error ||
        error?.message ||
        "Não foi possível criar carrinho no Melhor Envio";
      return { ok: false, error: msg };
    }

    if (!cartResponse.data?.id && !cartResponse.data?.protocol) {
      console.error(
        "[Create Melhor Envio Shipment] Falha ao criar carrinho:",
        cartResponse.data,
      );
      return {
        ok: false,
        error:
          cartResponse.data?.error ||
          cartResponse.data?.message ||
          "Não foi possível criar carrinho no Melhor Envio",
      };
    }

    const melhorEnvioOrderId = String(
      cartResponse.data.id ?? cartResponse.data.protocol,
    );
    console.log(
      "[Create Melhor Envio Shipment] Carrinho criado com sucesso:",
      melhorEnvioOrderId,
    );
    console.log(
      "[Create Melhor Envio Shipment] Protocol:",
      cartResponse.data.protocol,
    );

    // Debug: log full cart response and try to fetch cart & balance
    try {
      console.log(
        "[Create Melhor Envio Shipment] Cart raw response:",
        cartResponse.data,
      );
      const meCart = await client.get(`/me/cart/${melhorEnvioOrderId}`);
      console.log(
        "[Create Melhor Envio Shipment] /me/cart details:",
        meCart.data,
      );
    } catch {
      console.warn(
        "[Create Melhor Envio Shipment] Could not fetch /me/cart details",
      );
    }

    try {
      const balanceResp = await client.get(`/me/balance`);
      console.log(
        "[Create Melhor Envio Shipment] Account balance:",
        balanceResp.data,
      );
    } catch {
      console.warn(
        "[Create Melhor Envio Shipment] Could not fetch /me/balance",
      );
    }

    // Step 2: Checkout cart - add detailed error handling for 403/permission issues
    console.log(
      "[Create Melhor Envio Shipment] Passo 2: Realizando checkout do carrinho",
    );
    try {
      // Log token prefix for debugging token permissions
      try {
        const headersDefaults = client.defaults.headers as unknown;
        if (headersDefaults && typeof headersDefaults === "object") {
          const tokenHeader = (headersDefaults as Record<string, unknown>)[
            "Authorization"
          ];
          if (typeof tokenHeader === "string") {
            console.log("🔑 Using token:", tokenHeader.slice(0, 20), "...");
          }
        }
      } catch {
        /* ignore */
      }

      const checkoutResponse = await client.post<MelhorEnvioShipmentResponse>(
        "/me/shipment/checkout",
        {
          orders: [melhorEnvioOrderId],
        },
      );

      if (checkoutResponse.data?.error) {
        console.error(
          "[Create Melhor Envio Shipment] Falha no checkout:",
          checkoutResponse.data.error,
        );
        return {
          ok: false,
          error:
            checkoutResponse.data.error ||
            "Falha ao confirmar envio no Melhor Envio",
        };
      }

      console.log(
        "[Create Melhor Envio Shipment] Checkout realizado com sucesso",
      );
    } catch (err: unknown) {
      const error = err as AxiosError;
      const resp = (error as unknown as { response?: Record<string, unknown> })
        ?.response;
      console.error("[Create Melhor Envio Shipment] Checkout error details:", {
        status: resp?.status,
        statusText: resp?.statusText,
        data: resp?.data,
        headers: resp?.headers,
      });

      const responseData = resp?.data as unknown as
        | { message?: string; error?: string }
        | undefined;
      const errorMsg =
        responseData?.message ||
        responseData?.error ||
        "Checkout failed - check token permissions and account balance";
      return { ok: false, error: errorMsg };
    }

    // Step 3: Generate label
    console.log(
      "[Create Melhor Envio Shipment] Passo 3: Gerando etiqueta de envio",
    );

    const generateResponse = await client.post<MelhorEnvioShipmentResponse>(
      "/me/shipment/generate",
      {
        orders: [melhorEnvioOrderId],
      },
    );

    if (generateResponse.data?.error) {
      console.error(
        "[Create Melhor Envio Shipment] Falha ao gerar etiqueta:",
        generateResponse.data.error,
      );
      return {
        ok: false,
        error:
          generateResponse.data.error ||
          "Falha ao gerar etiqueta no Melhor Envio",
      };
    }

    console.log("[Create Melhor Envio Shipment] Etiqueta gerada com sucesso");

    // Step 4: Get tracking code and label URL
    console.log(
      "[Create Melhor Envio Shipment] Passo 4: Recuperando código de rastreamento e URL da etiqueta",
    );

    const trackingResponse = await client.get<MelhorEnvioTrackingResponse>(
      `/me/shipment/${melhorEnvioOrderId}`,
    );

    if (trackingResponse.data?.error) {
      // In sandbox mode, tracking might not be available immediately
      if (isSandbox) {
        console.warn(
          "[Create Melhor Envio Shipment] Rastreamento não disponível em modo sandbox, continuando com valores padrão",
        );
      } else {
        console.error(
          "[Create Melhor Envio Shipment] Falha ao recuperar rastreamento:",
          trackingResponse.data.error,
        );
        return {
          ok: false,
          error:
            trackingResponse.data.error ||
            "Falha ao recuperar código de rastreamento",
        };
      }
    }

    const trackingInfo = trackingResponse.data;
    console.log(
      "[Create Melhor Envio Shipment] Informações de rastreamento completas:",
      trackingInfo,
    );

    // Extract tracking code and label URL - check multiple possible field names
    const trackingCode =
      trackingInfo?.tracking ||
      trackingInfo?.self_tracking ||
      "PENDING_SANDBOX";
    const shippingLabelUrl =
      trackingInfo?.label || trackingInfo?.print_url || "";

    // Only fail if we're in production and tracking is missing
    if (!trackingCode && !isSandbox) {
      console.error(
        "[Create Melhor Envio Shipment] Dados de rastreamento incompletos:",
        trackingInfo,
      );
      return {
        ok: false,
        error: "Dados de rastreamento incompletos",
      };
    }

    console.log(
      "[Create Melhor Envio Shipment] Código de rastreamento:",
      trackingCode,
    );
    console.log(
      "[Create Melhor Envio Shipment] URL da etiqueta:",
      shippingLabelUrl,
    );

    // Step 5: Update order in database
    console.log(
      "[Create Melhor Envio Shipment] Passo 5: Atualizando pedido no banco de dados",
    );

    await db
      .update(orderTable)
      .set({
        melhorEnvioOrderId,
        trackingCode,
        shippingLabelUrl,
      })
      .where(eq(orderTable.id, data.orderId));

    console.log("[Create Melhor Envio Shipment] Pedido atualizado com sucesso");

    return {
      ok: true,
      data: {
        melhorEnvioOrderId,
        trackingCode,
        shippingLabelUrl,
      },
    };
  } catch (error) {
    console.error("[Create Melhor Envio Shipment] Erro:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return {
      ok: false,
      error: errorMessage,
    };
  }
};
