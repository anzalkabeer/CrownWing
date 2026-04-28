"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Product } from "@/lib/data";

export interface CartItem extends Product {
  quantity: number;
}

export interface Cart {
  id: string;
  name: string;
  items: CartItem[];
}

interface CartContextType {
  carts: Cart[];
  activeCartId: string;
  activeCart: Cart | undefined;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  switchCart: (cartId: string) => Promise<void>;
  createNewCart: (name: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [activeCartId, setActiveCartId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchCarts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts || []);
        setActiveCartId(data.activeCartId || "");
      }
    } catch (e) {
      console.error("Failed to fetch carts", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const activeCart = carts.find((c) => c.id === activeCartId);

  const addToCart = async (product: Product, quantity: number = 1) => {
    // Optimistic update
    setCarts((prev) => {
      const newCarts = [...prev];
      const cartIndex = newCarts.findIndex((c) => c.id === activeCartId);
      if (cartIndex > -1) {
        const items = [...newCarts[cartIndex].items];
        const itemIndex = items.findIndex((i) => i.id === product.id);
        if (itemIndex > -1) {
          items[itemIndex].quantity += quantity;
        } else {
          items.push({ ...product, quantity });
        }
        newCarts[cartIndex] = { ...newCarts[cartIndex], items };
      }
      return newCarts;
    });

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, quantity }),
      });
      await fetchCarts(); // Sync state
    } catch (e) {
      console.error(e);
      await fetchCarts(); // Revert optimistic update on failure
    }
  };

  const removeFromCart = async (productId: number) => {
    // Optimistic update
    setCarts((prev) => {
      const newCarts = [...prev];
      const cartIndex = newCarts.findIndex((c) => c.id === activeCartId);
      if (cartIndex > -1) {
        newCarts[cartIndex].items = newCarts[cartIndex].items.filter((i) => i.id !== productId);
      }
      return newCarts;
    });

    try {
      await fetch(`/api/cart?id=${productId}`, { method: "DELETE" });
      await fetchCarts();
    } catch (e) {
      console.error(e);
      await fetchCarts();
    }
  };

  const switchCart = async (cartId: string) => {
    setActiveCartId(cartId);
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SWITCH_CART", cartId }),
      });
      await fetchCarts();
    } catch (e) {
      console.error(e);
    }
  };

  const createNewCart = async (name: string) => {
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_CART", name }),
      });
      await fetchCarts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        carts,
        activeCartId,
        activeCart,
        isLoading,
        addToCart,
        removeFromCart,
        switchCart,
        createNewCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
