import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  MapPin,
  PartyPopper,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    {
      label: t("hero.exploreMenu", "Explorer le menu"),
      icon: BookOpenText,
      onClick: () => navigate("/menu"),
    },
    {
      label: t("hero.tableReservation", "Réserver une table"),
      icon: CalendarDays,
      onClick: () => navigate("/book-a-table"),
    },
    {
      label: t("hero.eventReservation", "Organiser un événement"),
      icon: PartyPopper,
      onClick: () => navigate("/book-event"),
    },
    {
      label: t("hero.findUs", "Nous trouver"),
      icon: MapPin,
      onClick: () =>
        window.open(
          "https://maps.app.goo.gl/hKKRSBeCKJscSZY46",
          "_blank",
          "noopener,noreferrer",
        ),
    },
  ];

  const mustHaves = [
    {
      title: t("hero.mustHave1Title", "Chawarma poulet"),
      subtitle: t("hero.mustHave1Subtitle", "Le grand classique maison"),
      image: "/images/pouletplat.jpeg",
      href: "/menu",
    },
    {
      title: t("hero.mustHave2Title", "Hoummous"),
      subtitle: t("hero.mustHave2Subtitle", "Fondant, grillé, généreux"),
      image: "/images/hoummous.jpeg",
      href: "/menu",
    },
    {
      title: t("hero.mustHave3Title", "Mezzés à partager"),
      subtitle: t("hero.mustHave3Subtitle", "Un peu de tout, à plusieurs"),
      image: "/images/mezzePartage.jpeg",
      href: "/menu",
    },
    {
      title: t("hero.mustHave6Title", "Loubia b Zeyt"),
      subtitle: t(
        "hero.mustHave6Subtitle",
        "Haricots mijotés à l’huile d’olive",
      ),
      image: "/images/loubye.jpeg",
      href: "/menu",
    },
    {
      title: t("hero.mustHave4Title", "Miss Tabboulé"),
      subtitle: t("hero.mustHave4Subtitle", "Frais, herbacé et généreux"),
      image: "/images/tabboule.jpeg",
      href: "/menu",
    },
    {
      title: t("hero.mustHave5Title", "Namoura"),
      subtitle: t("hero.mustHave5Subtitle", "Douceur libanaise à la semoule"),
      image: "/images/namoura.jpeg",
      href: "/menu",
    },
  ];

  // Duplicate the cards once so the automatic slider can loop without
  // jumping back to the beginning.
  const mustHavesLoop = [...mustHaves, ...mustHaves];

  useEffect(() => {
    const slider = document.getElementById("mobile-must-haves-slider");
    if (!slider) return;

    let frame = 0;
    let lastTime = performance.now();

    // Gentle continuous motion. Raise this value if you want it faster.
    const pixelsPerSecond = 23;

    const getLoopWidth = () => {
      const cards = slider.querySelectorAll<HTMLElement>(
        "[data-must-have-card]",
      );

      if (cards.length < mustHaves.length * 2) return 0;

      // Exact distance between the first card of copy #1
      // and the first card of copy #2, including gaps.
      return cards[mustHaves.length].offsetLeft - cards[0].offsetLeft;
    };

    const animate = (now: number) => {
      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const loopWidth = getLoopWidth();

      if (loopWidth > 0) {
        slider.scrollLeft += pixelsPerSecond * deltaSeconds;

        // Invisible reset because the second group is an exact duplicate.
        if (slider.scrollLeft >= loopWidth) {
          slider.scrollLeft -= loopWidth;
        }
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [mustHaves.length]);
  return (
    <>
      <section
        id="home"
        className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#f7f0e4] md:hidden"
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/vidback.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,8,.90)_0%,rgba(8,16,8,.76)_42%,rgba(8,16,8,.30)_72%,rgba(8,16,8,.18)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.24)_0%,rgba(0,0,0,.05)_45%,rgba(0,0,0,.58)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-5 pt-[92px]">
            <div className="max-w-[320px]">
              <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.19em] text-[#e0b13c]">
                <Sparkles className="h-3.5 w-3.5" />
                {t("hero.mobileKicker", "Cuisine libanaise maison")}
              </div>

              <h1 className="font-playfair text-[34px] font-semibold leading-[0.98] tracking-[-0.035em] text-white">
                <span className="block text-[#e2b74c]">
                  {t("hero.habibi", "Habibi!")}
                </span>
                <span className="mt-1 block text-white">
                  {t("hero.welcomeAt", "Bienvenue chez")}
                </span>
                <span className="mt-1 block text-[#59a748]">
                  {t("hero.brandName", "Miss Chawarma")}
                </span>
              </h1>

              <div className="my-3 flex items-center gap-3">
                <span className="h-px w-14 bg-[#d9aa32]" />
                <span className="text-[#d9aa32]">✦</span>
                <span className="h-px w-14 bg-[#d9aa32]" />
              </div>

              <p className="max-w-[260px] font-playfair text-[14px] leading-5 text-white/90">
                {t("hero.mobileSubtitle", "Cuisine libanaise maison")}
                <br />
                Paris 11e
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="mt-5 inline-flex h-[50px] w-full max-w-[320px] items-center justify-center gap-3 rounded-[10px] border border-[#e5c15d] bg-[linear-gradient(135deg,#1f6b2d,#2f843b)] px-5 text-[13px] font-extrabold uppercase tracking-[0.055em] text-white shadow-[0_14px_32px_rgba(0,0,0,.28)] active:scale-[.985]"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("hero.commande", "Commander en ligne")}
            </button>
          </div>
        </div>

        <div className="relative z-20 shrink-0 bg-[#f7f0e4] px-4 py-3">
          {" "}
          <div className="grid grid-cols-2 gap-1.5">
            {quickActions.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex min-h-[74px] flex-col items-center justify-center rounded-[14px] border border-[#d9b64c]/70 bg-[#fffdf8] px-3 py-2.5 text-center shadow-[0_6px_20px_rgba(18,63,29,.045)] transition active:scale-[.98]"
              >
                <Icon
                  className="mb-1.5 h-6 w-6 text-[#2d7c36]"
                  strokeWidth={1.65}
                />
                <span className="font-playfair text-[13px] font-semibold leading-[1.15] text-[#253126]">
                  {label}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://maps.app.goo.gl/hKKRSBeCKJscSZY46",
                "_blank",
                "noopener,noreferrer",
              )
            }
            className="mt-3 flex w-full items-center gap-3 rounded-[14px] border border-[#1f6b2d]/10 bg-[#fffdf8] px-3 py-2.5 text-left shadow-[0_8px_22px_rgba(18,63,29,.055)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1f6b2d]/8 text-[#1f6b2d]">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[12px] text-[#263228]">
                Miss Chawarma
              </strong>
              <span className="mt-0.5 block text-[10px] text-[#777b74]">
                {t("hero.openingMobile", "Ouvert 7j/7")}
              </span>
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-[#1f6b2d]">
              {t("hero.viewMap", "Voir la carte")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f7f0e4] px-4 pb-8 pt-1 md:hidden">
        <div className="mt-2">
          <div className="mb-5 flex flex-col items-center justify-center text-center">
            <p className="font-playfair text-[25px] font-semibold text-[#123f1d]">
              {t("hero.mustHaves", "Nos incontournables")}
            </p>

            <div className="mt-2 flex w-28 items-center justify-center gap-2">
              <span className="h-px flex-1 bg-[#d8b24d]/60" />
              <span className="text-[#c59a28]">✦</span>
              <span className="h-px flex-1 bg-[#d8b24d]/60" />
            </div>
          </div>
          <div
            id="mobile-must-haves-slider"
            className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
              touchAction: "pan-x",
            }}
          >
            {mustHavesLoop.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                data-must-have-card
                aria-hidden={index >= mustHaves.length ? true : undefined}
                tabIndex={index >= mustHaves.length ? -1 : 0}
                onClick={() => navigate(item.href)}
                className="group relative shrink-0 isolate overflow-hidden rounded-[14px] bg-[#123f1d] text-left shadow-[0_7px_18px_rgba(18,63,29,.11)] active:scale-[.99]"
                style={{
                  width: "clamp(142px, 42vw, 172px)",
                  WebkitTransform: "translateZ(0)",
                  transform: "translateZ(0)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  contain: "paint",
                }}
              >
                <div className="relative h-[112px] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="font-playfair text-[15px] font-semibold leading-[1.05] text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[9.5px] leading-tight text-white/80">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md">
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8d84]">
            {t("hero.swipeHint", "Faites glisser pour découvrir")}
          </p>
        </div>
      </section>
      <section
        id="home-desktop"
        className="relative hidden w-full items-center justify-center overflow-hidden md:flex"
        style={{ height: "100vh", minHeight: "100vh" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        >
          <source src="/videos/vidback.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        <div className="relative z-20 flex w-full flex-col items-center justify-center px-6 pt-10 text-center sm:px-10 sm:pt-14 lg:px-16">
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mb-10 w-full max-w-4xl font-playfair text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t("hero.greeting")}{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #2d8a2d, #5cb85c, #a8d5a2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
                animation: "slideInRight 0.8s ease forwards",
                fontFamily: "Fraunces, serif",
                letterSpacing: "0.05em",
                fontWeight: 400,
              }}
            >
              {t("hero.brandName")}
            </span>
          </h1>

          <Button
            variant="outline"
            size="lg"
            className="min-w-[200px] px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:text-white sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #055c05, #055c05, #055c05)",
              border: "1.5px solid #C9A63A",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
            onClick={() => navigate("/menu")}
          >
            {t("hero.commande")}
          </Button>

          <p
            data-aos="fade-up"
            data-aos-delay="500"
            className="mt-8 mb-8 w-full max-w-2xl font-playfair text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl"
          >
            {t("hero.subtitleLine1")}
            <br /> {t("hero.subtitleLine2")}
            <br /> {t("hero.subtitleLine3")}
            <br />
            <br />
            <a
              href="https://maps.app.goo.gl/hKKRSBeCKJscSZY46"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light tracking-widest text-[#b7f3c0] transition-all duration-200 sm:text-base"
            >
              📍 {t("hero.location")}
            </a>
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="1000"
            className="flex w-full items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="flex h-[52px] w-[280px] items-center justify-center whitespace-nowrap border-0 px-8 text-lg font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #055c05, #055c05, #055c05)",
                border: "1.5px solid #C9A63A",
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              onClick={() => navigate("/menu")}
            >
              {t("hero.exploreMenu")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex h-[52px] w-[280px] items-center justify-center whitespace-nowrap px-8 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:text-white"
              style={{
                background: "linear-gradient(135deg, #C99A2E, #C99A2E)",
                borderColor: "#055c05",
                boxShadow: "0 0 10px rgba(240,211,90,0.35)",
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              onClick={() => navigate("/book-a-table")}
            >
              {t("hero.tableReservation")}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex h-[52px] w-[280px] items-center justify-center whitespace-nowrap px-8 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:text-white"
              style={{
                background:
                  "linear-gradient(135deg, #055c05, #055c05, #055c05)",
                borderColor: "#C9A63A",
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              onClick={() => navigate("/book-event")}
            >
              {t("hero.eventReservation")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
