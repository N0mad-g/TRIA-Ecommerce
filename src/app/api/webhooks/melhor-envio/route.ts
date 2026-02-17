import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { sendOrderEmail } from "@/actions/send-order-email";
import { db } from "@/db";
import { orderTable } from "@/db/schema";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

type EmailType =
  | "order-created"
  | "payment-pending"
  | "payment-approved"
  | "order-processing"
  | "order-shipped"
  | "order-delivered";

type MelhorEnvioWebhookPayload = {
  event?: string;
  data?: {
    id?: string;
    status?: string;
    tracking?: string;
    delivered_at?: string;
    posted_at?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    console.log("[Melhor Envio Webhook] Recebendo notificação");

    const payload = (await request.json()) as MelhorEnvioWebhookPayload;

    console.log(
      "[Melhor Envio Webhook] Payload:",
      JSON.stringify(payload, null, 2),
    );

    // Validate payload
    if (!payload.event || !payload.data?.id) {
      console.error("[Melhor Envio Webhook] Payload inválido");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { event, data } = payload;
    const melhorEnvioOrderId = data.id as string | undefined;

    // Find order by melhorEnvioOrderId
    if (!melhorEnvioOrderId) {
      console.error(
        "[Melhor Envio Webhook] Melhor Envio Order ID não fornecido",
      );
      return NextResponse.json(
        { error: "Missing melhor envio order ID" },
        { status: 400 },
      );
    }

    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.melhorEnvioOrderId, melhorEnvioOrderId as string),
    });

    if (!order) {
      console.error(
        "[Melhor Envio Webhook] Pedido não encontrado:",
        melhorEnvioOrderId,
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("[Melhor Envio Webhook] Pedido encontrado:", order.id);
    console.log("[Melhor Envio Webhook] Event:", event);
    console.log("[Melhor Envio Webhook] Melhor Envio Status:", data.status);

    // Map Melhor Envio status to our order status
    let newStatus: OrderStatus | null = null;
    let shouldSendEmail = false;
    let emailType: EmailType | null = null;

    switch (data.status?.toLowerCase()) {
      case "pending":
        // Order is pending - usually stays in current state
        newStatus = "pending";
        break;

      case "paid":
        // Payment confirmed
        newStatus = "paid";
        shouldSendEmail = true;
        emailType = "payment-approved";
        break;

      case "posted":
      case "in_transit":
        // Order shipped/in transit
        newStatus = "shipped";
        // Email already sent when admin changed status to shipped
        break;

      case "delivered":
        // Order delivered - important status change
        newStatus = "delivered";
        shouldSendEmail = true;
        emailType = "order-delivered";
        break;

      case "canceled":
        // Order cancelled
        newStatus = "canceled";
        break;

      case "returned":
        // Package returned to sender
        console.log(
          "[Melhor Envio Webhook] Pedido retornado:",
          order.id,
          "Status Melhor Envio:",
          data.status,
        );
        // Keep current status but log for investigation
        break;

      default:
        console.log("[Melhor Envio Webhook] Status não mapeado:", data.status);
      // Unknown status - don't update
    }

    // Update order status if changed
    if (newStatus && newStatus !== order.status) {
      console.log(
        `[Melhor Envio Webhook] Atualizando status: ${order.status} → ${newStatus}`,
      );

      await db
        .update(orderTable)
        .set({
          status: newStatus,
          // Update tracking code if provided and not already set
          trackingCode: data.tracking || order.trackingCode,
        })
        .where(eq(orderTable.id, order.id));

      console.log("[Melhor Envio Webhook] Status atualizado com sucesso");

      // Send email notification if applicable and flag is enabled
      if (shouldSendEmail && emailType) {
        // Check if user enabled this notification
        const notificationKey = emailType
          .replace("order-", "")
          .replace("-", "");
        const emailNotifications = order.emailNotifications as Record<
          string,
          boolean
        > | null;
        const isNotificationEnabled =
          emailNotifications?.[
            notificationKey as keyof typeof emailNotifications
          ] ?? false;

        if (isNotificationEnabled) {
          console.log(
            `[Melhor Envio Webhook] Enviando email: ${emailType} (notificação ativada)`,
          );

          try {
            await sendOrderEmail({
              orderId: order.id,
              type: emailType,
            });

            console.log("[Melhor Envio Webhook] Email enviado com sucesso");
          } catch (error) {
            console.error(
              "[Melhor Envio Webhook] Falha ao enviar email:",
              error,
            );
            // Don't fail webhook if email fails - order status is updated
          }
        } else {
          console.log(
            `[Melhor Envio Webhook] Email não enviado: notificação desativada pelo usuário (${notificationKey})`,
          );
        }
      }
    } else if (newStatus === order.status) {
      console.log(
        "[Melhor Envio Webhook] Status já está atualizado, nenhuma mudança necessária",
      );
    }

    // Return success to Melhor Envio
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      orderId: order.id,
      status: newStatus || order.status,
    });
  } catch (error) {
    console.error("[Melhor Envio Webhook] Erro:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Melhor Envio Webhook] Error details:", errorMessage);

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}

// Melhor Envio might send GET to verify webhook
export async function GET() {
  console.log(
    "[Melhor Envio Webhook] GET request received (webhook verification)",
  );
  return NextResponse.json({
    status: "Webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}
