import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategoryTree } from "@/hooks/useCategories";
import { Container } from "@/components/common/Container";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCategoryTree();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const roots = data?.roots || [];
  const children = data?.children || {};

  const q = search.toLowerCase();
  const filtered = roots.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      (children[r._id] || []).some((c) => c.name.toLowerCase().includes(q))
  );

  function handleCategoryClick(categoryId: string) {
    navigate(`/products?categoryId=${categoryId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <Container>
          <div className="py-12 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Danh mục trang phục</h1>
            <p className="mt-2 text-slate-500 max-w-md mx-auto">
              Khám phá đa dạng trang phục cho mọi dịp đặc biệt — từ lễ cưới đến sự kiện dạ hội
            </p>
            <div className="mt-6 flex justify-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm danh mục..."
                className="w-72 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              Không tìm thấy danh mục nào
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {filtered
                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                .map((root) => {
                  const subs = (children[root._id] || []).filter(
                    (c) => !q || c.name.toLowerCase().includes(q)
                  );
                  const isExpanded = expandedId === root._id;

                  return (
                    <div key={root._id} className="flex flex-col">
                      {/* Root card */}
                      <button
                        onClick={() => handleCategoryClick(root._id)}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow text-left"
                      >
                        {/* Image */}
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          {root.image ? (
                            <img
                              src={root.image}
                              alt={root.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
                              <svg className="h-12 w-12 text-rose-200" viewBox="0 0 24 24" fill="none">
                                <path d="M20.59 13.41 11 3.83a2 2 0 0 0-2.83 0L3.41 9.59a2 2 0 0 0 0 2.83l9.59 9.59a2 2 0 0 0 2.83 0l4.76-4.76a2 2 0 0 0 0-2.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="px-4 py-3">
                          <h3 className="font-semibold text-slate-900 text-sm group-hover:text-rose-600 transition-colors">
                            {root.name}
                          </h3>
                          {root.description && (
                            <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                              {root.description}
                            </p>
                          )}
                          {subs.length > 0 && (
                            <p className="mt-1 text-xs text-rose-400">{subs.length} danh mục con</p>
                          )}
                        </div>
                      </button>

                      {/* Sub-categories expand toggle */}
                      {subs.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : root._id)}
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-1"
                          >
                            <svg
                              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {isExpanded ? "Ẩn danh mục con" : "Xem danh mục con"}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1 pl-2">
                              {subs
                                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                                .map((sub) => (
                                  <button
                                    key={sub._id}
                                    onClick={() => handleCategoryClick(sub._id)}
                                    className="flex items-center gap-2 w-full text-left rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                  >
                                    <svg className="h-3.5 w-3.5 text-rose-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {sub.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
