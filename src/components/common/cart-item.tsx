import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { useDecreaseCartProductQuantity } from "@/hooks/mutations/use-decrease-cart-product";
import { useIncreaseCartProductQuantity } from "@/hooks/mutations/use-increase-cart-product";
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";
import { formatCentsToBRL } from "@/lib/helpers/money";

import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  productName: string;
  productId: string;
  productImageUrl: string;
  productPriceInCents: number;
  quantity: number;
}

export const CartItem = ({
  id,
  productName,
  productId,
  productImageUrl,
  productPriceInCents,
  quantity,
}: CartItemProps) => {
  const removeProductFromCartMutation = useRemoveProductFromCart(id);

  const decreaseCartProductQuantityMutation =
    useDecreaseCartProductQuantity(id);

  const increaseCartProductQuantityMutation =
    useIncreaseCartProductQuantity(productId);

  const handleDeleteClick = () => {
    removeProductFromCartMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Produto removido do carrinho");
      },

      onError: () => {
        toast.error("Erro ao remover produto do carrinho");
      },
    });
  };

  const handleDecreaseQuantityClick = () => {
    decreaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto atualizada");
      },

      onError: () => {
        toast.error("Erro ao atualizar a quantidade do produto");
      },
    });
  };

  const handleIncreaseQuantityClick = () => {
    increaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto atualizada");
      },
      onError: () => {
        toast.error("Erro ao atualizar a quantidade do produto");
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={productImageUrl.trim()}
          alt={productName}
          width={78}
          height={78}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {productName}
          </p>
          <div className="flex w-[100px] items-center justify-between rounded-lg border p-1">
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleDecreaseQuantityClick}
            >
              <MinusIcon />
            </Button>
            <p className="text-xs font-medium">{quantity}</p>
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleIncreaseQuantityClick}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDeleteClick}>
          <TrashIcon />
        </Button>
        <p className="text-sm font-bold">
          {formatCentsToBRL(productPriceInCents)}
        </p>
      </div>
    </div>
  );
};
