"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ShippingOption } from "@/actions/calculate-shipping/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCentsToBRL } from "@/helpers/money";
import { useUpdateCartShipping } from "@/hooks/mutations/use-update-cart-shipping";

type ShippingOptionsProps = {
  options: ShippingOption[];
  selectedServiceId: string | null;
  onSelectedServiceIdChange: (serviceId: string) => void;
  onShippingSaved: (data: {
    method: string;
    price: number;
    serviceId: string;
  }) => void;
  onShippingSavingChange: (isSaving: boolean) => void;
};

const ShippingOptions = ({
  options,
  selectedServiceId,
  onSelectedServiceIdChange,
  onShippingSaved,
  onShippingSavingChange,
}: ShippingOptionsProps) => {
  const updateCartShippingMutation = useUpdateCartShipping();

  const handleSelectOption = async (serviceId: string) => {
    const selectedOption = options.find((option) => option.id === serviceId);

    if (!selectedOption) {
      return;
    }

    onSelectedServiceIdChange(serviceId);
    onShippingSavingChange(true);

    try {
      await updateCartShippingMutation.mutateAsync({
        shippingMethod: selectedOption.name,
        shippingInCents: selectedOption.price,
        shippingServiceId: selectedOption.id,
      });
      onShippingSaved({
        method: selectedOption.name,
        price: selectedOption.price,
        serviceId: selectedOption.id,
      });
      console.log("✅ Shipping selected and saved:", {
        method: selectedOption.name,
        price: selectedOption.price,
      });
      toast.success("Frete selecionado!");
    } catch (error) {
      console.error("[Shipping Options] Erro ao selecionar frete:", error);
      toast.error("Não foi possível selecionar o frete.");
    } finally {
      onShippingSavingChange(false);
    }
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opções de frete</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedServiceId ?? undefined}
          onValueChange={handleSelectOption}
          disabled={updateCartShippingMutation.isPending}
          className="space-y-3"
        >
          {options.map((option) => (
            <Card key={option.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <RadioGroupItem
                      value={option.id}
                      id={`shipping-${option.id}`}
                    />
                    <Label
                      htmlFor={`shipping-${option.id}`}
                      className="cursor-pointer"
                    >
                      <p className="text-sm font-medium">{option.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Entrega em {option.delivery_time ?? "-"} dia(s)
                      </p>
                    </Label>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCentsToBRL(option.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
        {updateCartShippingMutation.isPending && (
          <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            Salvando frete...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingOptions;
