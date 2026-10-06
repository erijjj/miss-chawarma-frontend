import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  dishId: number;
  name: string;
  price: number; // prix numérique utilisé pour les calculs
  priceLabel: string; // texte affiché, ex. "8,90€"
  image?: string;
  quantity: number;
  lineId?: string;
  isBeignet?: boolean; // ⟵ active la tarification par palier (2,50€/pièce, 6 pour 12€, 12 pour 21,90€)
  customizations?: {
    removed?: string[];
    choices?: Record<string, { dish_ids: number[]; alternative?: string }>; // ex: { "Sauce": ["Sauce toum"] }
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
  beignetsCount: number; // nombre total de beignets dans le panier
  beignetsDiscount: number; // économie réalisée grâce aux paliers (montant positif)
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "miss-chawarma-cart";

// ─── Tarification par palier pour les beignets ────────────────────────────────
// Prix "à emporter / livraison" : 2,50€/pièce · 6 pièces = 12€ · 12 pièces = 21,90€
//
// Les paliers s'appliquent aussi partiellement : 7 beignets = 1 lot de 6 (12€)
// + 1 pièce (2,50€) = 14,50€, et non 7 × 2,50€.
//
// Les paliers sont strictement dégressifs (2,50€/pc à l'unité, 2€/pc par 6,
// 1,825€/pc par 12), donc l'algorithme glouton — consommer d'abord les plus
// gros paliers — donne toujours le prix minimal possible.
const BEIGNET_UNIT_PRICE = 2.5;
const BEIGNET_SIX_PRICE = 12;
const BEIGNET_DOZEN_PRICE = 21.9;

const round2 = (n: number) => Math.round(n * 100) / 100;

const calcBeignetsTierTotal = (qty: number): number => {
  if (qty <= 0) return 0;

  const dozens = Math.floor(qty / 12);
  let remainder = qty % 12;

  const sixes = Math.floor(remainder / 6);
  remainder = remainder % 6;

  return round2(
    dozens * BEIGNET_DOZEN_PRICE +
      sixes * BEIGNET_SIX_PRICE +
      remainder * BEIGNET_UNIT_PRICE,
  );
};

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

  // Total "au prix unitaire" — sert d'affichage ligne par ligne (inchangé) et
  // de base pour calculer l'économie réalisée sur les beignets.
  const flatSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const beignetsCount = items
    .filter((i) => i.isBeignet)
    .reduce((sum, i) => sum + i.quantity, 0);

  const beignetsFlatTotal = items
    .filter((i) => i.isBeignet)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const beignetsTierTotal = calcBeignetsTierTotal(beignetsCount);

  // Économie réalisée grâce aux paliers (jamais négative, au cas où le
  // prix unitaire en base ne serait pas exactement 2,50€).
  const beignetsDiscount = round2(
    Math.max(0, beignetsFlatTotal - beignetsTierTotal),
  );

  const subtotal = round2(flatSubtotal - beignetsDiscount);
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
        beignetsCount,
        beignetsDiscount,
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