"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/protocolos", label: "Protocolos" },
  { href: "/produtos", label: "Produtos" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate/20 bg-onyx/[0.82] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-[0.14em] text-white"
        >
          TRIA
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-label-section text-slate-light transition-colors hover:text-arctic"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant="alabaster" size="sm">
            <Link href="/conta">Conta</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-arctic md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate/20 px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-label-section text-slate-light"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/conta"
            onClick={() => setOpen(false)}
            className="py-2 text-label-section text-arctic"
          >
            Conta
          </Link>
        </nav>
      )}
    </header>
  );
}
