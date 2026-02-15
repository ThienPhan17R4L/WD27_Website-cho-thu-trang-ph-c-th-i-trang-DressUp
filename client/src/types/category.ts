export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryTreeResponse = {
  roots: Category[];
  children: Record<string, Category[]>;
};

export type CategoryListResponse = {
  items: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};