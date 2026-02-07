import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProductToCart } from "@/actions/add-to-cart-product";

import { getUseCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductQuantityMutationKey = (productId: string) =>
  ["increase-cart-product-quantity", productId] as const;

export const useIncreaseCartProductQuantity = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getIncreaseCartProductQuantityMutationKey(productId),
    mutationFn: () => addProductToCart({ productId: productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
