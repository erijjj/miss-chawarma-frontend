import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChefHat,
  Quote,
  Sparkles,
  Leaf,
  Flame,
  BadgeCheck,
} from "lucide-react";

import Chef1 from "../assets/images/chef.jpeg";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#123f1d";
const GOLD = "#c47d0e";
const SOFT_GOLD = "#e5c77e";
const CREAM = "#f7f0e4";

const Chefs = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: Leaf,
      title: t("chefs.value1Title", "Héritage familial"),
      text: t(
        "chefs.value1Text",
        "Des recettes transmises, respectées et préparées avec patience.",
      ),
    },
    {
      icon: BadgeCheck,
      title: t("chefs.value2Title", "Produits sélectionnés"),
      text: t(
        "chefs.value2Text",
        "Des ingrédients choisis pour leur fraîcheur et leur caractère.",
      ),
    },
    {
      icon: Flame,
      title: t("chefs.value3Title", "Cuisine généreuse"),
      text: t(
        "chefs.value3Text",
        "Des assiettes pensées pour être partagées, vécues et racontées.",
      ),
    },
  ];

  const specialties = [
    t("chefs.specialty1"),
    t("chefs.specialty2"),
    t("chefs.specialty3"),
  ];

  const chefNameWords = ["C",".","M"];

  return (
    <section
      ref={sectionRef}
      id="chefs"
      className={`chef-signature-section relative overflow-hidden py-10 md:py-12 ${
        isVisible ? "chef-is-visible" : ""
      }`}
      style={{ background: CREAM }}
    >
      {/* Background ornaments */}
      <div className="chef-orbit chef-orbit-left" />
      <div className="chef-orbit chef-orbit-right" />

      <div className="container-width relative">
        {/* Heading */}
        <div className="chef-heading mx-auto mb-5 max-w-3xl text-center md:mb-6">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            {t("chefs.eyebrow", "La signature de la maison")}
          </p>

          <h2
            className="mt-2 font-playfair text-3xl font-bold md:text-4xl lg:text-5xl"
            style={{ color: DARK_GREEN }}
          >
            {t("chefs.title1")}{" "}
            <span style={{ color: GOLD }}>{t("chefs.title2")}</span>
          </h2>
        </div>

        {/* Main editorial composition */}
        <div
          className="chef-editorial-card relative mx-auto grid w-full max-w-[1080px] overflow-hidden rounded-[32px] lg:h-[535px] lg:grid-cols-[0.84fr_1.16fr]"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(250,244,232,0.98))",
            border: "1px solid rgba(31,107,45,0.10)",
            boxShadow: "0 35px 90px rgba(31,60,30,0.13)",
          }}
        >
          {/* Photo side */}
          <div className="chef-photo-stage relative min-h-[400px] overflow-hidden lg:h-full lg:min-h-0">
            <img
              src={Chef1}
              alt={`C. M.  - ${t("chefs.chefTitle")}`}
              className="chef-main-photo absolute inset-0 h-full w-full object-cover object-center"
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(12,24,14,0.03) 35%, rgba(11,43,18,0.78) 100%)",
              }}
            />

            <div className="chef-light-sweep absolute inset-0 pointer-events-none" />

            {/* Seal */}
            <div className="chef-seal absolute left-4 top-4 flex h-20 w-20 flex-col items-center justify-center rounded-full text-center">
              <ChefHat className="h-5 w-5" />

              <span className="mt-1 text-[8px] uppercase tracking-[0.15em]">
                Miss Chawarma
              </span>
            </div>

            {/* Specialties */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="mb-2 flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="chef-specialty-chip rounded-full px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
                    style={{
                      animationDelay: `${0.25 + index * 0.12}s`,
                      background:
                        index % 2 === 0
                          ? "rgba(31,107,45,0.88)"
                          : "rgba(196,125,14,0.88)",
                    }}
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {t("chefs.authenticCuisine", "Cuisine libanaise authentique")}
              </div>
            </div>
          </div>

          {/* Story side */}
          <div className="relative flex min-h-0 flex-col justify-center overflow-hidden p-5 sm:p-7 lg:p-8 xl:p-9">
            <Quote
              className="absolute right-8 top-8 h-20 w-20 opacity-[0.07]"
              style={{ color: GREEN }}
            />

            <p
              className="text-xs font-bold uppercase tracking-[0.26em]"
              style={{ color: GOLD }}
            >
              {t("chefs.chefTitle")}
            </p>

            <div
              className="chef-name-write-wrap mt-2"
              aria-label="C. M."
            >
              <h3
                className="chef-handwritten-name text-5xl leading-[1] sm:text-6xl lg:text-[4.2rem]"
                style={{ color: DARK_GREEN }}
              >
                {chefNameWords.map((word, wordIndex) => {
                  const previousLetters = chefNameWords
                    .slice(0, wordIndex)
                    .reduce((total, item) => total + item.length, 0);

                  return (
                    <span
                      key={word}
                      className="chef-name-word"
                      aria-hidden="true"
                    >
                      {word.split("").map((letter, letterIndex) => {
                        const globalIndex =
                          previousLetters + wordIndex + letterIndex;

                        return (
                          <span
                            key={`${word}-${letterIndex}`}
                            className="chef-name-letter"
                            style={
                              {
                                "--letter-delay": `${0.72 + globalIndex * 0.075}s`,
                                "--letter-rotate":
                                  globalIndex % 2 === 0 ? "-3deg" : "2deg",
                              } as React.CSSProperties
                            }
                          >
                            {letter}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </h3>

              <span className="chef-writing-pen" aria-hidden="true">
                ✦
              </span>
            </div>

            <div className="chef-signature-line mt-3" />

            <p
              className="mt-4 max-w-2xl font-playfair text-[1.25rem] leading-[1.4] md:text-[1.45rem]"
              style={{ color: DARK_GREEN }}
            >
              “
              {t(
                "chefs.quote",
                "Chaque plat doit raconter un souvenir, réunir les convives et transmettre un peu du Liban.",
              )}
              ”
            </p>

            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-neutral-600">
              {t("chefs.bio")}
            </p>

            {/* Values */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-2.5">
              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="chef-value-card group flex min-w-0 flex-col items-start gap-1.5 rounded-[14px] p-2 sm:gap-2 sm:rounded-[16px] sm:p-3"
                    style={{
                      animationDelay: `${0.45 + index * 0.12}s`,
                      background:
                        index === 1
                          ? "rgba(196,125,14,0.055)"
                          : "rgba(31,107,45,0.045)",
                      border:
                        index === 1
                          ? "1px solid rgba(196,125,14,0.14)"
                          : "1px solid rgba(31,107,45,0.10)",
                    }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                      style={{
                        color: index === 1 ? GOLD : GREEN,
                        background:
                          index === 1
                            ? "rgba(196,125,14,0.11)"
                            : "rgba(31,107,45,0.10)",
                      }}
                    >
                      <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </span>

                    <span>
                      <span
                        className="block text-[11px] font-semibold leading-tight sm:text-[13px]"
                        style={{ color: DARK_GREEN }}
                      >
                        {value.title}
                      </span>
                      <span className="mt-1 block text-[9px] leading-[1.3] text-neutral-500 sm:text-[11px] sm:leading-4">
                        {value.text}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Final autograph */}
            <div className="mt-4 flex items-center gap-4">
              <span
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(196,125,14,0.60), transparent)",
                }}
              />
              <span className="chef-autograph text-3xl" style={{ color: GOLD }}>
                M.
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Allura&family=Cormorant+Garamond:ital,wght@0,600;1,600&display=swap");

        .chef-signature-section {
          isolation: isolate;
        }

        .chef-orbit {
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
          z-index: -1;
        }

        .chef-orbit-left {
          width: 320px;
          height: 320px;
          left: -120px;
          top: 90px;
          background:
            radial-gradient(circle, rgba(31,107,45,0.11), transparent 70%);
          animation: chefOrbitFloat 10s ease-in-out infinite;
        }

        .chef-orbit-right {
          width: 360px;
          height: 360px;
          right: -140px;
          bottom: 20px;
          background:
            radial-gradient(circle, rgba(196,125,14,0.12), transparent 70%);
          animation: chefOrbitFloat 12s ease-in-out infinite reverse;
        }

        .chef-heading {
          opacity: 0;
          transform: translateY(24px);
        }

        .chef-editorial-card {
          opacity: 0;
          transform: translateY(44px) scale(0.975);
        }

        .chef-photo-stage {
          background: #e8dfcf;
        }

        .chef-main-photo {
          opacity: 0;
          clip-path: inset(0 100% 0 0 round 0);
          transform: scale(1.09) translate3d(-18px, 0, 0);
          transform-origin: center;
          will-change: transform, clip-path, opacity;
          transition: transform 1.1s ease;
        }

        .chef-photo-stage:hover .chef-main-photo {
          animation-play-state: paused;
          transform: scale(1.035);
        }

        .chef-light-sweep {
          opacity: 0;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 38%,
            rgba(255,255,255,0.18) 50%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-130%);
        }

        .chef-seal {
          opacity: 0;
          transform: translateY(-14px) rotate(-8deg) scale(0.86);
          color: #fff8d8;
          background:
            radial-gradient(circle at 35% 30%, #2f8740, ${GREEN} 68%, ${DARK_GREEN});
          border: 1px solid rgba(255,255,255,0.38);
          box-shadow:
            0 12px 28px rgba(13,52,22,0.28),
            inset 0 0 0 4px rgba(255,255,255,0.08);
        }

        .chef-handwritten-name,
        .chef-autograph {
          font-family:
            "Allura",
            "Segoe Script",
            "Brush Script MT",
            cursive;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .chef-name-write-wrap {
          position: relative;
          width: fit-content;
          max-width: 100%;
        }

        .chef-handwritten-name {
          display: flex;
          flex-wrap: wrap;
          column-gap: 0.18em;
          row-gap: 0;
          white-space: normal;
        }

        .chef-name-word {
          display: inline-flex;
          white-space: nowrap;
        }

        .chef-name-letter {
          display: inline-block;
          opacity: 0;
          filter: blur(5px);
          transform:
            translateY(14px)
            rotate(var(--letter-rotate))
            scale(0.82);
          transform-origin: 50% 85%;
        }

        .chef-writing-pen {
          position: absolute;
          left: -8px;
          bottom: 8%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          opacity: 0;
          color: ${GOLD};
          font-size: 13px;
          background: rgba(255,248,216,0.95);
          box-shadow:
            0 0 0 5px rgba(196,125,14,0.10),
            0 5px 14px rgba(92,55,5,0.22);
          pointer-events: none;
        }

        .chef-signature-line {
          width: 0;
          height: 3px;
          border-radius: 999px;
          background:
            linear-gradient(90deg, ${GOLD}, ${SOFT_GOLD}, transparent);
        }

        .chef-value-card,
        .chef-specialty-chip {
          opacity: 0;
          transform: translateY(18px);
        }

        .chef-value-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            background 0.3s ease;
        }

        .chef-value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 28px rgba(31,60,30,0.08);
        }

        .chef-autograph {
          opacity: 0;
          transform: translateX(18px);
        }

        .chef-is-visible .chef-heading {
          animation: chefHeadingReveal 0.75s ease-out 0.05s forwards;
        }

        .chef-is-visible .chef-editorial-card {
          animation:
            chefEditorialReveal 0.95s
            cubic-bezier(0.16,1,0.3,1)
            0.18s forwards;
        }

        .chef-is-visible .chef-main-photo {
          animation:
            chefPhotoReveal 1.25s cubic-bezier(0.16,1,0.3,1) 0.35s forwards,
            chefPhotoCinema 18s ease-in-out 1.65s infinite alternate;
        }

        .chef-is-visible .chef-light-sweep {
          animation: chefLightSweep 10s ease-in-out 1.3s infinite;
        }

        .chef-is-visible .chef-seal {
          animation:
            chefSealIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.9s forwards,
            chefSealFloat 5s ease-in-out 1.7s infinite;
        }

        .chef-is-visible .chef-name-letter {
          animation:
            chefLetterWrite 0.52s
            cubic-bezier(0.16,1,0.3,1)
            var(--letter-delay)
            forwards;
        }

        .chef-is-visible .chef-writing-pen {
          animation: chefPenDance 2.25s ease-in-out 0.68s forwards;
        }

        .chef-is-visible .chef-signature-line {
          animation: chefDrawLine 1.05s ease-out 2.85s forwards;
        }

        .chef-is-visible .chef-value-card,
        .chef-is-visible .chef-specialty-chip {
          animation:
            chefStaggerIn 0.7s
            cubic-bezier(0.16,1,0.3,1)
            forwards;
        }

        .chef-is-visible .chef-autograph {
          animation: chefAutographIn 0.8s ease-out 3.15s forwards;
        }

        @keyframes chefHeadingReveal {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chefEditorialReveal {
          from {
            opacity: 0;
            transform: translateY(44px) scale(0.975);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chefPhotoReveal {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0 round 0);
            transform: scale(1.09) translate3d(-18px, 0, 0);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0 round 0);
            transform: scale(1.005) translate3d(0, 0, 0);
          }
        }

        @keyframes chefPhotoCinema {
          0% {
            transform: scale(1.005) translate3d(0,0,0);
          }
          45% {
            transform: scale(1.02) translate3d(-3px,-2px,0);
          }
          100% {
            transform: scale(1.03) translate3d(2px,1px,0);
          }
        }

        @keyframes chefLetterWrite {
          0% {
            opacity: 0;
            filter: blur(5px);
            transform:
              translateY(14px)
              rotate(var(--letter-rotate))
              scale(0.82);
          }

          68% {
            opacity: 1;
            filter: blur(0);
            transform:
              translateY(-2px)
              rotate(0deg)
              scale(1.04);
          }

          100% {
            opacity: 1;
            filter: blur(0);
            transform:
              translateY(0)
              rotate(0deg)
              scale(1);
          }
        }

        @keyframes chefPenDance {
          0% {
            left: -8px;
            bottom: 8%;
            opacity: 0;
            transform: rotate(-18deg) scale(0.8);
          }

          6% {
            opacity: 1;
          }

          28% {
            left: 27%;
            bottom: 22%;
            transform: rotate(5deg) scale(1);
          }

          52% {
            left: 51%;
            bottom: 10%;
            transform: rotate(-7deg) scale(0.96);
          }

          76% {
            left: 77%;
            bottom: 20%;
            transform: rotate(6deg) scale(1);
          }

          94% {
            opacity: 1;
          }

          100% {
            left: calc(100% - 4px);
            bottom: 8%;
            opacity: 0;
            transform: rotate(18deg) scale(0.8);
          }
        }

        @keyframes chefLightSweep {
          0%, 20% {
            transform: translateX(-130%);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          55% {
            transform: translateX(130%);
            opacity: 0;
          }
          100% {
            transform: translateX(130%);
            opacity: 0;
          }
        }

        @keyframes chefDrawLine {
          from {
            width: 0;
          }
          to {
            width: 190px;
          }
        }

        @keyframes chefStaggerIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chefSealIn {
          from {
            opacity: 0;
            transform: translateY(-14px) rotate(-8deg) scale(0.86);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(-3deg) scale(1);
          }
        }

        @keyframes chefSealFloat {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
        }

        @keyframes chefAutographIn {
          from {
            opacity: 0;
            transform: translateX(18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes chefOrbitFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-14px) scale(1.03);
          }
        }

        @media (min-width: 1024px) {
          .chef-photo-stage {
            min-height: 100%;
          }
        }

        @media (max-width: 1023px) {
          .chef-editorial-card {
            height: auto;
          }

          .chef-photo-stage {
            min-height: 420px;
          }
        }

        @media (max-width: 640px) {
          .chef-handwritten-name {
            font-size: 3.35rem;
          }

          .chef-seal {
            width: 72px;
            height: 72px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chef-editorial-card,
          .chef-main-photo,
          .chef-light-sweep,
          .chef-seal,
          .chef-value-card,
          .chef-specialty-chip,
          .chef-orbit-left,
          .chef-orbit-right,
          .chef-signature-line {
            animation: none !important;
          }

          .chef-editorial-card,
          .chef-value-card,
          .chef-specialty-chip {
            opacity: 1 !important;
          }

          .chef-signature-line {
            width: 190px !important;
          }

          .chef-heading,
          .chef-main-photo,
          .chef-seal,
          .chef-autograph {
            opacity: 1 !important;
            transform: none !important;
            clip-path: none !important;
          }

          .chef-name-letter {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }

          .chef-writing-pen {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Chefs;