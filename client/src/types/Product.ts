export type Product = {
  id: string;
  name: string;
  brand?: string;
  pricePerDay: number;
  imageUrl: string;
  tag?: string; // e.g. "New", "Top"
};
