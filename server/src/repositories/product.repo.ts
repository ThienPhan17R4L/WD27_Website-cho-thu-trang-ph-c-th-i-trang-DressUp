import { Types } from "mongoose";
import { ProductModel } from "../models/Product";

export type ProductStatus = "active" | "archived";

export type ListQuery = {
  page: number;
  limit: number;
  sort?: string;
  q?: string;
  categoryId?: string;
  categoryIds?: string | string[]; // single id hoặc mảng (từ query string axios)
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
    const result = await ProductModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $addFields: {
          minPrice: {
            $cond: [
              { $gt: [{ $size: "$rentalTiers" }, 0] },
              { $min: "$rentalTiers.price" },
              null,
            ],
          },
        },
      },
    ]);

    return result[0] || null;
  }

  async findBySlug(slug: string) {
    const result = await ProductModel.aggregate([
      { $match: { slug: slug.toLowerCase() } },
      {
        $addFields: {
          minPrice: {
            $cond: [
              { $gt: [{ $size: "$rentalTiers" }, 0] },
              { $min: "$rentalTiers.price" },
              null,
            ],
          },
        },
      },
    ]);

    return result[0] || null;
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
      categoryIds,
      status,
      tag,
      brand,
      priceMin,
      priceMax,
    } = query;

    const match: Record<string, any> = {};

    // categoryIds[] (ưu tiên nếu có) — đến từ axios array serialize
    const ids = categoryIds
      ? (Array.isArray(categoryIds) ? categoryIds : [categoryIds]).filter(Boolean)
      : [];
    if (ids.length > 0) {
      match.categoryId = { $in: ids.map((id) => new Types.ObjectId(id as string)) };
    } else if (categoryId) {
      match.categoryId = new Types.ObjectId(categoryId);
    }
    if (status) match.status = status;
    if (tag) match.tags = tag;
    if (brand) match.brand = new RegExp(`^${escapeRegExp(brand)}$`, "i");

    const hasQ = Boolean(q && q.trim());
    if (hasQ) {
      match.$text = { $search: q!.trim() };
    }

    // $text must be in the FIRST $match stage
    const pipeline: any[] = [{ $match: match }];

    if (hasQ) {
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

    // ✅ filter by price range (VND) — query params arrive as strings, must convert to number
    const pMin = priceMin != null ? Number(priceMin) : null;
    const pMax = priceMax != null ? Number(priceMax) : null;
    if ((pMin != null && !isNaN(pMin)) || (pMax != null && !isNaN(pMax))) {
      const range: any = {};
      if (pMin != null && !isNaN(pMin)) range.$gte = pMin;
      if (pMax != null && !isNaN(pMax)) range.$lte = pMax;

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
