import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type OrderShippedEmailProps = {
  order: OrderEmailData;
};

export const OrderShippedEmail = ({ order }: OrderShippedEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pedido enviado"
      title="Pedido enviado"
      message="Seu pedido foi enviado. Em breve ele chega ate voce."
      order={order}
    />
  );
};
