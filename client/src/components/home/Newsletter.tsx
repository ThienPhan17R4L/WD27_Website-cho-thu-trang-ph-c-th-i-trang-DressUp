import { Section } from "../common/Section";
import { Button } from "../common/Button";

export function Newsletter() {
  return (
    <Section
      title="Get updates"
      subtitle="Nhận thông báo bộ sưu tập mới và ưu đãi"
      align="center"
      className="bg-white"
    >
      <form
        className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          required
          placeholder="Email của bạn"
          className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-rose-600"
        />
        <Button type="submit" className="h-10">
          Subscribe
        </Button>
      </form>
      <p className="mt-3 text-xs text-slate-500">
        Bằng cách đăng ký, bạn đồng ý nhận email marketing (có thể hủy bất kỳ lúc nào).
      </p>
    </Section>
  );
}
