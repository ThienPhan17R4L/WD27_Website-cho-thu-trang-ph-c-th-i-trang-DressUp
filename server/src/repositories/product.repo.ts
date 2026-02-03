import { Types } from "mongoose";
import { ProductModel } from "../models/Product";

export type ProductStatus = "active" | "archived";

export type ListQuery = {
  page: number;
  limit: number;
  sort?: string;
  q?: string;
  categoryId?: string;
  status?: ProductStatus;
  tag?: string;
  brand?: string;
  priceMin?: number; // VND
  priceMax?: number;
};

export class ProductRepository {
  async create(payload: any) {
    return ProductModel.create(payload);
  }

  async findById(id: string) {
    return ProductModel.findById(id).lean();
  }

  async findBySlug(slug: string) {
    return ProductModel.findOne({ slug: slug.toLowerCase() }).lean();
  }

  async existsBySlug(slug: string, excludeId?: string) {
    const filter: Record<string, any> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    return ProductModel.exists(filter);
  }

  async listAndCount(query: ListQuery) {
    const {
      page,
      limit,
      sort,
      q,
      categoryId,
      status,
      tag,
      brand,
      priceMin,
      priceMax,
    } = query;

    const match: Record<string, any> = {};

    if (categoryId) match.categoryId = new Types.ObjectId(categoryId);
    if (status) match.status = status;
    if (tag) match.tags = tag;
    if (brand) match.brand = new RegExp(`^${escapeRegExp(brand)}$`, "i");

    const pipeline: any[] = [{ $match: match }];

    const hasQ = Boolean(q && q.trim());
    if (hasQ) {
      pipeline.push({ $match: { $text: { $search: q!.trim() } } });
      pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
    }

    // ✅ compute minPrice from rentalTiers.price
    pipeline.push({
      $addFields: {
        minPrice: {
          $cond: [
            { $gt: [{ $size: "$rentalTiers" }, 0] },
            { $min: "$rentalTiers.price" },
            null,
          ],
        },
      },
    });

    // ✅ filter by price range (VND)
    if (priceMin != null || priceMax != null) {
      const range: any = {};
      if (priceMin != null) range.$gte = priceMin;
      if (priceMax != null) range.$lte = priceMax;

      pipeline.push({ $match: { minPrice: range } });
    }

    // ✅ sort
    const sortStage: any = {};
    const parsed = parseSort(sort);

    if (parsed?.field === "price") {
      sortStage.minPrice = parsed.dir; // sort by computed
      sortStage.createdAt = -1;
    } else if (parsed) {
      sortStage[parsed.field] = parsed.dir;
    } else if (hasQ) {
      sortStage.score = { $meta: "textScore" };
      sortStage.createdAt = -1;
    } else {
      sortStage.createdAt = -1;
    }

    const skip = (page - 1) * limit;
    const limitNum = limit * 1;

    pipeline.push({
      $facet: {
        items: [{ $sort: sortStage }, { $skip: skip }, { $limit: limitNum }],
        meta: [{ $count: "total" }],
      },
    });
    const res = await ProductModel.aggregate(pipeline);
    const items = res?.[0]?.items ?? [];
    const total = res?.[0]?.meta?.[0]?.total ?? 0;

    return { items, total };
  }

  async updateById(id: string, patch: any) {
    return ProductModel.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id: string) {
    return ProductModel.findByIdAndDelete(id).lean();
  }
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseSort(sort?: string) {
  if (!sort) return null;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  if (!field) return null;
  return { field, dir: desc ? -1 : 1 };
}
