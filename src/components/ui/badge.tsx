import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[9px] font-semibold tracking-[0.15em] uppercase",
  {
    variants: {
      variant: {
        alabaster: "bg-alabaster text-onyx",
        outline: "border border-slate/40 text-slate-light",
      },
    },
    defaultVariants: {
      variant: "alabaster",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
