import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type OrderCreatedEmailProps = {
  order: OrderEmailData;
};

export const OrderCreatedEmail = ({ order }: OrderCreatedEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pedido recebido com sucesso"
      title="Pedido recebido"
      message="Recebemos seu pedido e vamos manter voce informado sobre cada etapa."
      order={order}
    />
  );
};
