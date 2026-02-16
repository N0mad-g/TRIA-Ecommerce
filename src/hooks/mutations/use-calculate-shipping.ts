import { useMutation } from "@tanstack/react-query";

import { calculateShipping } from "@/actions/calculate-shipping";
import { CalculateShippingSchema } from "@/actions/calculate-shipping/schema";

export const getCalculateShippingMutationKey = () => ["calculate-shipping"];

export const useCalculateShipping = () => {
  return useMutation({
    mutationKey: getCalculateShippingMutationKey(),
    mutationFn: (data: CalculateShippingSchema) => calculateShipping(data),
  });
};
