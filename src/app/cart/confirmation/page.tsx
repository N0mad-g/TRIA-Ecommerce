import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import { formatAddress } from "../helpers/address";
import FinishOrderButton from "./components/finish-order-button";

const ConfirmationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect("/");
  }
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
    with: {
      shippingAddress: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });
  if (!cart || cart?.items.length === 0) {
    redirect("/");
  }

  console.log("📦 Cart shipping data:", {
    shippingMethod: cart.shippingMethod,
    shippingInCents: cart.shippingInCents,
  });

  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.product.priceInCents * item.quantity,
    0,
  );
  if (!cart.shippingAddress) {
    redirect("/cart/identification");
  }
  if (!cart.shippingMethod) {
    redirect("/cart/identification?shippingRequired=1");
  }
  const isPickup = cart.shippingServiceId === "pickup";
  if (!isPickup && cart.shippingInCents <= 0) {
    redirect("/cart/identification?shippingRequired=1");
  }
  return (
    <div>
      <Header />
      <div className="space-y-4 px-5">
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardContent>
                <p className="text-sm">{formatAddress(cart.shippingAddress)}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Frete selecionado: {cart.shippingMethod}
                </p>
              </CardContent>
            </Card>
            <FinishOrderButton />
          </CardContent>
        </Card>
        <CartSummary
          subtotalInCents={cartTotalInCents}
          shippingInCents={cart.shippingInCents}
          shippingMethod={cart.shippingMethod}
          totalInCents={cartTotalInCents + cart.shippingInCents}
          products={cart.items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            priceInCents: item.product.priceInCents,
            imageUrl: item.product.imageUrl,
          }))}
        />
      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;
