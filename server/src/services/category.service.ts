import { CategoryModel } from "../models/Category";
import { HttpError } from "../middlewares/errorHandler";
import { slugify } from "../utils/slug";

type ListQuery = {
  page: number;
  limit: number;
  q?: string;
  parentId?: string | "null";
  isActive?: boolean;
  sort?: string;
};

async function ensureSlugUnique(slug: string, excludeId?: string) {
  const filter: any = { slug };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await CategoryModel.exists(filter);
  if (exists) throw new HttpError(409, "Slug already exists", { slug });
}

async function ensureParentValid(parentId: string | null | undefined, excludeId?: string) {
  if (parentId == null) return;

  if (excludeId && parentId === excludeId) {
    throw new HttpError(400, "parentId cannot be itself", { parentId });
  }

  const ok = await CategoryModel.exists({ _id: parentId });
  if (!ok) throw new HttpError(400, "Parent category not found", { parentId });
}

function normalizeSlug(input: string) {
  const s = slugify(input);
  if (!s) throw new HttpError(400, "Invalid slug");
  return s;
}

export const CategoryService = {
  async create(payload: any) {
    const slug = normalizeSlug(payload.slug ?? payload.name);
    await ensureSlugUnique(slug);
    await ensureParentValid(payload.parentId);

    const doc = await CategoryModel.create({
      ...payload,
      slug,
    });
    return doc;
  },

  async getById(id: string) {
    const doc = await CategoryModel.findById(id).lean();
    if (!doc) throw new HttpError(404, "Category not found");
    return doc;
  },

  async getBySlug(slug: string) {
    const doc = await CategoryModel.findOne({ slug: slug.toLowerCase() }).lean();
    if (!doc) throw new HttpError(404, "Category not found");
    return doc;
  },

  async list(query: ListQuery) {
    const { page, limit, q, parentId, isActive, sort } = query;

    const filter: Record<string, any> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;

    if (parentId === "null") filter.parentId = null;
    else if (parentId) filter.parentId = parentId;

    if (q && q.trim()) {
      // simple search by name
      filter.name = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    const skip = (page - 1) * limit;
    const sortExpr = sort ?? "sortOrder";

    const [items, total] = await Promise.all([
      CategoryModel.find(filter).sort(sortExpr).skip(skip).limit(limit).lean(),
      CategoryModel.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async tree(isActive?: boolean) {
    const filter: Record<string, any> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;

    const categories = await CategoryModel.find(filter)
      .sort({ parentId: 1, sortOrder: 1, name: 1 })
      .lean();

    // build tree
    const byId = new Map<string, any>();
    categories.forEach((c: any) => byId.set(String(c._id), { ...c, children: [] }));

    const roots: any[] = [];
    categories.forEach((c: any) => {
      const node = byId.get(String(c._id));
      const pid = c.parentId ? String(c.parentId) : null;
      if (pid && byId.has(pid)) byId.get(pid).children.push(node);
      else roots.push(node);
    });

    return roots;
  },

  async update(id: string, patch: any) {
    if (patch.parentId !== undefined) {
      await ensureParentValid(patch.parentId, id);
    }

    if (patch.slug || patch.name) {
      const slug = normalizeSlug(patch.slug ?? patch.name);
      await ensureSlugUnique(slug, id);
      patch.slug = slug;
    }

    const doc = await CategoryModel.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!doc) throw new HttpError(404, "Category not found");
    return doc;
  },

  async remove(id: string) {
    // Option A: hard delete
    const doc = await CategoryModel.findByIdAndDelete(id).lean();
    if (!doc) throw new HttpError(404, "Category not found");
    return doc;

    // Option B: soft delete
    // const doc = await CategoryModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
    // if (!doc) throw new HttpError(404, "Category not found");
    // return doc;
  },
};
