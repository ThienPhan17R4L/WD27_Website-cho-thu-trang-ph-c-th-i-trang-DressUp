export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryListResponse = {
  items: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};