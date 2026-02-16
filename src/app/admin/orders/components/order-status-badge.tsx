import { Badge } from "@/components/ui/badge";
import type { orderStatus } from "@/db/schema";
import { z } from "zod";

const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
]);
type OrderStatus = z.infer<typeof orderStatusSchema>;

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const statusConfig: Record<OrderStatus, { label: string; variant: any }> = {
  pending: { label: "Aguardando Pagamento", variant: "outline" },
  paid: { label: "Pago", variant: "secondary" },
  processing: { label: "Processando", variant: "default" },
  shipped: { label: "Enviado", variant: "default" },
  delivered: { label: "Entregue", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" };

  const colorClasses: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    paid: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    processing: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    shipped: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
    delivered: "bg-green-100 text-green-800 hover:bg-green-100",
    canceled: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge className={colorClasses[status]} variant="outline">
      {config.label}
    </Badge>
  );
}
