import { getAllOrders } from "@/lib/checkout/order-store";

// "Verified purchase" is granted once we can confirm the order was actually
// paid for (or is cash-on-pickup/delivery, which settles in person rather
// than online) and hasn't been cancelled — it doesn't require the order to
// have reached DELIVERED yet, matching how most marketplaces badge reviews.
export function hasVerifiedPurchase(email: string, productSlug: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return getAllOrders().some(
    (order) =>
      order.customerEmail.toLowerCase() === normalized &&
      order.status !== "CANCELLED" &&
      (order.paymentStatus === "SUCCESSFUL" || order.paymentMethod === "CASH") &&
      order.items.some((item) => item.productSlug === productSlug),
  );
}
