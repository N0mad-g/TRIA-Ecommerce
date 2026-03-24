"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { createMelhorEnvioShipment } from "@/actions/create-melhor-envio-shipment";
import { sendOrderEmail } from "@/actions/send-order-email";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdateOrderStatusSchema, updateOrderStatusSchema } from "./schema";

type EmailTypeByStatus = {
  processing: "order-processing";
  shipped: "order-shipped";
  delivered: "order-delivered";
};

const emailTypeByStatus: EmailTypeByStatus = {
  processing: "order-processing",
  shipped: "order-shipped",
  delivered: "order-delivered",
};

export const updateOrderStatus = async (data: UpdateOrderStatusSchema) => {
  updateOrderStatusSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Fetch order to check shipping method
  const existingOrder = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, data.orderId),
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  // If status is being changed to "shipped", create the Melhor Envio shipment first
  // Skip for pickup orders
  let shipmentResult: Awaited<
    ReturnType<typeof createMelhorEnvioShipment>
  > | null = null;

  const isPickup = existingOrder.shippingServiceId === "pickup";

  if (data.status === "shipped" && !isPickup) {
    console.log(
      "[Update Order Status] Criando etiqueta no Melhor Envio para pedido:",
      data.orderId,
    );

    shipmentResult = await createMelhorEnvioShipment({
      orderId: data.orderId,
    });

    if (!shipmentResult.ok) {
      console.error(
        "[Update Order Status] Falha ao criar etiqueta:",
        shipmentResult.error,
      );
      throw new Error(
        `Falha ao gerar etiqueta: ${shipmentResult.error}. O status do pedido não foi atualizado.`,
      );
    }

    console.log(
      "[Update Order Status] Etiqueta criada com sucesso",
      shipmentResult.data,
    );
  } else if (data.status === "shipped" && isPickup) {
    console.log(
      "[Update Order Status] Pickup order - skipping Melhor Envio shipment creation",
      data.orderId,
    );
  }

  const [order] = await db
    .update(orderTable)
    .set({
      status: data.status,
    })
    .where(eq(orderTable.id, data.orderId))
    .returning();

  // Only send email if a template exists for this status
  const emailType =
    emailTypeByStatus[data.status as keyof typeof emailTypeByStatus];
  if (emailType) {
    await sendOrderEmail({
      orderId: order.id,
      type: emailType,
    });
  }

  return {
    order,
    shipment: shipmentResult?.ok ? shipmentResult.data : undefined,
  };
};
