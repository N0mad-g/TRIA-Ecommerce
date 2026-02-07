"use client";

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
          <Button
            key={category.id}
            variant="ghost"
            className="rounded-full bg-black text-xs font-semibold text-white"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
