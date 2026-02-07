"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { addProductToCart } from "@/actions/add-to-cart-product";
import { Button } from "@/components/ui/button";

import AddToCartButton from "./add-to-cart-button";

interface ProductActionsProps {
  productId: string;
}

const ProductActions = ({ productId }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: addAndGo, isPending: isBuyingNow } = useMutation({
    mutationKey: ["buyNow", productId, quantity],
    mutationFn: () =>
      addProductToCart({
        productId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/cart/identification");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <>
      <div className="px-5">
        <div className="space-y-4">
          <h3 className="font-medium">Quantidade</h3>
          <div className="flex w-[100px] items-center justify-between rounded-lg border">
            <Button size="icon" variant="ghost" onClick={handleDecrement}>
              <MinusIcon />
            </Button>
            <p>{quantity}</p>
            <Button size="icon" variant="ghost" onClick={handleIncrement}>
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 px-5">
        <AddToCartButton productId={productId} quantity={quantity} />
        <Button
          className="rounded-full"
          size="lg"
          disabled={isBuyingNow}
          onClick={() => addAndGo()}
        >
          {isBuyingNow && <Loader2 className="animate-spin" />}
          Comprar agora
        </Button>
      </div>
    </>
  );
};

export default ProductActions;
