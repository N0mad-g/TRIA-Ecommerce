import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/actions/get-categories";

export const getUseCategoriesQueryKey = () => ["categories"] as const;

export const useCategories = () => {
  return useQuery({
    queryKey: [getUseCategoriesQueryKey()],
    queryFn: () => getCategories(),
  });
};
