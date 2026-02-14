import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type OrderProcessingEmailProps = {
  order: OrderEmailData;
};

export const OrderProcessingEmail = ({ order }: OrderProcessingEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pedido em processamento"
      title="Pedido em processamento"
      message="Seu pedido esta sendo preparado para envio."
      order={order}
    />
  );
};
