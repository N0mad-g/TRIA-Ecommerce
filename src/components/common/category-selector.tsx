"use client";

import Link from "next/link";

import { categoryTable } from "@/db/schema";

import { Button } from "../ui/button";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  return (
    <div className="rounded-3xl bg-black p-6">
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <Button
              variant="ghost"
              className="w-full rounded-full bg-black text-xs font-semibold text-white transition-colors hover:bg-gray-800"
              asChild
            >
              <span>{category.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
