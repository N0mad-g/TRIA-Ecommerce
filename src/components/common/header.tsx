"use client";

import { LogInIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCategories } from "@/hooks/queries/use-categories";
import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";

export const Header = () => {
  const { data: session } = authClient.useSession();
  const { data: categories, isPending: categoriesIsLoading } = useCategories();
  return (
    <header className="mb-6 flex items-center justify-between bg-black px-5 py-3">
      <Link href="/">
        <Image src="/Logo.png" alt="SM Grow" width={150} height={26.14} />
      </Link>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {session?.user ? (
                <>
                  <div className="flex justify-between space-y-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={session?.user?.image as string | undefined}
                        />
                        <AvatarFallback>
                          {session?.user?.name?.split(" ")?.[0]?.[0]}
                          {session?.user?.name?.split(" ")?.[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{session?.user?.name}</h3>
                        <span className="text-muted-foreground block text-xs">
                          {session?.user?.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => authClient.signOut()}
                    >
                      <LogOutIcon />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Olá. Faça seu login!</h2>
                    <Button size="icon" asChild variant="outline">
                      <Link href="/authentication">
                        <LogInIcon />
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      Faça login para começar a comprar
                    </p>
                  </div>
                </div>
              )}
              <Separator className="my-4" />
              <div>
                <h3 className="mb-2 font-semibold">Categorias</h3>
                {categoriesIsLoading ? (
                  <p className="text-muted-foreground text-sm">
                    Carregando categorias...
                  </p>
                ) : (
                  <ScrollArea className="max-h-64">
                    <div className="flex flex-col gap-2">
                      {categories?.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="text-sm transition hover:underline"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Cart />
      </div>
    </header>
  );
};
