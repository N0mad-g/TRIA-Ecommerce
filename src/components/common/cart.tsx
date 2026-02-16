"use client";

import { ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/queries/use-cart";
import { formatCentsToBRL } from "@/lib/helpers/money";

import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { CartItem } from "./cart-item";

export const Cart = () => {
  const { data: cart, isPending: cartIsLoading } = useCart();

  const subtotalInCents =
    cart?.items?.reduce(
      (acc, item) => acc + item.product.priceInCents * item.quantity,
      0,
    ) ?? 0;

  const shippingInCents = cart?.shippingInCents ?? 0;
  const hasShippingMethod = Boolean(cart?.shippingMethod);
  const isShippingPending = shippingInCents === 0 && !hasShippingMethod;

  const getShippingLabel = () => {
    if (isShippingPending) {
      return "A calcular";
    }

    if (shippingInCents === 0 && hasShippingMethod) {
      return "GRÁTIS";
    }

    return formatCentsToBRL(shippingInCents);
  };

  const totalInCents =
    subtotalInCents + (shippingInCents > 0 ? shippingInCents : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white">
          <ShoppingBasketIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col px-5 pb-5">
          {cartIsLoading ? ( // ✅ Usando a variável
            <p>Carregando carrinho...</p>
          ) : cart?.items && cart.items.length > 0 ? (
            <>
              <div className="flex h-full max-h-full flex-col overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="flex h-full flex-col gap-8">
                    {cart.items.map((item) => (
                      <CartItem
                        key={item.id}
                        id={item.id}
                        productName={item.product.name}
                        productId={item.product.id}
                        productImageUrl={item.product.imageUrl}
                        productPriceInCents={item.product.priceInCents}
                        quantity={item.quantity}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-4">
                <Separator />

                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Subtotal</p>
                  <p>{formatCentsToBRL(subtotalInCents)}</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Entrega</p>
                  <p
                    className={isShippingPending ? "text-muted-foreground" : ""}
                  >
                    {getShippingLabel()}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Total</p>
                  <p>{formatCentsToBRL(totalInCents)}</p>
                </div>

                <Button className="mt-5 rounded-full" asChild>
                  <Link href="/cart/identification">Finalizar compra</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBasketIcon
                className="text-muted-foreground h-10 w-10"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">
                Você não possui nada no carrinho
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// SERVER ACTION
