"use server";

import { eq } from "drizzle-orm";
import React from "react";

import { db } from "@/db";
import { orderItemTable, orderTable, productTable } from "@/db/schema";
import { OrderCreatedEmail } from "@/emails/order-created";
import { OrderDeliveredEmail } from "@/emails/order-delivered";
import { OrderProcessingEmail } from "@/emails/order-processing";
import { OrderShippedEmail } from "@/emails/order-shipped";
import { PaymentApprovedEmail } from "@/emails/payment-approved";
import { PaymentPendingEmail } from "@/emails/payment-pending";
import type { OrderEmailData } from "@/emails/types";
import { sendEmail } from "@/lib/email";
import { generateReceiptPdf } from "@/lib/generate-receipt-pdf";

import { SendOrderEmailSchema, sendOrderEmailSchema } from "./schema";

type NotificationFlags = NonNullable<
  (typeof orderTable.$inferSelect)["emailNotifications"]
>;

type NotificationKey = keyof NotificationFlags;

type EmailType = SendOrderEmailSchema["type"];

type SendOrderEmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

type OrderItemWithProduct = typeof orderItemTable.$inferSelect & {
  product: typeof productTable.$inferSelect;
};

type OrderWithItems = typeof orderTable.$inferSelect & {
  items: OrderItemWithProduct[];
};

const notificationDefaults: NotificationFlags = {
  orderCreated: false,
  paymentPending: false,
  paymentApproved: false,
  processing: false,
  shipped: false,
  delivered: false,
};

const notificationKeyByType: Record<EmailType, NotificationKey> = {
  "order-created": "orderCreated",
  "payment-pending": "paymentPending",
  "payment-approved": "paymentApproved",
  "order-processing": "processing",
  "order-shipped": "shipped",
  "order-delivered": "delivered",
};

const subjectByType: Record<EmailType, string> = {
  "order-created": "Pedido recebido - Sm Grow",
  "payment-pending": "Pagamento pendente - Sm Grow",
  "payment-approved": "Pagamento aprovado - Sm Grow",
  "order-processing": "Pedido em processamento - Sm Grow",
  "order-shipped": "Pedido enviado - Sm Grow",
  "order-delivered": "Pedido entregue - Sm Grow",
};

const getOrderShortId = (order: typeof orderTable.$inferSelect): string => {
  if (order.shortId) {
    return order.shortId;
  }

  const normalizedOrderId = order.id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return normalizedOrderId.slice(0, 4);
};

const getEmailTemplate = (type: EmailType, order: OrderEmailData) => {
  switch (type) {
    case "order-created":
      return React.createElement(OrderCreatedEmail, { order });
    case "payment-pending":
      return React.createElement(PaymentPendingEmail, { order });
    case "payment-approved":
      return React.createElement(PaymentApprovedEmail, { order });
    case "order-processing":
      return React.createElement(OrderProcessingEmail, { order });
    case "order-shipped":
      return React.createElement(OrderShippedEmail, { order });
    case "order-delivered":
      return React.createElement(OrderDeliveredEmail, { order });
  }
};

const buildOrderEmailData = (order: OrderWithItems) => {
  const addressLine = `${order.street}, ${order.number}${
    order.complement ? ` - ${order.complement}` : ""
  } - ${order.neighborhood}`;
  const cityStateZip = `${order.city} - ${order.state}, ${order.zipCode}`;

  const items = order.items.map((item) => ({
    name: item.product.name,
    imageUrl: item.product.imageUrl,
    quantity: item.quantity,
    priceInCents: item.priceInCents,
  }));

  return {
    orderId: order.id,
    shortId: getOrderShortId(order),
    customerName: order.recipientName,
    email: order.email,
    createdAt: order.createdAt,
    items: items ?? [],
    totalPriceInCents: order.totalPriceInCents,
    shippingCostInCents: order.shippingInCents ?? 0,
    addressLine,
    cityStateZip,
    trackingCode: order.trackingCode ?? undefined,
    shippingLabelUrl: order.shippingLabelUrl ?? undefined,
    shippingMethod: order.shippingMethod ?? undefined,
  } satisfies OrderEmailData;
};

export const sendOrderEmail = async (
  data: SendOrderEmailSchema,
): Promise<SendOrderEmailResult> => {
  const parsed = sendOrderEmailSchema.safeParse(data);
  if (!parsed.success) {
    console.error("sendOrderEmail validation failed", parsed.error.flatten());
    return { ok: false, error: "Invalid payload" };
  }

  try {
    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, parsed.data.orderId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return { ok: false, error: "Order not found" };
    }

    const notificationKey = notificationKeyByType[parsed.data.type];
    const currentNotifications = {
      ...notificationDefaults,
      ...(order.emailNotifications ?? {}),
    };

    if (currentNotifications[notificationKey]) {
      return { ok: true, skipped: true };
    }

    const orderData = buildOrderEmailData(order);
    const attachments =
      parsed.data.type === "payment-approved"
        ? [
            {
              filename: `receipt-${order.id}.pdf`,
              content: Buffer.from(await generateReceiptPdf(orderData)),
            },
          ]
        : undefined;

    await sendEmail({
      to: order.email,
      subject: subjectByType[parsed.data.type],
      react: getEmailTemplate(parsed.data.type, orderData),
      attachments,
    });

    await db
      .update(orderTable)
      .set({
        emailNotifications: {
          ...currentNotifications,
          [notificationKey]: true,
        },
      })
      .where(eq(orderTable.id, order.id));

    return { ok: true };
  } catch (error) {
    console.error("sendOrderEmail failed", error);
    return { ok: false, error: "Failed to send email" };
  }
};
