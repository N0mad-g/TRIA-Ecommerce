"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getAdminOrders } from "@/actions/get-admin-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCentsToBRL } from "@/lib/helpers/money";

import { OrderStatusBadge } from "./components/order-status-badge";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

type Order = {
  id: string;
  shortId?: string | null;
  recipientName: string;
  email: string;
  status: OrderStatus;
  totalPriceInCents: number;
  createdAt: string | Date;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all",
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await getAdminOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.shortId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    canceled: orders.filter((o) => o.status === "canceled").length,
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciar todos os pedidos do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Buscar por ID, cliente ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Tabs */}
          <Tabs
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as OrderStatus | "all")
            }
          >
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">
                Todos
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="paid">
                Pagos
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.paid}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processando
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.processing}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Enviados
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.shipped}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Entregues
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.delivered}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="canceled">
                Cancelados
                <Badge variant="secondary" className="ml-2">
                  {statusCounts.canceled}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-4">
              {/* Table */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground text-lg font-semibold">
                    Nenhum pedido encontrado
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Tente ajustar seus filtros
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="font-mono font-semibold">
                              #{order.shortId || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.recipientName}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {order.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCentsToBRL(order.totalPriceInCents)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(new Date(order.createdAt))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                Ver detalhes
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
