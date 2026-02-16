"use client";

import {
  ArrowLeft,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Printer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cancelOrder } from "@/actions/admin/cancel-order";
import { deleteOrder } from "@/actions/admin/delete-order";
import { getAdminOrder } from "@/actions/get-admin-order";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentsToBRL } from "@/lib/helpers/money";

import { OrderStatusBadge } from "./components/order-status-badge";
import { OrderStatusSelect } from "./components/order-status-select";

type Order = {
  id: string;
  shortId?: string;
  createdAt: string | Date;
  totalPriceInCents: number;
  shippingInCents?: number | null;
  shippingMethod?: string | null;
  recipientName: string;
  email: string;
  phone?: string | null;
  cpfOrCnpj?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  trackingCode?: string | null;
  shippingLabelUrl?: string | null;
  melhorEnvioOrderId?: string | null;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "canceled";
  items?: Array<{
    id: string;
    quantity: number;
    priceInCents: number;
    product: {
      name: string;
      volume?: string | null;
    };
  }>;
};

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<
    Array<{ text: string; createdAt: string }>
  >([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const fetched = await getAdminOrder(orderId);
        if (!fetched) {
          router.push("/admin/orders");
          return;
        }
        setOrder(fetched as Order);
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
        router.push("/admin/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
    // load notes from localStorage
    try {
      const raw = localStorage.getItem(`order_notes_${orderId}`);
      if (raw) setSavedNotes(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [orderId, router]);

  const handleStatusChanged = async () => {
    setIsRefreshing(true);
    try {
      const updated = await getAdminOrder(orderId);
      if (updated) setOrder(updated as Order);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!order) return;
    const address = `${order.street}, ${order.number}${order.complement ? `, ${order.complement}` : ""} - ${order.neighborhood}, ${order.city} - ${order.state}, ${order.zipCode}`;
    await navigator.clipboard.writeText(address);
    alert("Endereço copiado para a área de transferência");
  };

  const handleCopyTracking = async () => {
    if (!order?.trackingCode) return;
    await navigator.clipboard.writeText(order.trackingCode);
    alert("Código de rastreamento copiado");
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await cancelOrder({ orderId: order.id });
      if (res?.ok) {
        const updated = await getAdminOrder(orderId);
        if (updated) setOrder(updated as Order);
        alert("Pedido cancelado com sucesso");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cancelar pedido");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      const res = await deleteOrder({ orderId: order.id });
      if (res?.ok) {
        alert("Pedido deletado");
        router.push("/admin/orders");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar pedido");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveNote = () => {
    if (!notes) return;
    const entry = { text: notes, createdAt: new Date().toISOString() };
    const updated = [entry, ...savedNotes];
    setSavedNotes(updated);
    setNotes("");
    try {
      localStorage.setItem(`order_notes_${orderId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCorreiosTrackingUrl = (trackingCode: string) => {
    return `https://rastreamento.correios.com.br/app/index.php?codigo=${trackingCode}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-muted-foreground text-sm">
            Admin
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <Link href="/admin/orders" className="text-muted-foreground text-sm">
            Pedidos
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm font-semibold">#{order.shortId}</span>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para pedidos
          </Link>
        </Button>
      </div>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">
                Pedido #{order.shortId}
              </CardTitle>
              <p className="text-muted-foreground mt-2 text-sm">
                ID: {order.id}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Criado: {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href={`/admin/orders/${order.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar pedido</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover o pedido permanentemente. Tem
                        certeza?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteOrder()}>
                        Deletar
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
          <Separator className="mt-4" />
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-sm">Data do Pedido</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-2xl font-bold">
                {formatCentsToBRL(order.totalPriceInCents)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Frete</p>
              <p className="font-semibold">
                {formatCentsToBRL(order.shippingInCents || 0)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Método de Envio</p>
              <p className="font-semibold">
                {order.shippingMethod || "Não definido"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      {/* Notes & Danger Zone */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notas Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <textarea
                className="w-full rounded border p-2"
                placeholder="Adicionar nota interna..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNote}>Salvar nota</Button>
              </div>

              <div className="mt-4 space-y-2">
                {savedNotes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sem notas</p>
                ) : (
                  savedNotes.map((n, idx) => (
                    <div key={idx} className="rounded border p-2">
                      <div className="text-muted-foreground text-xs">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                      <div className="mt-1">{n.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">Ações destrutivas</p>
              <div className="flex flex-col gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-yellow-600">
                      Cancelar Pedido
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar pedido</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja cancelar este pedido? Esta ação
                        atualizará o status para canceled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                      <AlertDialogCancel>Fechar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancelOrder()}>
                        {isCancelling
                          ? "Cancelando..."
                          : "Confirmar Cancelamento"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Deletar Pedido</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar pedido</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação NÃO pode ser desfeita. Para confirmar, digite
                        o ID curto do pedido abaixo e clique em Deletar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-2">
                      <p className="text-sm">
                        Para confirmar, digite:{" "}
                        <span className="font-mono">{order.shortId}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteOrder()}>
                        {isDeleting ? "Deletando..." : "Deletar Pedido"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Nome</p>
              <p className="font-semibold">{order.recipientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Email</p>
              <p className="font-semibold break-all">{order.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Telefone</p>
              <p className="font-semibold">{order.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">CPF/CNPJ</p>
              <p className="font-mono font-semibold">{order.cpfOrCnpj}</p>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-semibold">Endereço de Entrega</p>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>
                  {order.street}, {order.number}
                </p>
                {order.complement && <p>{order.complement}</p>}
                <p>
                  {order.neighborhood} - {order.city}, {order.state}
                </p>
                <p>{order.zipCode}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar endereço
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${order.email}`}>Enviar email</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Tracking Info */}
        <Card>
          <CardHeader>
            <CardTitle>Rastreamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.trackingCode ? (
              <>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Código de Rastreamento
                  </p>
                  <p className="font-mono text-lg font-bold">
                    {order.trackingCode}
                  </p>
                </div>

                {(order.shippingMethod === "PAC" ||
                  order.shippingMethod === "SEDEX") && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={getCorreiosTrackingUrl(order.trackingCode!)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Rastrear nos Correios
                    </a>
                  </Button>
                )}

                {order.shippingLabelUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={order.shippingLabelUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download da Etiqueta
                    </a>
                  </Button>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTracking}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar código
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem informações de rastreamento ainda
              </p>
            )}

            {order.melhorEnvioOrderId && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm">
                    ID Melhor Envio
                  </p>
                  <p className="font-mono text-xs">
                    {order.melhorEnvioOrderId}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2 text-sm">Status Atual</p>
              <OrderStatusBadge status={order.status} />
            </div>

            <Separator />

            {isRefreshing ? (
              <p className="text-muted-foreground text-sm">Atualizando...</p>
            ) : (
              <OrderStatusSelect
                orderId={order.id}
                currentStatus={order.status}
                onStatusChanged={handleStatusChanged}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Unitário</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {item.product.volume}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCentsToBRL(item.priceInCents)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCentsToBRL(item.priceInCents * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator className="mt-4" />

          <div className="mt-4 flex justify-end">
            <div className="space-y-2 text-right">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">
                  {formatCentsToBRL(
                    order.totalPriceInCents - (order.shippingInCents || 0),
                  )}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Frete:</span>
                <span className="font-semibold">
                  {formatCentsToBRL(order.shippingInCents || 0)}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span>{formatCentsToBRL(order.totalPriceInCents)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
