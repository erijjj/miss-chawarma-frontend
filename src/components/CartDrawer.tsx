import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const PLACEHOLDER = "https://placehold.co/200x200/9ca89b/f7f0e4?text=🌯";

const formatEuro = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

const CartDrawer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
  } = useCart();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  /** Codes promo — 10% pour le grand public, 60% pour les employés Talints.
   *  Purement côté affichage pour l'instant : à faire remonter dans
   *  CartContext si la réduction doit aussi s'appliquer au paiement réel. */

  const handleContinueShopping = () => {
    closeDrawer();
    navigate("/menu");
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate("/commander");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-[#122016]/55 backdrop-blur-[3px] transition-all duration-500 ${
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      <aside
        className={`cart-drawer fixed right-0 top-0 z-[80] flex h-full w-full flex-col sm:w-[440px] ${
          isDrawerOpen ? "cart-drawer-open" : ""
        }`}
        style={{
          background: "linear-gradient(180deg, #fbf7ef 0%, #f7f0e4 100%)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title", "Votre panier")}
      >
        <div className="cart-drawer-glow" />

        <header
          className="relative overflow-hidden px-5 pb-5 pt-4 text-white"
          style={{
            background:
              "linear-gradient(135deg, #1f6b2d 0%, #174e23 62%, #123f1d 100%)",
          }}
        >
          <div className="cart-header-shine" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="cart-bag-emblem">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="cart-count-badge">{itemCount}</span>
                )}
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
                  Miss Chawarma
                </p>
                <h2 className="font-playfair text-2xl leading-tight">
                  {t("cart.title", "Votre panier")}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="cart-close-button"
              aria-label={t("cart.close", "Fermer")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {items.length > 0 && (
            <div className="relative mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 text-xs text-white/72 backdrop-blur">
              <ChefHat className="h-4 w-4 text-[#e5c77e]" />
              {t(
                "cart.preparationMessage",
                "Votre sélection sera préparée avec soin par notre équipe.",
              )}
            </div>
          )}
        </header>

        <div className="relative flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="cart-empty-orbit">
                <ShoppingBag className="h-11 w-11" />
                <span>✦</span>
              </div>

              <h3
                className="mt-5 font-playfair text-2xl"
                style={{ color: "#123f1d" }}
              >
                {t("cart.emptyTitle", "Un petit creux ?")}
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-neutral-500">
                {t(
                  "cart.empty",
                  "Votre panier est vide. Découvrez nos mezzés, grillades et douceurs libanaises.",
                )}
              </p>

              <button
                type="button"
                onClick={closeDrawer}
                className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, #1f6b2d, #2d8a3e)",
                  boxShadow: "0 12px 24px rgba(31,107,45,0.20)",
                }}
              >
                <UtensilsCrossed className="h-4 w-4" />
                {t("cart.discoverMenu", "Découvrir le menu")}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <article
                    key={item.lineId ?? String(item.dishId)}
                    className="cart-item-card group"
                    style={
                      {
                        animationDelay: `${index * 80}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="cart-item-image-wrap">
                      <img
                        src={item.image || PLACEHOLDER}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="truncate font-fraunces text-[1.05rem]"
                            style={{ color: "#123f1d" }}
                          >
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-neutral-400">
                            {item.priceLabel} × {item.quantity}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.lineId ?? String(item.dishId))
                          }
                          className="cart-trash-button"
                          aria-label={t("cart.remove", "Retirer")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.lineId ?? String(item.dishId),
                                item.quantity - 1,
                              )
                            }
                            aria-label={t("cart.decrease", "Diminuer")}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span key={item.quantity}>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.lineId ?? String(item.dishId),
                                item.quantity + 1,
                              )
                            }
                            aria-label={t("cart.increase", "Augmenter")}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span
                          className="text-sm font-bold"
                          style={{ color: "#c47d0e" }}
                        >
                          {formatEuro(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-footer relative px-5 pb-5 pt-4">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400">
                    {t("cart.subtotal", "Sous-total")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {t(
                      "cart.feesNote",
                      "Livraison et frais calculés à l’étape suivante",
                    )}
                  </p>
                </div>

                <span
                  className="font-playfair text-2xl font-bold"
                  style={{ color: "#123f1d" }}
                >
                  {formatEuro(subtotal)}
                </span>
              </div>
            </div>

            <div className="cart-actions-row">
              <button
                type="button"
                onClick={handleCheckout}
                className="cart-checkout-button group"
              >
                <span className="flex items-center gap-2 font-fraunces">
                  <Sparkles className="h-4 w-4 text-[#e5c77e]" />
                  {t("cart.checkout", "Commander")}
                </span>

                <span className="cart-checkout-arrow">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleContinueShopping}
                className="cart-continue-col"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("cart.continueShopping", "Continuer mes achats")}
              </button>
            </div>

            {/* Code promo — replié derrière un lien, ou réduit à une
                ligne compacte une fois validé, pour ne jamais encombrer */}

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-neutral-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              {t("cart.secureOrder", "Commande sécurisée · Préparation maison")}
            </div>
          </footer>
        )}

        <style>{`
          .cart-drawer {
            transform: translateX(105%);
            box-shadow: -30px 0 70px rgba(20,42,24,0.20);
            transition:
              transform 0.58s cubic-bezier(0.16,1,0.3,1),
              visibility 0.58s;
            visibility: hidden;
            isolation: isolate;
          }

          .cart-drawer-open {
            transform: translateX(0);
            visibility: visible;
          }

          .cart-drawer-glow {
            position: absolute;
            right: -120px;
            top: 28%;
            width: 280px;
            height: 280px;
            border-radius: 999px;
            background:
              radial-gradient(circle, rgba(196,125,14,0.09), transparent 70%);
            pointer-events: none;
          }

          .cart-header-shine {
            position: absolute;
            inset: -80%;
            background:
              linear-gradient(
                115deg,
                transparent 43%,
                rgba(255,255,255,0.08) 50%,
                transparent 57%
              );
            transform: translateX(-45%);
            animation: cartHeaderShine 7s ease-in-out infinite;
          }

          .cart-bag-emblem {
            position: relative;
            display: flex;
            width: 44px;
            height: 44px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 15px;
            background: rgba(255,255,255,0.09);
          }

          .cart-count-badge {
            position: absolute;
            right: -5px;
            top: -5px;
            display: flex;
            min-width: 19px;
            height: 19px;
            align-items: center;
            justify-content: center;
            border: 2px solid #1f6b2d;
            border-radius: 999px;
            padding: 0 4px;
            background: #e5c77e;
            color: #123f1d;
            font-size: 9px;
            font-weight: 800;
          }

          .cart-close-button {
            display: flex;
            width: 38px;
            height: 38px;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
            transition:
              transform 0.3s ease,
              background 0.3s ease;
          }

          .cart-close-button:hover {
            transform: rotate(90deg);
            background: rgba(255,255,255,0.15);
          }

          .cart-item-card {
            display: flex;
            align-items: center;
            gap: 13px;
            overflow: hidden;
            border: 1px solid rgba(31,107,45,0.08);
            border-radius: 20px;
            padding: 11px;
            opacity: 0;
            background: rgba(255,255,255,0.88);
            box-shadow: 0 8px 20px rgba(31,60,30,0.06);
            transform: translateX(28px);
            animation: cartItemIn 0.62s cubic-bezier(0.16,1,0.3,1) forwards;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease,
              border-color 0.3s ease;
          }

          .cart-item-card:hover {
            transform: translateX(-4px);
            border-color: rgba(196,125,14,0.20);
            box-shadow: 0 14px 28px rgba(31,60,30,0.10);
          }

          .cart-item-image-wrap {
            width: 72px;
            height: 72px;
            flex: 0 0 auto;
            overflow: hidden;
            border-radius: 16px;
            box-shadow: 0 8px 16px rgba(31,60,30,0.10);
          }

          .cart-item-image-wrap img {
            transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          }

          .cart-item-card:hover .cart-item-image-wrap img {
            transform: scale(1.10);
          }

          .cart-trash-button {
            display: flex;
            width: 27px;
            height: 27px;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            color: #a3a3a3;
            transition:
              color 0.25s ease,
              background 0.25s ease,
              transform 0.25s ease;
          }

          .cart-trash-button:hover {
            color: #b63b35;
            background: rgba(182,59,53,0.08);
            transform: rotate(-8deg) scale(1.08);
          }

          .cart-quantity-control {
            display: flex;
            align-items: center;
            overflow: hidden;
            border: 1px solid rgba(31,107,45,0.18);
            border-radius: 999px;
            background: rgba(247,240,228,0.72);
          }

          .cart-quantity-control button {
            display: flex;
            width: 29px;
            height: 29px;
            align-items: center;
            justify-content: center;
            color: #1f6b2d;
            transition:
              background 0.2s ease,
              transform 0.2s ease;
          }

          .cart-quantity-control button:hover {
            background: rgba(31,107,45,0.09);
            transform: scale(1.10);
          }

          .cart-quantity-control span {
            width: 24px;
            text-align: center;
            color: #123f1d;
            font-size: 13px;
            font-weight: 700;
            animation: cartQuantityPop 0.3s ease-out;
          }

          .cart-empty-orbit {
            position: relative;
            display: flex;
            width: 96px;
            height: 96px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(31,107,45,0.12);
            border-radius: 999px;
            color: #1f6b2d;
            background:
              radial-gradient(circle, rgba(31,107,45,0.09), transparent 70%);
            animation: cartEmptyFloat 4s ease-in-out infinite;
          }

          .cart-empty-orbit span {
            position: absolute;
            right: 8px;
            top: 10px;
            color: #c47d0e;
            animation: cartSparkle 1.8s ease-in-out infinite;
          }

          /* Commander + Continuer mes achats, côte à côte */
          .cart-actions-row {
            display: flex;
            align-items: stretch;
            gap: 10px;
          }

          .cart-actions-row .cart-checkout-button {
            flex: 1.15;
            min-width: 0;
          }

          .cart-continue-col {
            display: flex;
            flex: 1;
            min-width: 0;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 18px;
            border: 1.5px solid rgba(196,125,14,0.30);
            background: rgba(196,125,14,0.06);
            color: #7b4d08;
            font-size: 12px;
            font-weight: 700;
            line-height: 1.15;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            padding: 0 6px;
            transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          }

          .cart-continue-col svg {
            flex-shrink: 0;
          }

          .cart-continue-col:hover {
            background: rgba(196,125,14,0.12);
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(120,80,10,0.14);
          }

          @media (max-width: 360px) {
            /* Écran très étroit : on empile plutôt que de tout écraser */
            .cart-actions-row {
              flex-direction: column;
            }

            .cart-continue-col {
              padding: 11px 6px;
            }
          }

          /* Code promo replié : simple lien discret */
          .cart-promo-toggle {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            padding: 8px;
            color: #7b4d08;
            font-size: 12.5px;
            font-weight: 700;
            transition: opacity 0.2s ease;
          }

          .cart-promo-toggle:hover {
            opacity: 0.75;
          }

          /* Code promo */
          .cart-promo {
            margin-top: 10px;
            padding: 12px;
            border-radius: 16px;
            border: 1px dashed rgba(196,125,14,0.35);
            background: rgba(196,125,14,0.05);
          }

          .cart-promo-label {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #7b4d08;
          }

          .cart-promo-row {
            display: flex;
            gap: 8px;
          }

          .cart-promo-input {
            flex: 1;
            min-width: 0;
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid rgba(196,125,14,0.25);
            background: #fff;
            font-size: 13px;
            color: #333;
            outline: none;
          }

          .cart-promo-input:focus {
            border-color: rgba(196,125,14,0.55);
          }

          .cart-promo-apply {
            flex-shrink: 0;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 12.5px;
            font-weight: 700;
            color: #fff;
            background: linear-gradient(135deg, #c47d0e, #e6b84a);
            transition: transform 0.2s ease, opacity 0.2s ease;
          }

          .cart-promo-apply:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .cart-promo-apply:not(:disabled):hover {
            transform: translateY(-1px);
          }

          .cart-promo-message {
            margin: 8px 0 0;
            font-size: 12px;
            font-weight: 600;
          }

          .cart-promo-message-error {
            color: #b63b35;
          }

          /* Ligne compacte une fois le code validé — remplace tout le bloc */
          .cart-promo-applied {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 10px;
            padding: 9px 13px;
            border-radius: 12px;
            background: rgba(31,107,45,0.08);
            border: 1px solid rgba(31,107,45,0.18);
            font-size: 12.5px;
            font-weight: 700;
            color: #164f22;
          }

          .cart-promo-applied span {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .cart-promo-applied button {
            color: #7b4d08;
            font-weight: 600;
            text-decoration: underline;
            text-underline-offset: 2px;
          }

          .cart-promo-applied button:hover {
            color: #b63b35;
          }

          .cart-footer {
            border-top: 1px solid rgba(31,107,45,0.10);
            background: rgba(247,240,228,0.92);
            box-shadow: 0 -12px 28px rgba(31,60,30,0.05);
            backdrop-filter: blur(12px);
          }

          .cart-checkout-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            overflow: hidden;
            border-radius: 18px;
            padding: 13px 14px 13px 18px;
            color: white;
            font-weight: 700;
            background:
              linear-gradient(135deg, #1f6b2d, #2d8a3e);
            box-shadow: 0 14px 28px rgba(31,107,45,0.22);
            transition:
              transform 0.3s cubic-bezier(0.16,1,0.3,1),
              box-shadow 0.3s ease;
          }

          .cart-checkout-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 18px 34px rgba(31,107,45,0.30);
          }

          .cart-checkout-arrow {
            display: flex;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            background: rgba(255,255,255,0.12);
            transition: transform 0.3s ease;
          }

          .cart-checkout-button:hover .cart-checkout-arrow {
            transform: translateX(4px) rotate(-6deg);
          }

          @keyframes cartItemIn {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes cartHeaderShine {
            0%, 68% {
              opacity: 0;
              transform: translateX(-45%);
            }
            76% {
              opacity: 1;
            }
            92%, 100% {
              opacity: 0;
              transform: translateX(45%);
            }
          }

          @keyframes cartQuantityPop {
            0% { transform: scale(0.72); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes cartEmptyFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          @keyframes cartSparkle {
            0%, 100% { opacity: 0.25; transform: scale(0.7) rotate(0); }
            50% { opacity: 1; transform: scale(1.15) rotate(90deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .cart-drawer,
            .cart-header-shine,
            .cart-item-card,
            .cart-quantity-control span,
            .cart-empty-orbit,
            .cart-empty-orbit span {
              animation: none !important;
              transition: none !important;
            }

            .cart-item-card {
              opacity: 1;
              transform: none;
            }
          }
        `}</style>
      </aside>
    </>
  );
};

export default CartDrawer;
