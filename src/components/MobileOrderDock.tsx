import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCart } from "@/context/CartContext";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#123f1d";
const GOLD = "#c47d0e";
const CREAM = "#f7f0e4";

const MAP_URL =
  "https://maps.google.com/?q=128+Rue+Oberkampf+Paris+11";

const MobileOrderDock = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, subtotal, openDrawer } = useCart();

  const [hasScrolled, setHasScrolled] = useState(false);
  const [cartPop, setCartPop] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const previousItemCount = useRef(itemCount);

  const pathname = location.pathname;

  const hidden =
    pathname === "/commander" ||
    pathname === "/manage-reservation" ||
    pathname.startsWith("/admin");

  // Only the top of the homepage gets the richer version.
  // Everywhere else the dock stays compact so it never steals space.
  const forceCompact = pathname !== "/";

  const compact = forceCompact || hasScrolled;

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 150);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (itemCount > previousItemCount.current) {
      setCartPop(true);
      const timer = window.setTimeout(() => setCartPop(false), 650);
      previousItemCount.current = itemCount;
      return () => window.clearTimeout(timer);
    }

    previousItemCount.current = itemCount;
  }, [itemCount]);

  // Hide the mobile order dock whenever a real popup/modal is open.
  // This catches the dish details popup, customization popup, cart drawer,
  // and other full-screen dialogs without having to wire every popup manually.
  useEffect(() => {
    const isElementVisible = (element: Element) => {
      const el = element as HTMLElement;
      const style = window.getComputedStyle(el);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        el.getClientRects().length > 0
      );
    };

    const checkForOverlay = () => {
      const candidates = Array.from(
        document.querySelectorAll(
          '[role="dialog"], [aria-modal="true"], .fixed.inset-0',
        ),
      );

      const hasOpenOverlay = candidates.some((element) => {
        // Never treat the dock itself as an overlay.
        if (element.closest(".mc-mobile-order-dock")) return false;

        // Ignore elements explicitly hidden for accessibility.
        if (element.getAttribute("aria-hidden") === "true") return false;

        return isElementVisible(element);
      });

      setOverlayOpen(hasOpenOverlay);
    };

    checkForOverlay();

    const observer = new MutationObserver(checkForOverlay);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden", "aria-modal", "open"],
    });

    window.addEventListener("resize", checkForOverlay);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkForOverlay);
    };
  }, []);

  // Tell the floating chatbot exactly how much space the dock occupies.
  // The Chatbot file reads this CSS variable only on mobile.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(max-width: 767px)");

    const syncOffset = () => {
      if (hidden || overlayOpen || !media.matches) {
        root.style.setProperty("--mc-order-dock-offset", "0px");
        return;
      }

      root.style.setProperty(
        "--mc-order-dock-offset",
        compact ? "78px" : "154px",
      );
    };

    syncOffset();
    media.addEventListener?.("change", syncOffset);

    return () => {
      media.removeEventListener?.("change", syncOffset);
      root.style.setProperty("--mc-order-dock-offset", "0px");
    };
  }, [compact, hidden, overlayOpen]);

  if (hidden) return null;

  const lang = i18n.resolvedLanguage === "en" ? "en" : "fr";

  const totalLabel = new Intl.NumberFormat(
    lang === "fr" ? "fr-FR" : "en-GB",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(subtotal);

  const hasCart = itemCount > 0;

  const handleMainAction = () => {
    if (hasCart) {
      openDrawer();
      return;
    }

    if (pathname === "/menu") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("/menu");
  };

  const handleBooking = () => navigate("/book-a-table");

  const handleDirections = () => {
    window.open(MAP_URL, "_blank", "noopener,noreferrer");
  };

  const mainTitle = hasCart
    ? t("mobileOrderDock.viewCart", "Voir mon panier")
    : t("mobileOrderDock.orderOnline", "Commander en ligne");

  const mainSubtitle = hasCart
    ? t("mobileOrderDock.cartSummary", {
        count: itemCount,
        total: totalLabel,
        defaultValue: `${itemCount} article(s) · ${totalLabel}`,
      })
    : t(
        "mobileOrderDock.orderHint",
        "Votre commande en quelques clics",
      );

  return (
    <>
      <style>{`
        @keyframes mcDockEnter {
          0% {
            opacity: 0;
            transform: translate3d(0, 24px, 0) scale(.97);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes mcDockBagHello {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.08); }
          50% { transform: rotate(7deg) scale(1.08); }
          75% { transform: rotate(-3deg) scale(1.03); }
        }

        @keyframes mcDockShine {
          0% { transform: translateX(-160%) skewX(-18deg); opacity: 0; }
          18% { opacity: .32; }
          55% { opacity: .16; }
          100% { transform: translateX(340%) skewX(-18deg); opacity: 0; }
        }

        @keyframes mcDockPop {
          0% { transform: scale(.82); }
          45% { transform: scale(1.16); }
          100% { transform: scale(1); }
        }

        .mc-mobile-order-dock {
          animation: mcDockEnter .55s cubic-bezier(.2,.8,.2,1) both;
          transition:
            opacity .24s ease,
            transform .32s cubic-bezier(.2,.8,.2,1);
          will-change: transform, opacity;
        }

        .mc-mobile-order-dock.mc-dock-overlay-hidden {
          opacity: 0 !important;
          transform: translate3d(0, 28px, 0) scale(.97) !important;
          pointer-events: none !important;
        }

        .mc-mobile-order-dock .mc-dock-bag {
          animation: mcDockBagHello .65s ease .9s both;
        }

        .mc-mobile-order-dock .mc-dock-shine {
          animation: mcDockShine 1.1s ease 1.1s both;
        }

        .mc-mobile-order-dock .mc-dock-pop {
          animation: mcDockPop .55s cubic-bezier(.2,.9,.2,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .mc-mobile-order-dock,
          .mc-mobile-order-dock .mc-dock-bag,
          .mc-mobile-order-dock .mc-dock-shine,
          .mc-mobile-order-dock .mc-dock-pop {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        className={`mc-mobile-order-dock fixed left-3 right-3 z-[52] mx-auto max-w-[430px] md:hidden ${
          overlayOpen ? "mc-dock-overlay-hidden" : ""
        }`}
        style={{
          bottom: "calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          className={`overflow-hidden border transition-all duration-500 ${
            compact
              ? "rounded-[20px] p-[6px]"
              : "rounded-[24px] p-[9px]"
          }`}
          style={{
            background: "rgba(255,253,248,.92)",
            borderColor: "rgba(196,125,14,.28)",
            boxShadow:
              "0 18px 48px rgba(18,63,29,.19), 0 4px 14px rgba(196,125,14,.09)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {!compact && (
            <div className="px-2 pb-2 pt-1">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.13em]"
                  style={{ color: GOLD }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {t(
                      "mobileOrderDock.kicker",
                      "Une envie de Liban ?",
                    )}
                  </span>
                </div>

                <span
                  className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em]"
                  style={{
                    color: DARK_GREEN,
                    background: "rgba(31,107,45,.07)",
                  }}
                >
                  {t("mobileOrderDock.houseMade", "Fait maison")}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleMainAction}
            aria-label={
              hasCart
                ? t(
                    "mobileOrderDock.openCartAria",
                    "Ouvrir mon panier",
                  )
                : t(
                    "mobileOrderDock.orderAria",
                    "Commander en ligne",
                  )
            }
            className={`group relative flex w-full items-center overflow-hidden text-left text-white transition-all duration-300 active:scale-[.985] ${
              compact
                ? "min-h-[58px] rounded-[15px] px-4"
                : "min-h-[64px] rounded-[17px] px-4"
            }`}
            style={{
              background:
                "linear-gradient(135deg, #164f22 0%, #1f6b2d 58%, #2f843b 100%)",
              boxShadow: "0 10px 26px rgba(31,107,45,.22)",
            }}
          >
            <span
              aria-hidden
              className="mc-dock-shine pointer-events-none absolute -bottom-6 -top-6 w-12 bg-white/50 blur-md"
              style={{ left: "-20%" }}
            />

            <span
              className={`mc-dock-bag relative mr-3 grid shrink-0 place-items-center rounded-[13px] border border-white/15 bg-white/10 ${
                compact ? "h-10 w-10" : "h-11 w-11"
              }`}
            >
              <ShoppingBag
                className={compact ? "h-5 w-5" : "h-[22px] w-[22px]"}
              />

              {hasCart && (
                <span
                  className={`absolute -right-1.5 -top-1.5 grid h-[19px] min-w-[19px] place-items-center rounded-full px-1 text-[9px] font-black text-white ${
                    cartPop ? "mc-dock-pop" : ""
                  }`}
                  style={{
                    background: GOLD,
                    boxShadow: "0 4px 10px rgba(0,0,0,.22)",
                  }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block truncate font-bold leading-none ${
                  compact ? "text-[14px]" : "text-[15px]"
                }`}
              >
                {mainTitle}
              </span>

              <span className="mt-1 block truncate text-[10px] font-medium text-white/72">
                {mainSubtitle}
              </span>
            </span>

            <span className="ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition-transform duration-300 group-active:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>

          {!compact && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleBooking}
                className="flex min-h-[40px] items-center justify-center gap-2 rounded-[14px] border bg-white/70 px-3 text-[11px] font-bold transition active:scale-[.98]"
                style={{
                  color: DARK_GREEN,
                  borderColor: "rgba(31,107,45,.13)",
                }}
              >
                <CalendarDays className="h-4 w-4" style={{ color: GREEN }} />
                {t("mobileOrderDock.bookTable", "Réserver une table")}
              </button>

              <button
                type="button"
                onClick={handleDirections}
                className="flex min-h-[40px] items-center justify-center gap-2 rounded-[14px] border bg-white/70 px-3 text-[11px] font-bold transition active:scale-[.98]"
                style={{
                  color: DARK_GREEN,
                  borderColor: "rgba(31,107,45,.13)",
                }}
              >
                <MapPin className="h-4 w-4" style={{ color: GOLD }} />
                {t("mobileOrderDock.directions", "Itinéraire")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keeps the very bottom of the page from being hidden behind the dock. */}
      <div
        aria-hidden="true"
        className="h-[92px] md:hidden"
        style={{ background: CREAM }}
      />
    </>
  );
};

export default MobileOrderDock;