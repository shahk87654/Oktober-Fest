"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ShopifyCart } from "@/lib/shopify/types";
import {
  addCartLineAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/actions/cart";

interface CartContextValue {
  cart: ShopifyCart | null;
  ready: boolean;
  isOpen: boolean;
  busy: boolean;
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addLine: (variantId: string, quantity?: number) => Promise<boolean>;
  changeLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "alpine-shopify-cart-id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      await Promise.resolve();
      try {
        const storedId = window.localStorage.getItem(STORAGE_KEY);
        if (!storedId) {
          if (active) setReady(true);
          return;
        }
        const value = await getCartAction(storedId);
        if (!active) return;
        setCart(value);
        if (!value) window.localStorage.removeItem(STORAGE_KEY);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load your bag.");
      } finally {
        if (active) setReady(true);
      }
    };
    void initialize();
    return () => { active = false; };
  }, []);

  const run = useCallback(async (operation: () => Promise<ShopifyCart>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const updated = await operation();
      setCart(updated);
      try {
        window.localStorage.setItem(STORAGE_KEY, updated.id);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Your browser could not save this cart for later.");
      }
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your bag could not be updated.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const addLine = useCallback(
    async (variantId: string, quantity = 1) => {
      const succeeded = await run(() => addCartLineAction(cart?.id ?? null, variantId, quantity));
      setOpen(true);
      return succeeded;
    },
    [cart?.id, run],
  );
  const changeLine = useCallback(
    (lineId: string, quantity: number) => {
      if (!cart) return Promise.reject(new Error("Your bag is not available."));
      return run(() => updateCartLineAction(cart.id, lineId, quantity)).then(() => undefined);
    },
    [cart, run],
  );
  const removeLine = useCallback(
    (lineId: string) => {
      if (!cart) return Promise.reject(new Error("Your bag is not available."));
      return run(() => removeCartLineAction(cart.id, lineId)).then(() => undefined);
    },
    [cart, run],
  );

  const value = useMemo(
    () => ({
      cart,
      ready,
      isOpen,
      busy,
      error,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addLine,
      changeLine,
      removeLine,
    }),
    [cart, ready, isOpen, busy, error, addLine, changeLine, removeLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider.");
  return context;
}
