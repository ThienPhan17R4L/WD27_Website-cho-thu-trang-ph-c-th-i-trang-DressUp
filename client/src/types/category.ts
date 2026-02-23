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

// Server returns array of root categories, each with optional children[]
export type CategoryWithChildren = Category & { children?: CategoryWithChildren[] };
export type CategoryTreeResponse = CategoryWithChildren[];

export type CategoryListResponse = {
  items: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};