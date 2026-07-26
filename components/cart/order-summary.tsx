import Link from "next/link";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  shippingKnown,
  total,
  itemCount,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  shippingKnown: boolean;
  total: number;
  itemCount: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-base font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>
            <Price amount={subtotal} size="sm" />
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-success">
            <dt>Discount</dt>
            <dd>-GHS {discount.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>
            {shippingKnown ? (
              shipping === 0 ? (
                "Free"
              ) : (
                <Price amount={shipping} size="sm" />
              )
            ) : (
              <span className="text-muted-foreground">Estimate below</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t pt-4 text-base font-semibold">
        <span>Total</span>
        <Price amount={total} size="lg" />
      </div>

      {itemCount > 0 ? (
        <Button asChild size="lg" className="mt-4 w-full">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
      ) : (
        <Button size="lg" className="mt-4 w-full" disabled>
          Proceed to checkout
        </Button>
      )}
    </div>
  );
}
