import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  dishId: number;
  name: string;
  price: number; // prix numérique utilisé pour les calculs
  priceLabel: string; // texte affiché, ex. "8,90€"
  image?: string;
  quantity: number;
  lineId?: string;
  customizations?: {
    removed?: string[];
    choices?: Record<string, { dish_ids: number[]; alternative?: string }> // ex: { "Sauce": ["Sauce toum"] }
  };
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "miss-chawarma-cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota dépassé ou navigation privée — le panier reste juste en mémoire
    }
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    const hasCustomization =
      item.customizations &&
      ((item.customizations.removed?.length ?? 0) > 0 ||
        Object.keys(item.customizations.choices ?? {}).length > 0);

    setItems((prev) => {
      if (!hasCustomization) {
        const existing = prev.find(
          (i) => i.dishId === item.dishId && !i.customizations,
        );
        if (existing) {
          return prev.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
      }
      const lineId = `${item.dishId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [...prev, { ...item, quantity, lineId }];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (lineId: string) => {
    setItems((prev) =>
      prev.filter((i) => (i.lineId ?? String(i.dishId)) !== lineId),
    );
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        (i.lineId ?? String(i.dishId)) === lineId ? { ...i, quantity } : i,
      ),
    );
  };
  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error(
      "useCart doit être utilisé à l'intérieur d'un CartProvider",
    );
  return ctx;
};
