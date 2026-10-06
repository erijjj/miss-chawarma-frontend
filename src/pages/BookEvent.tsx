import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  MessageCircle,
  Loader2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Header from "../components/Header";
import EventForm from "../components/EventForm";
import Footer from "../components/Footer";
import { EVENT_TYPES } from "../config/eventFormsConfig";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";
const CREAM = "#f7f0e4";

const BookEvent = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingError, setExistingError] = useState<string | null>(null);

  const referenceParam = searchParams.get("ref");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    if (!referenceParam || !emailParam) return;

    let cancelled = false;

    const loadExistingEvent = async () => {
      setLoadingExisting(true);
      setExistingError(null);

      try {
        const API_URL =
          import.meta.env.VITE_API_URL ||
          "https://chatbot-api-o6bw.onrender.com";

        const response = await fetch(
          `${API_URL}/api/reservations/event/lookup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: Number(referenceParam),
              email: emailParam,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("event_not_found");
        }

        const data = await response.json();
        if (cancelled) return;

        const normalized = String(data.event_type || "")
          .trim()
          .toLocaleLowerCase("fr");

        const match = EVENT_TYPES.find((item) => {
          const frTitle = String(item.title.fr || "")
            .trim()
            .toLocaleLowerCase("fr");
          return item.id === normalized || frTitle === normalized;
        });

        if (!match) {
          throw new Error("event_type_not_found");
        }

        setSelectedType(match.id);
      } catch (error) {
        console.error("[event lookup]", error);
        if (!cancelled) {
          setExistingError(
            t(
              "bookEvent.existingNotFound",
              lang === "fr"
                ? "Nous n'avons pas retrouvé cette demande d'événement."
                : "We couldn't find this event request.",
            ),
          );
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    };

    void loadExistingEvent();

    return () => {
      cancelled = true;
    };
  }, [referenceParam, emailParam, lang, t]);

  const selectedEvent = EVENT_TYPES.find(
    (eventType) => eventType.id === selectedType,
  );

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: CREAM }}
    >
      <Header />

      <main className="flex-1 pt-[86px]">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <button
              type="button"
              onClick={() =>
                selectedType ? setSelectedType(null) : navigate(-1)
              }
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-x-1"
              style={{
                color: GREEN,
                background: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(31,107,45,0.12)",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              {selectedType
                ? t("bookEvent.changeType", "Changer de formule")
                : t("bookEvent.back", "Retour")}
            </button>

            <div className="grid grid-cols-[0.8fr_1.2fr] overflow-hidden rounded-[28px] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[36px]">
              {" "}
              <div className="bookevent-hero group relative min-h-[520px] overflow-hidden lg:min-h-[520px]">
                <img
                  src="/images/mezzePartage.jpeg"
                  alt={t(
                    "bookEvent.heroImageAlt",
                    "Événement privé autour d'une table libanaise",
                  )}
                  className="bookevent-hero-image absolute inset-0 h-full w-full object-cover"
                />

                <div
                  className="bookevent-overlay absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(20,30,16,0.08), rgba(16,55,25,0.82))",
                  }}
                />

                <div className="bookevent-light-sweep absolute inset-0 pointer-events-none" />

                {/* DESKTOP CONTENT — unchanged */}
                <div className="bookevent-hero-content absolute inset-x-0 bottom-0 hidden p-7 text-white lg:block lg:p-9">
                  <div className="bookevent-badge mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("bookEvent.privateBadge", "Événements sur mesure")}
                  </div>

                  <h1 className="bookevent-title font-playfair text-4xl leading-tight md:text-6xl">
                    {t("bookEvent.title", "Organiser un événement")}
                  </h1>

                  <p className="bookevent-subtitle mt-4 max-w-lg text-sm leading-7 text-white/85 md:text-base">
                    {t(
                      "bookEvent.heroText",
                      "Anniversaire, repas de groupe ou événement professionnel : imaginons ensemble une réception qui vous ressemble.",
                    )}
                  </p>
                </div>

                {/* ⭐ NEW — MOBILE ONLY */}
                <div className="absolute inset-x-0 bottom-0 z-10 lg:hidden">
                  <div className="bg-gradient-to-t from-[#123f1d]/90 via-[#123f1d]/45 to-transparent px-3 pb-6 pt-20">
                    <Sparkles className="mb-2 h-4 w-4 text-[#e5c77e]" />

                    <p className="font-playfair text-[18px] leading-tight text-white">
                      {t("bookEvent.mobileImageTitle", "Tailor-made events")}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="bookevent-panel relative p-3 lg:p-11"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,242,227,0.98))",
                }}
              >
                <div
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(197,154,40,0.17), transparent 70%)",
                  }}
                />

                <div className="relative z-10">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.22em]"
                    style={{ color: GOLD }}
                  >
                    {selectedType
                      ? t("bookEvent.stepTwo", "Étape 2 · Votre demande")
                      : t("bookEvent.stepOne", "Étape 1 · Votre événement")}
                  </p>

                  <h2
                    className="mt-3 font-playfair text-3xl md:text-4xl"
                    style={{ color: DARK_GREEN }}
                  >
                    {selectedType
                      ? selectedEvent?.title[lang]
                      : t(
                          "bookEvent.chooseTitle",
                          "Quelle occasion préparez-vous ?",
                        )}
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-500">
                    {selectedType
                      ? t(
                          "bookEvent.subtitleForm",
                          lang === "fr"
                            ? "Partagez-nous vos envies. Notre équipe vous recontactera rapidement avec une proposition adaptée."
                            : "Tell us what you have in mind. Our team will get back to you shortly with a tailored proposal.",
                        )
                      : t(
                          "bookEvent.subtitle",
                          lang === "fr"
                            ? "Choisissez une formule pour afficher le formulaire le plus adapté à votre projet."
                            : "Choose a format to open the form best suited to your event.",
                        )}
                  </p>

                  {loadingExisting && (
                    <div
                      className="mt-7 flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold"
                      style={{
                        color: DARK_GREEN,
                        background: "rgba(31,107,45,0.055)",
                        border: "1px solid rgba(31,107,45,0.10)",
                      }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t(
                        "bookEvent.loadingExisting",
                        lang === "fr"
                          ? "Chargement de votre événement..."
                          : "Loading your event...",
                      )}
                    </div>
                  )}

                  {existingError && !loadingExisting && (
                    <div
                      className="mt-7 rounded-2xl px-4 py-4 text-sm"
                      style={{
                        color: "#a23b32",
                        background: "rgba(224,92,92,0.07)",
                        border: "1px solid rgba(224,92,92,0.18)",
                      }}
                    >
                      {existingError}
                    </div>
                  )}

                  {!selectedType && !loadingExisting && (
                    <div className="mt-7 grid gap-3">
                      {EVENT_TYPES.map((eventType, index) => (
                        <button
                          key={eventType.id}
                          type="button"
                          onClick={() => setSelectedType(eventType.id)}
                          className="bookevent-type-card group relative flex items-center gap-2 overflow-hidden rounded-[16px] border p-2.5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lg lg:gap-4 lg:rounded-[22px] lg:p-4"
                          style={
                            {
                              background:
                                index % 2 === 0
                                  ? "rgba(31,107,45,0.045)"
                                  : "rgba(197,154,40,0.055)",
                              borderColor:
                                index % 2 === 0
                                  ? "rgba(31,107,45,0.13)"
                                  : "rgba(197,154,40,0.18)",
                              animationDelay: `${0.45 + index * 0.13}s`,
                              zIndex: EVENT_TYPES.length - index,
                            } as React.CSSProperties
                          }
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg lg:h-14 lg:w-14 lg:rounded-2xl lg:text-2xl"
                            style={{
                              background:
                                index % 2 === 0
                                  ? "rgba(31,107,45,0.11)"
                                  : "rgba(197,154,40,0.13)",
                            }}
                            aria-hidden="true"
                          >
                            {eventType.emoji}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className="block text-[12px] font-semibold leading-tight lg:text-base"
                              style={{ color: DARK_GREEN }}
                            >
                              {eventType.title[lang]}
                            </span>
                            <span className="mt-1 hidden text-sm leading-6 text-neutral-500 lg:block">
                              {eventType.subtitle[lang]}
                            </span>
                          </span>

                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition group-hover:translate-x-1 lg:h-9 lg:w-9"
                            style={{
                              color: index % 2 === 0 ? GREEN : GOLD,
                              background: "rgba(255,255,255,0.75)",
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedType && (
                    <div className="mt-7">
                      <div
                        className="mb-6 flex flex-wrap gap-3 rounded-2xl p-4"
                        style={{
                          background: "rgba(31,107,45,0.055)",
                          border: "1px solid rgba(31,107,45,0.10)",
                        }}
                      >
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600">
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: GREEN }}
                          />
                          {t("bookEvent.tailoredMenu", "Menu adapté")}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600">
                          <UsersRound
                            className="h-4 w-4"
                            style={{ color: GOLD }}
                          />
                          {t("bookEvent.groupSupport", "Accompagnement groupe")}
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600">
                          <CalendarHeart
                            className="h-4 w-4"
                            style={{ color: GREEN }}
                          />
                          {t(
                            "bookEvent.customPlanning",
                            "Organisation personnalisée",
                          )}
                        </span>
                      </div>

                      <EventForm
                        eventTypeId={selectedType}
                        onBack={() => setSelectedType(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="pb-20 pt-2">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                {
                  icon: "✦",
                  title: t(
                    "bookEvent.benefitOneTitle",
                    "Une proposition sur mesure",
                  ),
                  text: t(
                    "bookEvent.benefitOneText",
                    "Nous adaptons la formule, le menu et le rythme à votre événement.",
                  ),
                },
                {
                  icon: "❋",
                  title: t(
                    "bookEvent.benefitTwoTitle",
                    "Une cuisine généreuse",
                  ),
                  text: t(
                    "bookEvent.benefitTwoText",
                    "Mezzés, grillades et desserts libanais à partager.",
                  ),
                },
                {
                  icon: "♡",
                  title: t(
                    "bookEvent.benefitThreeTitle",
                    "Un accompagnement humain",
                  ),
                  text: t(
                    "bookEvent.benefitThreeText",
                    "Une équipe disponible avant et pendant votre réception.",
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex min-h-[150px] flex-col items-center rounded-[20px] p-3 text-center sm:min-h-0 sm:rounded-3xl sm:p-6"
                  style={{
                    background: "rgba(255,255,255,0.70)",
                    border: "1px solid rgba(31,107,45,0.09)",
                  }}
                >
                  <div
                    className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm sm:h-11 sm:w-11 sm:text-lg"
                    style={{
                      color: GOLD,
                      background: "rgba(197,154,40,0.10)",
                    }}
                  >
                    {item.icon}
                  </div>

                  <h3
                    className="mt-3 font-playfair text-[14px] leading-tight sm:mt-4 sm:text-xl"
                    style={{ color: DARK_GREEN }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[10px] leading-[1.35] text-neutral-500 sm:text-sm sm:leading-6">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/33782737777"
              target="_blank"
              rel="noopener noreferrer"
              className="
    mx-auto mt-6 flex w-[calc(100%-2rem)] max-w-xl
    items-center justify-center gap-2 rounded-full
    px-4 py-3 text-[11px] font-semibold
    transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-lg
    sm:w-fit sm:gap-3 sm:px-7 sm:py-4 sm:text-sm
  "
              style={{
                color: "#6f490d",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(197,154,40,0.10))",
                border: "1px solid rgba(197,154,40,0.24)",
                boxShadow: "0 10px 28px rgba(81,58,20,0.08)",
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "rgba(31,107,45,0.10)",
                  color: GREEN,
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </span>

              <span className="min-w-0 truncate sm:whitespace-nowrap sm:overflow-visible">
                {t(
                  "bookEvent.preferWhatsApp",
                  lang === "fr"
                    ? "Contactez-nous sur WhatsApp"
                    : "Contact us on WhatsApp",
                )}
              </span>

              <span className="shrink-0" style={{ color: "#c59a28" }}>
                ·
              </span>

              <span
                className="shrink-0 whitespace-nowrap font-bold"
                style={{ color: "#8d5908" }}
              >
                +33 7 82 73 77 77
              </span>
            </a>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .bookevent-hero-image {
          transform: scale(1.035);
          transform-origin: center center;
          animation: bookeventKenBurns 20s ease-in-out infinite alternate;
          transition: transform 1.1s ease;
          will-change: transform;
        }

        .bookevent-hero:hover .bookevent-hero-image {
          animation-play-state: paused;
          transform: scale(1.12);
        }

        .bookevent-overlay {
          animation: bookeventOverlayBreath 8s ease-in-out infinite;
        }

        .bookevent-light-sweep {
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 38%,
            rgba(255,255,255,0.16) 49%,
            transparent 60%,
            transparent 100%
          );
          transform: translateX(-130%);
          animation: bookeventLightSweep 10s ease-in-out infinite;
        }

        .bookevent-badge {
          opacity: 0;
          animation:
            bookeventFadeUp 0.8s ease-out 0.15s forwards,
            bookeventFloat 4.5s ease-in-out 1.1s infinite;
        }

        .bookevent-title {
          opacity: 0;
          animation: bookeventFadeUp 0.9s ease-out 0.38s forwards;
        }

        .bookevent-subtitle {
          opacity: 0;
          animation: bookeventFadeUp 0.9s ease-out 0.66s forwards;
        }

        .bookevent-panel {
          opacity: 0;
          animation: bookeventPanelIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.16s forwards;
        }

        .bookevent-type-card {
          position: relative;
          opacity: 0;
          transform:
            translateY(-30px)
            translateX(14px)
            scale(0.955)
            rotate(-1deg);
          filter: blur(4px);
          animation:
            bookeventCardStackIn 0.72s
            cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease;
        }

        .bookevent-type-card:nth-child(even) {
          transform:
            translateY(-30px)
            translateX(-14px)
            scale(0.955)
            rotate(1deg);
        }

        .bookevent-type-card + .bookevent-type-card {
          margin-top: -2px;
        }

        .bookevent-type-card::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -45%;
          width: 30%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.34),
            transparent
          );
          transition: left 0.7s ease;
          pointer-events: none;
        }

        .bookevent-type-card:hover::after {
          left: 125%;
        }

        .bookevent-type-card:hover {
          transform: translateY(-5px) scale(1.012);
          box-shadow: 0 16px 32px rgba(31,60,30,0.12);
        }

        @keyframes bookeventKenBurns {
          0% {
            transform: scale(1.035) translate3d(0, 0, 0);
          }

          35% {
            transform: scale(1.075) translate3d(-8px, -5px, 0);
          }

          70% {
            transform: scale(1.105) translate3d(7px, 5px, 0);
          }

          100% {
            transform: scale(1.13) translate3d(-5px, 3px, 0);
          }
        }

        @keyframes bookeventOverlayBreath {
          0%, 100% {
            opacity: 0.92;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes bookeventLightSweep {
          0%, 18% {
            transform: translateX(-130%);
            opacity: 0;
          }

          28% {
            opacity: 0.8;
          }

          52% {
            transform: translateX(130%);
            opacity: 0;
          }

          100% {
            transform: translateX(130%);
            opacity: 0;
          }
        }

        @keyframes bookeventFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bookeventFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes bookeventPanelIn {
          from {
            opacity: 0;
            transform: translateX(26px) translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes bookeventCardStackIn {
          0% {
            opacity: 0;
            filter: blur(5px);
          }

          68% {
            opacity: 1;
            transform:
              translateY(5px)
              translateX(0)
              scale(1.012)
              rotate(0deg);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              translateX(0)
              scale(1)
              rotate(0deg);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bookevent-hero-image,
          .bookevent-overlay,
          .bookevent-light-sweep,
          .bookevent-badge,
          .bookevent-title,
          .bookevent-subtitle,
          .bookevent-panel,
          .bookevent-type-card {
            animation: none !important;
          }

          .bookevent-badge,
          .bookevent-title,
          .bookevent-subtitle,
          .bookevent-panel,
          .bookevent-type-card {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookEvent;
