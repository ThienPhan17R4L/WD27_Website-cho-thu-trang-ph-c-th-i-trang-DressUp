import { Section } from "../common/Section";

type Item = {
  name: string;
  quote: string;
};

export function Testimonials() {
  const items: Item[] = [
    {
      name: "Khách hàng A",
      quote: "Váy đúng như hình, nhận đồ nhanh và sạch sẽ. Sẽ thuê lại!",
    },
    {
      name: "Khách hàng B",
      quote: "Tư vấn size rất chuẩn, set phụ kiện đi kèm hợp outfit.",
    },
    {
      name: "Khách hàng C",
      quote: "Quy trình đặt lịch dễ, giá hợp lý so với mua mới.",
    },
  ];

  return (
    <Section title="What our clients say" subtitle="Phản hồi từ khách đã thuê" align="center">
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.name}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm leading-relaxed text-slate-700">“{it.quote}”</p>
            <p className="mt-4 text-sm font-semibold text-slate-900">{it.name}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
