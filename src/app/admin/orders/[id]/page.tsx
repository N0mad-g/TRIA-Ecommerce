import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import OrderDetailClient from "../OrderDetailClient";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
