import { HttpError } from "../middlewares/errorHanler";
import { slugify } from "../utils/slug";
import { CategoryRepository } from "../repositories/category.repo";
import { ProductRepository, ListQuery } from "../repositories/product.repo";

const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();

async function ensureCategoryExists(categoryId: string) {
  const ok = await categoryRepo.existsActiveById(categoryId);
  if (!ok) throw new HttpError(400, "Category not found or inactive", { categoryId });
}

async function ensureSlugUnique(slug: string, excludeId?: string) {
  const exists = await productRepo.existsBySlug(slug, excludeId);
  if (exists) throw new HttpError(409, "Slug already exists", { slug });
}

function normalizeSlug(input: string) {
  const s = slugify(input);
  if (!s) throw new HttpError(400, "Invalid slug");
  return s;
}

export const ProductService = {
  async create(payload: any) {
    await ensureCategoryExists(payload.categoryId);

    const slug = normalizeSlug(payload.slug ?? payload.name);
    await ensureSlugUnique(slug);

    return productRepo.create({ ...payload, slug });
  },

  async getById(id: string) {
    const doc = await productRepo.findById(id);
    if (!doc) throw new HttpError(404, "Product not found");
    return doc;
  },

  async getBySlug(slug: string) {
    const doc = await productRepo.findBySlug(slug);
    if (!doc) throw new HttpError(404, "Product not found");
    return doc;
  },

  async list(query: ListQuery) {
    const { items, total } = await productRepo.listAndCount(query);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  async update(id: string, patch: any) {
    if (patch.categoryId) await ensureCategoryExists(patch.categoryId);

    if (patch.slug || patch.name) {
      const desiredSlug = normalizeSlug(patch.slug ?? patch.name);
      await ensureSlugUnique(desiredSlug, id);
      patch.slug = desiredSlug;
    }

    const doc = await productRepo.updateById(id, patch);
    if (!doc) throw new HttpError(404, "Product not found");
    return doc;
  },

  async remove(id: string) {
    const doc = await productRepo.deleteById(id);
    if (!doc) throw new HttpError(404, "Product not found");
    return doc;
  },
};
