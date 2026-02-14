import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type OrderDeliveredEmailProps = {
  order: OrderEmailData;
};

export const OrderDeliveredEmail = ({ order }: OrderDeliveredEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pedido entregue"
      title="Pedido entregue"
      message="Seu pedido foi entregue. Esperamos que voce aprove."
      order={order}
    />
  );
};
