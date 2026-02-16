import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCartShipping } from "@/actions/update-cart-shipping";
import { UpdateCartShippingSchema } from "@/actions/update-cart-shipping/schema";

import { getUseCartQueryKey } from "../queries/use-cart";

export const getUpdateCartShippingMutationKey = () => ["update-cart-shipping"];

export const useUpdateCartShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getUpdateCartShippingMutationKey(),
    mutationFn: (data: UpdateCartShippingSchema) => updateCartShipping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
