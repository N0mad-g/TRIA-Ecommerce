import Image from "next/image";
import Link from "next/link";

import { formatCentsToBRL } from "@/lib/helpers/money";

interface ProductItemProps {
  product: {
    name: string;
    description: string;
    imageUrl: string;
    priceInCents: number;
    slug: string;
  };
}

const ProductItem = ({ product }: ProductItemProps) => {
  return (
    <Link href={`/product/${product.slug}`} className="flex flex-col gap-4">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={200}
        height={200}
        className="rounded-3xl"
      />
      <div className="flex max-w-50 flex-col gap-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs font-medium">
          {product.description}
        </p>
        <p className="truncate text-sm font-semibold">
          {formatCentsToBRL(product.priceInCents)}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
