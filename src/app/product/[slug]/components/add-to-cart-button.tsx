"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { addProductToCart } from "@/actions/add-to-cart-product";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
}

const AddToCartButton = ({ productId, quantity }: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productId, quantity],
    mutationFn: () =>
      addProductToCart({
        productId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Produto adicionado à sacola");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <Button
      className="rounded-full"
      size="lg"
      variant="outline"
      disabled={isPending}
      onClick={() => mutate()}
    >
      {isPending && <Loader2 className="animate-spin" />}
      Adicionar à sacola
    </Button>
  );
};

export default AddToCartButton;
