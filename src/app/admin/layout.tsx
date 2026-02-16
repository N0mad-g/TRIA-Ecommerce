"use client";

import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        redirect("/authentication");
      }
      setIsLoading(false);
    }
  }, [session, isPending]);

  if (isLoading || isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/");
        },
      },
    });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Admin Header */}
      <header className="bg-card border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/Logo.png" alt="SM Grow" width={120} height={20} />
            </Link>
            <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs font-semibold">
              ADMIN
            </span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/admin/orders"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Pedidos
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
