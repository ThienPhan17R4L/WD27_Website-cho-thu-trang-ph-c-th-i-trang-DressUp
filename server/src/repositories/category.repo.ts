import { CategoryModel } from "../models/Category";

export class CategoryRepository {
  async existsActiveById(categoryId: string) {
    return CategoryModel.exists({ _id: categoryId, isActive: true });
  }
}
