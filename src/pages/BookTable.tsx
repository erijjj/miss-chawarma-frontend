import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlanDeSalle from "@/components/PlanDeSalle";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";
const CREAM = "#f7f0e4";

const BookTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: CREAM }}
    >
      <Header />

      <div
        className="fixed top-0 left-0 right-0 z-40 h-2"
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("showHeader"))}
      />

      <main className="flex-1 pt-[86px]">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-x-1"
              style={{
                color: GREEN,
                background: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(31,107,45,0.12)",
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("bookTable.back", "Retour")}
            </button>

            <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              {/* Animated image card */}
              <div
                className="booktable-hero group relative min-h-[390px] overflow-hidden rounded-[34px] md:min-h-[520px]"
                style={{
                  boxShadow: "0 28px 70px rgba(31,60,30,0.16)",
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="/images/mezzePartage.jpeg"
                    alt={t(
                      "bookTable.heroImageAlt",
                      "Table libanaise généreuse chez Miss Chawarma",
                    )}
                    className="booktable-hero-image absolute inset-0 h-full w-full object-cover"
                  />
                </div>

                <div
                  className="booktable-overlay absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(10,20,10,0.02) 24%, rgba(12,40,18,0.83) 100%)",
                  }}
                />

                <div className="booktable-light-sweep absolute inset-0 pointer-events-none" />

                <div className="absolute left-5 right-5 top-5 flex flex-wrap gap-2">
                  <span className="booktable-badge-one rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#1f6b2d] backdrop-blur">
                    <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                    {t("bookTable.badge", "Cuisine libanaise maison")}
                  </span>

                  <span className="booktable-badge-two rounded-full bg-[#c59a28]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    Paris 11e
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                  <p className="booktable-fade-small mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    Miss Chawarma · Oberkampf
                  </p>

                  <h1 className="booktable-fade-title font-playfair text-4xl leading-tight md:text-6xl">
                    {t("bookTable.pageTitle", "Réserver une table")}
                  </h1>

                  <p className="booktable-fade-subtitle mt-4 max-w-xl text-sm leading-7 text-white/85 md:text-base">
                    {t(
                      "bookTable.pageSubtitle",
                      "Choisissez votre table directement sur le plan de la salle : le bar en terrazzo, le coin fleuri ou la terrasse. Confirmation immédiate.",
                    )}
                  </p>
                </div>
              </div>

              {/* Info card */}
              <div
                className="booktable-info-card flex flex-col justify-between rounded-[34px] p-6 md:p-8"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(248,242,229,0.96))",
                  border: "1px solid rgba(31,107,45,0.10)",
                  boxShadow: "0 22px 55px rgba(31,60,30,0.10)",
                }}
              >
                <div>
                  <div
                    className="booktable-calendar-icon mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      color: "white",
                      background: `linear-gradient(135deg, ${GREEN}, #3f934d)`,
                    }}
                  >
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <p
                    className="text-xs font-bold uppercase tracking-[0.22em]"
                    style={{ color: GOLD }}
                  >
                    {t("bookTable.quickInfo", "Avant votre venue")}
                  </p>

                  <h2
                    className="mt-3 font-playfair text-3xl"
                    style={{ color: DARK_GREEN }}
                  >
                    {t("bookTable.chooseMoment", "Choisissez votre moment")}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {t(
                      "bookTable.heroText",
                      "Déjeuner, dîner en famille ou soirée entre amis : réservez en quelques instants.",
                    )}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {" "}
                  <div className="booktable-mini-card rounded-2xl bg-white/75 p-4">
                    <Clock3 className="mb-3 h-5 w-5" style={{ color: GREEN }} />
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      {t("bookTable.hoursMonWed", "Lundi – Mercredi")}
                    </p>
                    <p className="mt-1 font-bold" style={{ color: DARK_GREEN }}>
                      11h30 – 00h00
                    </p>
                  </div>
                  <div className="booktable-mini-card rounded-2xl bg-white/75 p-4">
                    <Clock3 className="mb-3 h-5 w-5" style={{ color: GOLD }} />
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      {t("bookTable.hoursThuSun", "Jeudi – Dimanche")}
                    </p>
                    <p className="mt-1 font-bold" style={{ color: DARK_GREEN }}>
                      11h30 – 02h00
                    </p>
                  </div>
                  <div className="booktable-mini-card col-span-2 rounded-2xl bg-white/75 p-4">
                    {" "}
                    <MapPin className="mb-3 h-5 w-5" style={{ color: GREEN }} />
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      {t("bookTable.address", "Adresse")}
                    </p>
                    <a
                      href="https://maps.app.goo.gl/hKKRSBeCKJscSZY46"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block font-bold transition hover:underline"
                      style={{ color: DARK_GREEN }}
                    >
                      Miss Chawarma · 75011 Paris
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("booking-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="booktable-cta mt-8 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-bold text-white transition"
                  style={{
                    background: `linear-gradient(135deg, ${GREEN}, ${DARK_GREEN})`,
                    boxShadow: "0 14px 28px rgba(31,107,45,0.22)",
                  }}
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  {t("bookTable.startBooking", "Choisir ma table")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Plan de salle */}
        <section id="booking-form" className="pb-20 pt-6 md:pt-10">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em]"
                style={{ color: GOLD }}
              >
                {t("bookTable.formEyebrow", "Votre réservation")}
              </p>

              <h2
                className="mt-3 font-playfair text-3xl md:text-4xl"
                style={{ color: DARK_GREEN }}
              >
                {t("bookTable.formTitle", "On vous prépare une belle table")}
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
                {t(
                  "bookTable.formSubtitle",
                  "Le plan est celui de la salle. Une table réservée disparaît pour tout le monde, en direct.",
                )}
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-[32px] p-5 sm:p-8 md:p-10"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(31,107,45,0.10)",
                boxShadow: "0 24px 60px rgba(31,60,30,0.10)",
              }}
            >
              <div
                className="absolute -right-20 -top-20 h-56 w-56 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(197,154,40,0.16), transparent 70%)",
                }}
              />

              <div className="relative z-10">
                <PlanDeSalle />
              </div>
            </div>

            <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2">
              <a
                href="tel:+33142526048"
                className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  color: DARK_GREEN,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(31,107,45,0.10)",
                }}
              >
                <Phone className="h-4 w-4" style={{ color: GREEN }} />
                {t("bookTable.callRestaurant", "Restaurant")} · +33 1 42 52 60
                48
              </a>

              <button
                type="button"
                onClick={() => navigate("/book-event")}
                className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  color: "#7b4d08",
                  background: "rgba(197,154,40,0.10)",
                  border: "1px solid rgba(197,154,40,0.18)",
                }}
              >
                <Sparkles className="h-4 w-4" style={{ color: GOLD }} />
                {t("bookTable.organizeEvent", "Organiser un événement privé")}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .booktable-hero-image {
          transform: scale(1.03);
          transform-origin: center center;
          animation: booktableKenBurns 18s ease-in-out infinite alternate;
          transition: transform 1.2s ease;
          will-change: transform;
        }

        .booktable-hero:hover .booktable-hero-image {
          animation-play-state: paused;
          transform: scale(1.13);
        }

        .booktable-overlay {
          animation: booktableOverlayBreath 8s ease-in-out infinite;
        }

        .booktable-light-sweep {
          opacity: 0.8;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 38%,
            rgba(255,255,255,0.16) 49%,
            transparent 60%,
            transparent 100%
          );
          transform: translateX(-125%);
          animation: booktableLightSweep 9s ease-in-out infinite;
        }

        .booktable-badge-one {
          animation: booktableFloatOne 4s ease-in-out infinite;
        }

        .booktable-badge-two {
          animation: booktableFloatTwo 5s ease-in-out infinite;
        }

        .booktable-fade-small {
          opacity: 0;
          animation: booktableFadeUp 0.8s ease-out 0.15s forwards;
        }

        .booktable-fade-title {
          opacity: 0;
          animation: booktableFadeUp 0.9s ease-out 0.38s forwards;
        }

        .booktable-fade-subtitle {
          opacity: 0;
          animation: booktableFadeUp 0.9s ease-out 0.68s forwards;
        }

        .booktable-info-card {
          opacity: 0;
          animation: booktableCardIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.18s forwards;
        }

        .booktable-calendar-icon {
          animation: booktableIconFloat 4s ease-in-out infinite;
        }

        .booktable-mini-card {
          transition:
            transform 0.28s ease,
            box-shadow 0.28s ease,
            background 0.28s ease;
        }

        .booktable-mini-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.96);
          box-shadow: 0 12px 26px rgba(31,60,30,0.09);
        }

        .booktable-cta {
          position: relative;
          overflow: hidden;
        }

        .booktable-cta::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -40%;
          width: 32%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.28),
            transparent
          );
          animation: booktableButtonShine 4.8s ease-in-out infinite;
        }

        .booktable-cta:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 18px 34px rgba(31,107,45,0.30) !important;
        }

        @keyframes booktableKenBurns {
          0% {
            transform: scale(1.03) translate3d(0, 0, 0);
          }

          35% {
            transform: scale(1.075) translate3d(-8px, -5px, 0);
          }

          70% {
            transform: scale(1.10) translate3d(7px, 4px, 0);
          }

          100% {
            transform: scale(1.125) translate3d(-6px, 3px, 0);
          }
        }

        @keyframes booktableOverlayBreath {
          0%, 100% {
            opacity: 0.90;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes booktableLightSweep {
          0%, 18% {
            transform: translateX(-125%);
            opacity: 0;
          }

          28% {
            opacity: 0.75;
          }

          52% {
            transform: translateX(125%);
            opacity: 0;
          }

          100% {
            transform: translateX(125%);
            opacity: 0;
          }
        }

        @keyframes booktableFloatOne {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes booktableFloatTwo {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(4px);
          }
        }

        @keyframes booktableFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes booktableCardIn {
          from {
            opacity: 0;
            transform: translateX(24px) translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes booktableIconFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-5px) rotate(2deg);
          }
        }

        @keyframes booktableButtonShine {
          0%, 55% {
            left: -40%;
          }

          78%, 100% {
            left: 125%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .booktable-hero-image,
          .booktable-overlay,
          .booktable-light-sweep,
          .booktable-badge-one,
          .booktable-badge-two,
          .booktable-fade-small,
          .booktable-fade-title,
          .booktable-fade-subtitle,
          .booktable-info-card,
          .booktable-calendar-icon,
          .booktable-cta::before {
            animation: none !important;
          }

          .booktable-fade-small,
          .booktable-fade-title,
          .booktable-fade-subtitle,
          .booktable-info-card {
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookTable;
