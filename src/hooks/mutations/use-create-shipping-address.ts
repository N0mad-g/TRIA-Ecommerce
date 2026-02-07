import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createShippingAddress } from "@/actions/create-shipping-address";
import { getUserAddressesQueryKey } from "@/hooks/queries/use-user-addresses";

export const getCreateAddressMutationKey = () => ["create-address"];

export const useCreateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getCreateAddressMutationKey(),
    mutationFn: createShippingAddress,
    onSuccess: () => {
      toast.success("Endereço criado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: getUserAddressesQueryKey(),
      });
    },
  });
};
