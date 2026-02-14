export type OrderEmailItem = {
  name: string;
  imageUrl: string;
  quantity: number;
  priceInCents: number;
};

export type OrderEmailData = {
  orderId: string;
  shortId: string;
  customerName: string;
  email: string;
  createdAt: Date;
  items: OrderEmailItem[];
  totalPriceInCents: number;
  shippingCostInCents: number;
  addressLine: string;
  cityStateZip: string;
};
