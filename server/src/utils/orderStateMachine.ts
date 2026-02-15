export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "confirmed",
  "picking",
  "shipping",
  "delivered",
  "active_rental",
  "returned",
  "overdue",
  "inspecting",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["picking", "cancelled"],
  picking: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: ["active_rental"],
  active_rental: ["returned", "overdue"],
  overdue: ["returned"],
  returned: ["inspecting"],
  inspecting: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid order transition: ${from} -> ${to}`);
  }
}

export function getValidTransitions(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from] || [];
}

// Map old statuses to new ones for backward compatibility
export function normalizeStatus(status: string): OrderStatus {
  const mapping: Record<string, OrderStatus> = {
    pending: "pending_payment",
    renting: "active_rental",
  };
  return (mapping[status] || status) as OrderStatus;
}
