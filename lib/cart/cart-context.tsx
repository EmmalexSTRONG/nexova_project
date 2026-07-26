"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { getProductBySlug } from "@/lib/data";
import { getStockStatus } from "@/lib/stock";
import type { GhanaRegion } from "@/lib/shipping";

const STORAGE_KEY = "nexora:cart:v1";

export interface CartLine {
  productSlug: string;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  savedForLater: CartLine[];
  couponCode: string | null;
  shippingRegion: GhanaRegion | null;
  isLoaded: boolean;
}

type PersistedCartState = Pick<CartState, "items" | "savedForLater" | "couponCode" | "shippingRegion">;

type CartAction =
  | { type: "HYDRATE"; state: PersistedCartState }
  | { type: "ADD_ITEM"; productSlug: string; quantity: number }
  | { type: "REMOVE_ITEM"; productSlug: string }
  | { type: "INCREASE_QUANTITY"; productSlug: string }
  | { type: "DECREASE_QUANTITY"; productSlug: string }
  | { type: "SAVE_FOR_LATER"; productSlug: string }
  | { type: "MOVE_TO_CART"; productSlug: string }
  | { type: "REMOVE_SAVED_ITEM"; productSlug: string }
  | { type: "SET_COUPON_CODE"; code: string | null }
  | { type: "SET_SHIPPING_REGION"; region: GhanaRegion | null }
  | { type: "CLEAR_CART" };

const initialState: CartState = {
  items: [],
  savedForLater: [],
  couponCode: null,
  shippingRegion: null,
  isLoaded: false,
};

function clampQuantity(productSlug: string, quantity: number): number {
  const product = getProductBySlug(productSlug);
  if (!product) return quantity;
  return Math.max(0, Math.min(product.stockLevel, quantity));
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.state, isLoaded: true };

    case "ADD_ITEM": {
      const product = getProductBySlug(action.productSlug);
      if (!product || !getStockStatus(product).purchasable) return state;

      const existing = state.items.find((line) => line.productSlug === action.productSlug);
      const items = existing
        ? state.items.map((line) =>
            line.productSlug === action.productSlug
              ? { ...line, quantity: clampQuantity(action.productSlug, line.quantity + action.quantity) }
              : line,
          )
        : [
            ...state.items,
            { productSlug: action.productSlug, quantity: clampQuantity(action.productSlug, action.quantity) },
          ];

      return {
        ...state,
        items,
        savedForLater: state.savedForLater.filter((line) => line.productSlug !== action.productSlug),
      };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((line) => line.productSlug !== action.productSlug) };

    case "INCREASE_QUANTITY":
      return {
        ...state,
        items: state.items.map((line) =>
          line.productSlug === action.productSlug
            ? { ...line, quantity: clampQuantity(action.productSlug, line.quantity + 1) }
            : line,
        ),
      };

    case "DECREASE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((line) =>
            line.productSlug === action.productSlug ? { ...line, quantity: line.quantity - 1 } : line,
          )
          .filter((line) => line.quantity > 0),
      };

    case "SAVE_FOR_LATER": {
      const line = state.items.find((l) => l.productSlug === action.productSlug);
      if (!line) return state;
      const alreadySaved = state.savedForLater.some((l) => l.productSlug === action.productSlug);
      return {
        ...state,
        items: state.items.filter((l) => l.productSlug !== action.productSlug),
        savedForLater: alreadySaved ? state.savedForLater : [...state.savedForLater, { ...line, quantity: 1 }],
      };
    }

    case "MOVE_TO_CART": {
      const line = state.savedForLater.find((l) => l.productSlug === action.productSlug);
      if (!line) return state;
      const product = getProductBySlug(action.productSlug);
      const purchasable = product ? getStockStatus(product).purchasable : false;
      const alreadyInCart = state.items.some((l) => l.productSlug === action.productSlug);

      return {
        ...state,
        savedForLater: state.savedForLater.filter((l) => l.productSlug !== action.productSlug),
        items: purchasable && !alreadyInCart ? [...state.items, { ...line, quantity: 1 }] : state.items,
      };
    }

    case "REMOVE_SAVED_ITEM":
      return {
        ...state,
        savedForLater: state.savedForLater.filter((line) => line.productSlug !== action.productSlug),
      };

    case "SET_COUPON_CODE":
      return { ...state, couponCode: action.code };

    case "SET_SHIPPING_REGION":
      return { ...state, shippingRegion: action.region };

    case "CLEAR_CART":
      return { ...state, items: [], couponCode: null, shippingRegion: null };

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartLine[];
  savedForLater: CartLine[];
  couponCode: string | null;
  shippingRegion: GhanaRegion | null;
  itemCount: number;
  isLoaded: boolean;
  addItem: (productSlug: string, quantity?: number) => void;
  removeItem: (productSlug: string) => void;
  increaseQuantity: (productSlug: string) => void;
  decreaseQuantity: (productSlug: string) => void;
  saveForLater: (productSlug: string) => void;
  moveToCart: (productSlug: string) => void;
  removeSavedItem: (productSlug: string) => void;
  setCouponCode: (code: string | null) => void;
  setShippingRegion: (region: GhanaRegion | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cart starts empty on both server and first client render (no way to
  // read localStorage on the server), then hydrates from localStorage
  // once mounted — this is what keeps logout from clearing it, since
  // localStorage is untouched by signing out of the NextAuth session.
  useEffect(() => {
    let stored: PersistedCartState = {
      items: [],
      savedForLater: [],
      couponCode: null,
      shippingRegion: null,
    };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        stored = {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          savedForLater: Array.isArray(parsed.savedForLater) ? parsed.savedForLater : [],
          couponCode: typeof parsed.couponCode === "string" ? parsed.couponCode : null,
          shippingRegion: typeof parsed.shippingRegion === "string" ? parsed.shippingRegion : null,
        };
      }
    } catch {
      // Malformed localStorage content — start fresh instead of crashing.
    }
    dispatch({ type: "HYDRATE", state: stored });
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    const persisted: PersistedCartState = {
      items: state.items,
      savedForLater: state.savedForLater,
      couponCode: state.couponCode,
      shippingRegion: state.shippingRegion,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [state.items, state.savedForLater, state.couponCode, state.shippingRegion, state.isLoaded]);

  const itemCount = useMemo(() => state.items.reduce((sum, line) => sum + line.quantity, 0), [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      savedForLater: state.savedForLater,
      couponCode: state.couponCode,
      shippingRegion: state.shippingRegion,
      itemCount,
      isLoaded: state.isLoaded,
      addItem: (productSlug, quantity = 1) => dispatch({ type: "ADD_ITEM", productSlug, quantity }),
      removeItem: (productSlug) => dispatch({ type: "REMOVE_ITEM", productSlug }),
      increaseQuantity: (productSlug) => dispatch({ type: "INCREASE_QUANTITY", productSlug }),
      decreaseQuantity: (productSlug) => dispatch({ type: "DECREASE_QUANTITY", productSlug }),
      saveForLater: (productSlug) => dispatch({ type: "SAVE_FOR_LATER", productSlug }),
      moveToCart: (productSlug) => dispatch({ type: "MOVE_TO_CART", productSlug }),
      removeSavedItem: (productSlug) => dispatch({ type: "REMOVE_SAVED_ITEM", productSlug }),
      setCouponCode: (code) => dispatch({ type: "SET_COUPON_CODE", code }),
      setShippingRegion: (region) => dispatch({ type: "SET_SHIPPING_REGION", region }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
