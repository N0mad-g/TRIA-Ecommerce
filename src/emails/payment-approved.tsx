import { OrderEmailLayout } from "@/emails/components/order-email-layout";
import type { OrderEmailData } from "@/emails/types";

type PaymentApprovedEmailProps = {
  order: OrderEmailData;
};

export const PaymentApprovedEmail = ({ order }: PaymentApprovedEmailProps) => {
  return (
    <OrderEmailLayout
      preview="Pagamento aprovado"
      title="Pagamento aprovado"
      message="Seu pagamento foi aprovado. O recibo segue anexado."
      order={order}
    />
  );
};
