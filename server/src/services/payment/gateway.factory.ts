import type { PaymentGateway } from "./payment.gateway";
import { MockGateway } from "./mock.gateway";
import { env } from "../../config/env";

export function getPaymentGateway(method: string): PaymentGateway | null {
  switch (method) {
    case "mock":
      return new MockGateway();
    case "momo":
      // MoMo gateway wraps the existing momo.service.ts
      // For now, use mock if PAYMENT_MOCK_ENABLED
      if (env.PAYMENT_MOCK_ENABLED) return new MockGateway();
      return null; // Will be wired to MoMo service
    case "cod":
      return null; // COD doesn't need online payment
    default:
      if (env.PAYMENT_MOCK_ENABLED) return new MockGateway();
      return null;
  }
}
