"use server";

import { createMelhorEnvioClient } from "@/lib/melhor-envio-client";

import type { CalculateShippingSchema, ShippingOption } from "./schema";
import { calculateShippingSchema } from "./schema";

type MelhorEnvioShippingResponse = {
  id?: number | string;
  name?: string;
  price?: string | number;
  delivery_time?: number | null;
  error?: string;
};

const parsePriceToCents = (price: string | number | undefined) => {
  if (typeof price === "number") {
    return Math.round(price * 100);
  }

  if (typeof price === "string") {
    const parsed = Number.parseFloat(price.replace(",", "."));
    if (Number.isFinite(parsed)) {
      return Math.round(parsed * 100);
    }
  }

  return 0;
};

export const calculateShipping = async (
  data: CalculateShippingSchema,
): Promise<ShippingOption[]> => {
  try {
    const parsedData = calculateShippingSchema.parse(data);

    const client = await createMelhorEnvioClient();

    if (!client) {
      console.error("[Calculate Shipping] Cliente Melhor Envio indisponível");
      return [];
    }

    const payload = {
      from: {
        postal_code: process.env.MELHOR_ENVIO_FROM_POSTAL_CODE,
        address: process.env.MELHOR_ENVIO_FROM_ADDRESS,
        number: "123",
      },
      to: {
        postal_code: parsedData.to.postal_code,
        address: parsedData.to.address,
        number: parsedData.to.number,
        city: parsedData.to.city,
        state_abbr: parsedData.to.state_abbr,
      },
      package: {
        height: 10,
        width: 15,
        length: 20,
        weight: 0.5,
      },
      services: "1,2",
    };

    console.log("[Calculate Shipping] Iniciando cálculo de frete", payload);

    const response = await client.post<MelhorEnvioShippingResponse[]>(
      "/me/shipment/calculate",
      payload,
    );

    const options = (response.data ?? [])
      .filter((service) => !service.error)
      .map((service) => ({
        id: String(service.id ?? ""),
        name: service.name ?? "Serviço",
        price: parsePriceToCents(service.price),
        delivery_time:
          typeof service.delivery_time === "number"
            ? service.delivery_time
            : null,
      }))
      .filter((service) => service.id);

    console.log("[Calculate Shipping] Opções de frete calculadas", options);

    return options;
  } catch (error) {
    console.error("[Calculate Shipping] Falha ao calcular frete:", error);
    return [];
  }
};
