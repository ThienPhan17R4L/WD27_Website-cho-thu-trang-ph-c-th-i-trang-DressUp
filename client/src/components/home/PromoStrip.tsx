import { Container } from "../common/Container";
import { Button } from "../common/Button";

export function PromoStrip() {
  return (
    <div className="border-y border-slate-200 bg-slate-50">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Thuê theo set — giảm đến 15%
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Chọn váy + phụ kiện + giày để nhận ưu đãi tự động.
            </p>
          </div>
          <Button>Build a set</Button>
        </div>
      </Container>
    </div>
  );
}
