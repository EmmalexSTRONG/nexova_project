import type { PlacedOrder } from "@/lib/checkout/types";
import { PAYMENT_METHOD_LABEL } from "@/lib/checkout/labels";
import { Price } from "@/components/shared/price";

export function OrderDocument({ order, variant }: { order: PlacedOrder; variant: "invoice" | "receipt" }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border bg-card p-8 print:rounded-none print:border-none print:p-0">
      <div className="flex items-start justify-between border-b pb-6">
        <div>
          <p className="font-display text-xl font-bold">
            NE<span className="text-primary">X</span>ORA
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Multi-vendor marketplace
            <br />
            Accra, Ghana
          </p>
        </div>
        <div className="text-right">
          <h1 className="font-display text-lg font-semibold">{variant === "invoice" ? "Invoice" : "Receipt"}</h1>
          <p className="font-mono text-sm">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{new Date(order.placedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">{variant === "invoice" ? "Bill to" : "Customer"}</p>
          <p className="mt-1 text-muted-foreground">
            {order.customerName}
            <br />
            {order.customerEmail}
            <br />
            {order.customerPhone}
          </p>
        </div>
        <div>
          <p className="font-semibold">{order.fulfillment === "DELIVERY" ? "Ship to" : "Pickup from"}</p>
          {order.fulfillment === "DELIVERY" && order.shippingAddress ? (
            <p className="mt-1 text-muted-foreground">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.region}
            </p>
          ) : (
            <p className="mt-1 text-muted-foreground">
              {order.pickupPoints?.map((point) => point.shopName).join(", ")}
            </p>
          )}
        </div>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Price</th>
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {order.items.map((item) => (
            <tr key={item.productSlug}>
              <td className="py-2">
                {item.name}
                <br />
                <span className="text-xs text-muted-foreground">{item.shopName}</span>
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                <Price amount={item.unitPrice} currency={item.currency} size="sm" />
              </td>
              <td className="py-2 text-right">
                <Price amount={item.unitPrice * item.quantity} currency={item.currency} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <dl className="w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>
              <Price amount={order.subtotal} currency={order.currency} size="sm" />
            </dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd>
                -{order.currency} {order.discount.toFixed(2)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : <Price amount={order.shipping} currency={order.currency} size="sm" />}</dd>
          </div>
          <div className="flex justify-between border-t pt-1 text-base font-semibold">
            <dt>Total</dt>
            <dd>
              <Price amount={order.total} currency={order.currency} size="sm" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
        <p>Payment method: {PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
        {order.paymentReference && <p className="mt-0.5 font-mono">Reference: {order.paymentReference}</p>}
        {variant === "receipt" && order.paymentMethod === "CASH" && (
          <p className="mt-1 font-medium text-amber-600 dark:text-amber-400">Payment due on {order.fulfillment === "DELIVERY" ? "delivery" : "pickup"}</p>
        )}
        {variant === "receipt" && order.paymentMethod !== "CASH" && order.paymentStatus === "SUCCESSFUL" && (
          <p className="mt-1 font-medium text-success">Payment received</p>
        )}
        {variant === "receipt" && order.paymentMethod !== "CASH" && order.paymentStatus === "PENDING" && (
          <p className="mt-1 font-medium text-amber-600 dark:text-amber-400">Payment pending confirmation</p>
        )}
        {variant === "receipt" && order.paymentMethod !== "CASH" && order.paymentStatus === "FAILED" && (
          <p className="mt-1 font-medium text-destructive">Payment failed</p>
        )}
        {variant === "invoice" && <p className="mt-1">Thank you for shopping with Nexora.</p>}
      </div>
    </div>
  );
}
