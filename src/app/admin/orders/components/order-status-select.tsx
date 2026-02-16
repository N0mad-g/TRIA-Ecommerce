"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/update-order-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChanged?: () => void;
};

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "canceled"],
  paid: ["processing", "canceled"],
  processing: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Aguardando Pagamento",
  paid: "Pago",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChanged,
}: OrderStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableStatuses = validTransitions[currentStatus];
  const canChangeStatus = availableStatuses.length > 0;

  const handleStatusSelect = (status: OrderStatus) => {
    setSelectedStatus(status);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setIsLoading(true);
    try {
      const res = await updateOrderStatus({
        orderId,
        status: selectedStatus,
      });

      toast.success(`Status atualizado para ${statusLabels[selectedStatus]}`);

      if (res?.shipment?.trackingCode) {
        toast.success("Etiqueta gerada com sucesso!");
      }
      setShowConfirmation(false);
      setSelectedStatus(null);
      onStatusChanged?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar status";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canChangeStatus) {
    return (
      <div className="text-muted-foreground text-sm">
        Nenhuma ação disponível para este status
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Select
          value=""
          onValueChange={(value) => handleStatusSelect(value as OrderStatus)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar novo status..." />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja alterar o status de{" "}
              <strong>{statusLabels[currentStatus]}</strong> para{" "}
              <strong>
                {selectedStatus ? statusLabels[selectedStatus] : ""}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Confirmar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
