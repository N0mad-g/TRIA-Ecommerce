import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type PaymentPendingEmailProps = {
  order: OrderEmailData;
};

export const PaymentPendingEmail = ({ order }: PaymentPendingEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pagamento pendente"
      title="Pagamento pendente"
      message="Seu pagamento esta pendente. Assim que for confirmado, enviaremos uma nova atualizacao."
      order={order}
    />
  );
};
