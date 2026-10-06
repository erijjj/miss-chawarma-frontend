import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import LogoBlanc from "../assets/images/logoBlancMC.png";
import LogoVert from "../assets/images/logoMCnoir.png";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCart } from "@/context/CartContext";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";
const CREAM = "#f7f0e4";

const Header = () => {
  const { t } = useTranslation();
  const { itemCount, openDrawer } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnDarkSection, setIsOnDarkSection] = useState(
    location.pathname === "/",
  );
  const [hasScrolled, setHasScrolled] = useState(false);

  const isLightPage =
    location.pathname === "/menu" ||
    location.pathname === "/book-a-table" ||
    location.pathname === "/book-event" ||
    location.pathname === "/checkout";

  const NAV_ITEMS = [
    { name: t("nav.home", "Accueil"), href: "#home" },
    { name: t("nav.about", "À propos"), href: "/about" },
    { name: t("nav.menu", "Le menu"), href: "/menu" },
    {
      name: t("nav.bookTable", "Réserver une table"),
      href: "/book-a-table",
    },
    {
      name: t("nav.bookEvent", "Organiser un événement"),
      href: "/book-event",
    },
    { name: t("nav.chef", "Notre chef"), href: "#chefs" },
    { name: t("nav.contact", "Contact"), href: "#contact" },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHasScrolled(currentScrollY > 35);

      if (!isLightPage && location.pathname === "/") {
        const aboutSection = document.querySelector("#about");

        if (aboutSection) {
          const rect = aboutSection.getBoundingClientRect();
          setIsOnDarkSection(rect.top > 90);
        }
      } else {
        setIsOnDarkSection(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 110) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    const showHeader = () => setIsVisible(true);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("showHeader", showHeader);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("showHeader", showHeader);
    };
  }, [lastScrollY, isLightPage, location.pathname]);

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (href === "#home") {
      if (location.pathname !== "/") {
        navigate("/");
        window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (location.pathname !== "/") {
      navigate(`/${href}`);

      window.setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);

      return;
    }

    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const useWhiteElements = !isLightPage && isOnDarkSection && !hasScrolled;

  const textColorClass = useWhiteElements ? "text-white" : "text-[#20241f]";

  const hoverClass = "hover:text-[#1f6b2d]";

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        background: useWhiteElements
          ? hasScrolled
            ? "rgba(12, 20, 12, 0.55)"
            : "transparent"
          : hasScrolled
            ? "rgba(247, 240, 228, 0.88)"
            : "rgba(247, 240, 228, 0.97)",
        backdropFilter: hasScrolled ? "blur(18px)" : "blur(8px)",
        WebkitBackdropFilter: hasScrolled ? "blur(18px)" : "blur(8px)",
        boxShadow: hasScrolled ? "0 10px 30px rgba(40, 55, 35, 0.08)" : "none",
        borderBottom: hasScrolled
          ? "1px solid rgba(31, 107, 45, 0.09)"
          : "1px solid transparent",
      }}
      onMouseEnter={() => setIsVisible(true)}
    >
      <div
        className="fixed left-0 right-0 top-0 z-40 h-3"
        onMouseEnter={() => setIsVisible(true)}
      />

      <nav className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[82px] items-center justify-between md:h-[86px]">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavigation("#home")}
            className="relative z-50 flex shrink-0 items-center focus:outline-none"
            aria-label={t("nav.home", "Accueil")}
          >
            <img
              src={useWhiteElements ? LogoBlanc : LogoVert}
              alt="Miss Chawarma - Restaurant libanais"
              className="h-[62px] w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,.15)] transition duration-300 hover:scale-[1.03] hover:opacity-90 md:h-[68px]"
            />
          </button>

          {/* Navigation desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map(({ name, href }) => {
              const isActive =
                href.startsWith("/") && location.pathname === href;

              return (
                <button
                  key={href}
                  type="button"
                  onClick={() => handleNavigation(href)}
                  className={`group relative rounded-full px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${textColorClass} ${hoverClass} ${
                    isActive
                      ? "bg-[#1f6b2d]/10 text-[#1f6b2d]"
                      : "hover:bg-[#1f6b2d]/5"
                  }`}
                >
                  {name}

                  <span
                    className={`absolute bottom-[3px] left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-5 bg-[#c59a28]"
                        : "w-0 bg-[#1f6b2d] group-hover:w-5"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Actions desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <div
              className="h-6 w-px"
              style={{
                background: useWhiteElements
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(31,107,45,0.15)",
              }}
            />

            <LanguageSwitcher
              textColor={useWhiteElements ? "#ffffff" : "#1f6b2d"}
            />

            <button
              type="button"
              onClick={openDrawer}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${textColorClass} ${hoverClass} hover:bg-[#1f6b2d]/8`}
              aria-label={t("cart.title", "Votre panier")}
            >
              <ShoppingBag className="h-[21px] w-[21px]" />

              {itemCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{
                    background: GOLD,
                    boxShadow: "0 2px 7px rgba(196,125,14,0.35)",
                  }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Actions mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <div className="rounded-full bg-black/15 p-0.5 backdrop-blur-sm">
              <LanguageSwitcher textColor={useWhiteElements ? "#ffffff" : GREEN} />
            </div>

            <button
              type="button"
              onClick={openDrawer}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-sm transition active:scale-95 ${textColorClass}`}
              aria-label={t("cart.title", "Votre panier")}
            >
              <ShoppingBag className="h-[21px] w-[21px]" />
              {itemCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: GOLD }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/10 backdrop-blur-sm transition active:scale-95 ${textColorClass}`}
              aria-label={t("nav.toggleMenu", "Ouvrir le menu")}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Tablette : comportement actuel */}
          <div className="hidden items-center gap-2 md:flex lg:hidden">
            <LanguageSwitcher textColor={useWhiteElements ? "#ffffff" : GREEN} />

            <button
              type="button"
              onClick={openDrawer}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${textColorClass}`}
              aria-label={t("cart.title", "Votre panier")}
            >
              <ShoppingBag className="h-[21px] w-[21px]" />
              {itemCount > 0 && (
                <span
                  className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: GOLD }}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${textColorClass}`}
              aria-label={t("nav.toggleMenu", "Ouvrir le menu")}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Petit accent libanais doré/vert */}
      <div
        className="h-[2px] w-full origin-left transition-opacity duration-300"
        style={{
          opacity: hasScrolled || isLightPage ? 1 : 0,
          background:
            "linear-gradient(90deg, transparent 0%, #1f6b2d 22%, #c59a28 50%, #1f6b2d 78%, transparent 100%)",
        }}
      />

      {/* Menu mobile */}
      <div
        className={`absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 lg:hidden ${
          isMenuOpen
            ? "max-h-[520px] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div
          className="mx-3 mt-2 overflow-hidden rounded-3xl border p-3 shadow-2xl"
          style={{
            background: "rgba(247, 240, 228, 0.98)",
            borderColor: "rgba(31,107,45,0.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/55 px-4 py-3">
            <div
              className="h-8 w-1 rounded-full"
              style={{ background: `linear-gradient(${GREEN}, ${GOLD})` }}
            />

            <div>
              <p
                className="font-fraunces text-base font-semibold"
                style={{ color: DARK_GREEN }}
              >
                Miss Chawarma
              </p>
              <p className="text-[11px] text-neutral-500">
                {t("nav.tagline", "Cuisine libanaise authentique")}
              </p>
            </div>
          </div>

          <div className="grid gap-1">
            {NAV_ITEMS.map(({ name, href }) => (
              <button
                key={href}
                type="button"
                onClick={() => handleNavigation(href)}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[14px] font-semibold uppercase tracking-[0.04em] transition hover:bg-[#1f6b2d]/8"
                style={{ color: DARK_GREEN }}
              >
                <span>{name}</span>
                <span style={{ color: GOLD }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
