"use client";

import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orderTable } from "@/db/schema";
import { formatCentsToBRL } from "@/lib/helpers/money";

interface OrdersProps {
  orders: Array<{
    id: string;
    shortId: string;
    totalPriceInCents: number;
    status: (typeof orderTable.$inferSelect)["status"];
    createdAt: Date;
    items: Array<{
      id: string;
      imageUrl: string;
      productName: string;
      productVolume: string; // ✅ Volume em vez de variante
      priceInCents: number;
      quantity: number;
    }>;
  }>;
}

const Orders = ({ orders }: OrdersProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "pending":
        return <Badge variant="outline">Aguardando pagamento</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Em processamento</Badge>;
      case "shipped":
        return <Badge className="bg-amber-500">Enviado</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-600">Entregue</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-0">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="px-6 py-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-sm font-semibold">
                        Pedido #{order.shortId}
                      </p>
                      {getStatusBadge(order.status)}
                      <p className="text-muted-foreground text-sm">
                        Pedido feito em{" "}
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}{" "}
                        às{" "}
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {formatCentsToBRL(order.totalPriceInCents)}
                    </p>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Lista de produtos */}
                    {order.items.map((product) => (
                      <div
                        className="flex items-center justify-between"
                        key={product.id}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                            <Image
                              src={product.imageUrl.trim()}
                              alt={product.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold">
                              {product.productName}
                            </p>
                            <p className="text-muted-foreground text-xs font-medium">
                              {product.productVolume} • Qtd: {product.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">
                          {formatCentsToBRL(
                            product.priceInCents * product.quantity,
                          )}
                        </p>
                      </div>
                    ))}

                    <Separator />

                    {/* Resumo de valores */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <p className="text-sm">Subtotal</p>
                        <p className="text-muted-foreground text-sm font-medium">
                          {formatCentsToBRL(order.totalPriceInCents)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm">Frete</p>
                        <p className="text-muted-foreground text-sm font-medium">
                          GRÁTIS
                        </p>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <p className="text-sm font-semibold">Total</p>
                        <p className="text-sm font-bold">
                          {formatCentsToBRL(order.totalPriceInCents)}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;
