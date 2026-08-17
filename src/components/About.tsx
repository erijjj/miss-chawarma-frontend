import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  Heart,
  Instagram,
  Leaf,
  MapPin,
  Quote,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import LogoMC from "/images/logoMissChawarma.png";
import OurStoryImg from "/images/ourStory.jpg";
import NotrePhylo from "/images/NOTrePHY.png";
import MurFleur from "/images/murFleur.png";
import table from "/images/photoT.png";
import tableR from "/images/photoR.png";

import insta1 from "/images/insta_pic.png";
import insta2 from "/images/insta_pic2.png";
import insta3 from "/images/hoummous.jpeg";

import tiktok1 from "/images/vid1.png";
import tiktok2 from "/images/vid2.png";
import tiktok3 from "/images/vid3.png";

const ELFSIGHT_WIDGET_ID = import.meta.env.VITE_ELFSIGHT_WIDGET_ID || "";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#123f1d";
const GOLD = "#c47d0e";
const CREAM = "#f7f0e4";

const About = () => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  const pageRef = useRef<HTMLDivElement | null>(null);
  const storyVisualRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [logoDropped, setLogoDropped] = useState(false);
  const [logoDragging, setLogoDragging] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const storyVisual = storyVisualRef.current;
    if (!storyVisual) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLogoDropped(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.38,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(storyVisual);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ELFSIGHT_WIDGET_ID) return;

    const existing = document.getElementById("elfsight-platform-script");

    if (existing) return;

    const script = document.createElement("script");
    script.id = "elfsight-platform-script";
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);

  const clampLogoPosition = (x: number, y: number) => {
    const storyVisual = storyVisualRef.current;
    const logo = logoRef.current;

    if (!storyVisual || !logo) {
      return { x, y };
    }

    const containerRect = storyVisual.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const padding = 10;

    const minX = -containerRect.width + logoRect.width + padding;
    const maxX = padding;
    const minY = -containerRect.height + logoRect.height + padding;
    const maxY = padding;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  const handleLogoPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (!logoDropped) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startX: logoPosition.x,
      startY: logoPosition.y,
    };

    setLogoDragging(true);
  };

  const handleLogoPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragStateRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const nextX = drag.startX + event.clientX - drag.startPointerX;
    const nextY = drag.startY + event.clientY - drag.startPointerY;

    setLogoPosition(clampLogoPosition(nextX, nextY));
  };

  const finishLogoDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = -1;
    setLogoDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resetLogoToCorner = () => {
    setLogoPosition({ x: 0, y: 0 });
  };

  const galleryImages = [
    {
      src: tableR,
      alt: t("about.galleryStory", "L'histoire de Miss Chawarma"),
    },
    {
      src: NotrePhylo,
      alt: t("about.galleryTeam", "L'équipe Miss Chawarma"),
    },
    {
      src: MurFleur,
      alt: t("about.galleryRestaurant", "Le restaurant"),
    },
    {
      src: table,
      alt: t("about.galleryDetails", "Les détails du restaurant"),
    },
  ];

  const values = [
    {
      icon: Heart,
      title: t("about.valueOneTitle", "Générosité"),
      text: t(
        "about.valueOneText",
        "Des assiettes faites pour être partagées et des souvenirs faits pour durer.",
      ),
    },
    {
      icon: Leaf,
      title: t("about.valueTwoTitle", "Authenticité"),
      text: t(
        "about.valueTwoText",
        "Des recettes inspirées du Liban, préparées avec sincérité et respect.",
      ),
    },
    {
      icon: UtensilsCrossed,
      title: t("about.valueThreeTitle", "Savoir-faire"),
      text: t(
        "about.valueThreeText",
        "Une cuisine maison, précise et généreuse, portée par une équipe passionnée.",
      ),
    },
  ];

  return (
    <div
      ref={pageRef}
      className={`about-page min-h-screen overflow-hidden ${
        isVisible ? "about-page-visible" : ""
      }`}
      style={{ background: CREAM }}
    >
      <Header />

      <main className="pt-[86px]">
        {/* HERO */}
        <section className="relative">
          <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="about-hero relative min-h-[640px] overflow-hidden rounded-[38px]">
              <img
                src={OurStoryImg}
                alt={t("about.heroAlt", "Miss Chawarma")}
                className="about-hero-image absolute inset-0 h-full w-full object-cover"
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,20,11,0.10) 10%, rgba(10,36,17,0.78) 100%)",
                }}
              />

              <div className="about-light-sweep absolute inset-0 pointer-events-none" />

              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-7 text-white sm:p-10 md:p-14 lg:p-16">
                  <div className="about-eyebrow mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    {t("about.eyebrow", "Une maison libanaise à Paris")}
                  </div>

                  <h1 className="about-title max-w-4xl font-playfair text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-[6.7rem]">
                    {t("about.title", "À propos de nous")}
                  </h1>

                  <p className="about-subtitle mt-6 max-w-2xl font-fraunces text-base leading-8 text-white/85 md:text-lg">
                    {t(
                      "about.heroText",
                      "Miss Chawarma est une histoire de cuisine, de transmission et de générosité, née de l'envie de faire découvrir un Liban authentique, chaleureux et vivant.",
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("about-story")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="about-scroll-button mt-8 inline-flex items-center gap-3 rounded-full bg-white/14 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {t("about.discover", "Découvrir notre histoire")}
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section id="about-story" className="py-16 md:py-24">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="about-story-copy">
                <p
                  className="text-xs font-bold uppercase tracking-[0.24em]"
                  style={{ color: GOLD }}
                >
                  {t("about.storyEyebrow", "Notre histoire")}
                </p>

                <h2
                  className="mt-3 font-playfair text-4xl leading-tight md:text-5xl"
                  style={{ color: DARK_GREEN }}
                >
                  {t(
                    "about.storyHeading",
                    "Une adresse née de la passion du Liban",
                  )}
                </h2>

                <p className="mt-6 font-fraunces text-base leading-8 text-neutral-600">
                  {t("about.storyText")}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div
                    className="rounded-3xl p-5"
                    style={{
                      background: "rgba(31,107,45,0.055)",
                      border: "1px solid rgba(31,107,45,0.10)",
                    }}
                  >
                    <p
                      className="font-Fraunces text-3xl font-bold"
                      style={{
                        color: GREEN,
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t("about.locationTitle", "Paris 11e")}
                    </p>
                    <p className="mt-2 font-fraunces text-sm leading-6 text-neutral-500">
                      {t(
                        "about.addressText",
                        "Une adresse conviviale au cœur de la rue Oberkampf.",
                      )}
                    </p>
                  </div>

                  <div
                    className="rounded-3xl p-5"
                    style={{
                      background: "rgba(196,125,14,0.065)",
                      border: "1px solid rgba(196,125,14,0.13)",
                    }}
                  >
                    <p
                      className="font-Fraunces text-3xl font-bold"
                      style={{
                        color: GOLD,
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t("about.houseTitle", "Maison")}
                    </p>
                    <p className="mt-2 font-fraunces text-sm leading-6 text-neutral-500">
                      {t(
                        "about.homemadeText",
                        "Des recettes cuisinées avec soin, fraîcheur et générosité.",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div ref={storyVisualRef} className="about-story-visual relative">
                <div
                  className="relative overflow-hidden rounded-[34px]"
                  style={{
                    boxShadow: "0 28px 65px rgba(31,60,30,0.14)",
                  }}
                >
                  <img
                    src={NotrePhylo}
                    alt={t("about.teamAlt", "L'équipe Miss Chawarma")}
                    className="h-[520px] w-full object-cover"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 48%, rgba(13,45,20,0.68))",
                    }}
                  />

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                      <MapPin className="h-4 w-4" />
                      {t("about.address", "128 Rue Oberkampf, Paris 11e")}
                    </div>
                  </div>
                </div>

                <button
                  ref={logoRef}
                  type="button"
                  onPointerDown={handleLogoPointerDown}
                  onPointerMove={handleLogoPointerMove}
                  onPointerUp={finishLogoDrag}
                  onPointerCancel={finishLogoDrag}
                  onDoubleClick={resetLogoToCorner}
                  aria-label={t(
                    "about.logoInteraction",
                    "Déplacer le logo Miss Chawarma",
                  )}
                  title={t(
                    "about.logoHint",
                    "Maintenez et déplacez le logo. Double-cliquez pour le remettre dans le coin.",
                  )}
                  className={`about-logo-seal absolute -bottom-10 right-6 flex h-28 w-28 items-center justify-center border-0 bg-transparent p-0 outline-none md:right-8 ${
                    logoDropped ? "about-logo-dropped" : ""
                  } ${logoDragging ? "about-logo-dragging" : ""}`}
                  style={
                    {
                      "--drag-x": `${logoPosition.x}px`,
                      "--drag-y": `${logoPosition.y}px`,
                    } as React.CSSProperties
                  }
                >
                  <span className="about-logo-glow" aria-hidden="true" />

                  <img
                    src={LogoMC}
                    alt={t("common.restaurantName", "Miss Chawarma")}
                    draggable={false}
                    className="about-logo-image select-none"
                  />

                  <span
                    className="about-logo-spark about-logo-spark-one"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <span
                    className="about-logo-spark about-logo-spark-two"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <span
                    className="about-logo-spark about-logo-spark-three"
                    aria-hidden="true"
                  >
                    ✧
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="py-16">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p
                className="text-xs font-bold uppercase tracking-[0.24em]"
                style={{ color: GOLD }}
              >
                {t("about.philosophyEyebrow", "Notre philosophie")}
              </p>

              <h2
                className="mt-3 font-playfair text-4xl md:text-5xl"
                style={{ color: DARK_GREEN }}
              >
                {t(
                  "about.philosophyHeading",
                  "Une cuisine sincère, généreuse et vivante",
                )}
              </h2>

              <p className="mx-auto mt-5 max-w-2xl font-fraunces text-base leading-8 text-neutral-600">
                {t("about.philosophyText")}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {values.map((value, index) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="about-value-card rounded-[28px] p-6"
                    style={{
                      background:
                        index === 1
                          ? "rgba(196,125,14,0.06)"
                          : "rgba(255,255,255,0.74)",
                      border:
                        index === 1
                          ? "1px solid rgba(196,125,14,0.15)"
                          : "1px solid rgba(31,107,45,0.10)",
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        color: index === 1 ? GOLD : GREEN,
                        background:
                          index === 1
                            ? "rgba(196,125,14,0.11)"
                            : "rgba(31,107,45,0.10)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3
                      className="mt-5 font-playfair text-2xl"
                      style={{ color: DARK_GREEN }}
                    >
                      {value.title}
                    </h3>

                    <p className="mt-3 font-fraunces text-sm leading-7 text-neutral-500">
                      {value.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ANIMATED GALLERY */}
        <section className="py-16">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.24em]"
                  style={{ color: GOLD }}
                >
                  {t("about.galleryEyebrow", "L'univers Miss Chawarma")}
                </p>

                <h2
                  className="mt-3 font-playfair text-4xl md:text-5xl"
                  style={{ color: DARK_GREEN }}
                >
                  {t(
                    "about.galleryTitle",
                    "Une maison qui se vit autant qu'elle se goûte",
                  )}
                </h2>
              </div>

              <p className="max-w-md font-fraunces text-sm leading-7 text-neutral-500">
                {t(
                  "about.galleryText",
                  "Des détails, des couleurs et une équipe qui font de chaque visite une expérience chaleureuse.",
                )}
              </p>
            </div>

            <div className="about-gallery-track overflow-hidden">
              <div className="about-gallery-marquee flex gap-5">
                {[...galleryImages, ...galleryImages].map((image, index) => (
                  <div
                    key={`${image.alt}-${index}`}
                    className="about-gallery-item relative h-[360px] min-w-[300px] overflow-hidden rounded-[28px] sm:min-w-[380px]"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 55%, rgba(10,37,17,0.55))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        {ELFSIGHT_WIDGET_ID && (
          <section className="py-16">
            <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <div className="mx-auto flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]">
                  <Star
                    className="h-4 w-4"
                    style={{ color: GOLD }}
                    fill={GOLD}
                  />
                  <span style={{ color: GOLD }}>
                    {t("about.reviewsEyebrow", "Ils parlent de nous")}
                  </span>
                </div>

                <h2
                  className="mt-4 font-playfair text-4xl md:text-5xl"
                  style={{ color: DARK_GREEN }}
                >
                  {t("about.reviewsTitle", "Ce que nos clients racontent")}
                </h2>
              </div>

              <div
                className="rounded-[34px] p-4 sm:p-6"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(31,107,45,0.10)",
                  boxShadow: "0 24px 60px rgba(31,60,30,0.08)",
                }}
              >
                <div
                  className={`elfsight-app-${ELFSIGHT_WIDGET_ID}`}
                  data-elfsight-app-lazy
                />
              </div>
            </div>
          </section>
        )}

        {/* SOCIAL CTA — compact, premium and animated */}
        <section className="pb-20 pt-8">
          <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
            <div
              className="about-social-card relative rounded-[30px] px-6 py-7 sm:px-8 md:px-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(31,107,45,0.98), rgba(18,63,29,0.99))",
                boxShadow: "0 24px 55px rgba(31,60,30,0.16)",
              }}
            >
              <div className="about-social-decor" aria-hidden="true">
                <div className="about-social-glow about-social-glow-one" />
                <div className="about-social-glow about-social-glow-two" />
                <span className="about-social-orbit about-social-orbit-one">
                  ✦
                </span>
                <span className="about-social-orbit about-social-orbit-two">
                  ●
                </span>
                <span className="about-social-orbit about-social-orbit-three">
                  ✧
                </span>
              </div>

              <div className="relative grid items-center gap-7 md:grid-cols-[1.15fr_0.85fr]">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 backdrop-blur">
                    <Sparkles className="h-3.5 w-4.5 text-[#e5c77e]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70 ">
                      {t("about.socialEyebrow", "Suivez l'aventure")}
                    </p>
                  </div>
                  <br />
                  <br />
                  <h2
                    className="mt-1 max-w-[1000px] font-playfair text-[1.5rem] leading-[1.02] text-white sm:text-[1.35rem] md:text-[1.7rem] "
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontWeight: 10,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t(
                      "about.socialHeading",
                      "Retrouvez les coulisses, les plats et l'ambiance Miss Chawarma",
                    )}
                  </h2>

                  <p className="mt-4 max-w-lg font-fraunces text-sm leading-6 text-white/65">
                    {t(
                      "about.socialText",
                      "Des instants gourmands, une équipe passionnée et toute l'énergie de la maison.",
                    )}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                  {/* Instagram — avec aperçu au survol (vrai logo en dégradé + carte) */}
                  <a
                    href="https://www.instagram.com/miss.chawarma/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-row about-social-row-insta group relative"
                    aria-label={t("about.instagram", "Instagram")}
                  >
                    <span className="about-social-icon about-social-icon-insta">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
                        <defs>
                          <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                            <stop offset="0%" stopColor="#fdf497" />
                            <stop offset="5%" stopColor="#fdf497" />
                            <stop offset="45%" stopColor="#fd5949" />
                            <stop offset="60%" stopColor="#d6249f" />
                            <stop offset="90%" stopColor="#285AEB" />
                          </radialGradient>
                        </defs>
                        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient)" />
                        <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.6" fill="none" stroke="white" strokeWidth="1.6" />
                        <circle cx="12" cy="12" r="3.4" fill="none" stroke="white" strokeWidth="1.6" />
                        <circle cx="16.4" cy="7.6" r="1.1" fill="white" />
                      </svg>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-white">
                        {t("about.instagram", "Instagram")}
                      </span>
                      <span className="block text-[10px] text-white/50">
                        @miss.chawarma
                      </span>
                    </span>

                    <span className="about-social-arrow">↗</span>

                    {/* Éventail de vraies photos, façon polaroids, qui se déploient au survol */}
                    <span className="about-insta-preview" aria-hidden="true">
                      <span className="about-insta-polaroid about-insta-polaroid-1">
                        <img src={insta1} alt="" />
                      </span>
                      <span className="about-insta-polaroid about-insta-polaroid-2">
                        <img src={insta2} alt="" />
                      </span>
                      <span className="about-insta-polaroid about-insta-polaroid-3">
                        <img src={insta3} alt="" />
                        <span className="about-insta-polaroid-badge">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                            <defs>
                              <radialGradient id="ig-gradient-badge" cx="30%" cy="107%" r="150%">
                                <stop offset="0%" stopColor="#fdf497" />
                                <stop offset="5%" stopColor="#fdf497" />
                                <stop offset="45%" stopColor="#fd5949" />
                                <stop offset="60%" stopColor="#d6249f" />
                                <stop offset="90%" stopColor="#285AEB" />
                              </radialGradient>
                            </defs>
                            <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient-badge)" />
                            <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.6" fill="none" stroke="white" strokeWidth="1.6" />
                            <circle cx="12" cy="12" r="3.4" fill="none" stroke="white" strokeWidth="1.6" />
                            <circle cx="16.4" cy="7.6" r="1.1" fill="white" />
                          </svg>
                        </span>
                      </span>
                      <span className="about-insta-preview-cta">
                        {t("about.instaPreviewCta", "Voir nos dernières publications")}
                      </span>
                    </span>
                  </a>

                  {/* TikTok — vraie identité de la marque : cyan / magenta / blanc sur fond noir */}
                  <a
                    href="https://www.tiktok.com/@miss.chawarma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-social-row about-social-row-tiktok group relative"
                    aria-label={t("about.tiktok", "TikTok")}
                  >
                    <span className="about-social-icon about-social-icon-tiktok">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden="true">
                        <path
                          transform="translate(0.55, -0.4)"
                          fill="#25F4EE"
                          d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                        />
                        <path
                          transform="translate(-0.55, 0.4)"
                          fill="#FE2C55"
                          d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                        />
                        <path
                          fill="#FFFFFF"
                          d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                        />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-white">
                        {t("about.tiktok", "TikTok")}
                      </span>
                      <span className="block text-[10px] text-white/50">
                        @miss.chawarma
                      </span>
                    </span>
                    <span className="about-social-arrow">↗</span>

                    {/* Même éventail de photos, avec le badge TikTok */}
                    <span className="about-insta-preview" aria-hidden="true">
                      <span className="about-insta-polaroid about-insta-polaroid-1">
                        <img src={tiktok1} alt="" />
                      </span>
                      <span className="about-insta-polaroid about-insta-polaroid-2">
                        <img src={tiktok2} alt="" />
                      </span>
                      <span className="about-insta-polaroid about-insta-polaroid-3">
                        <img src={tiktok3} alt="" />
                        <span className="about-insta-polaroid-badge about-insta-polaroid-badge-tiktok">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="white" aria-hidden="true">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                          </svg>
                        </span>
                      </span>
                      <span className="about-insta-preview-cta">
                        {t("about.tiktokPreviewCta", "Voir nos dernières vidéos")}
                      </span>
                    </span>
                  </a>

                  {WHATSAPP_NUMBER && (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        lang === "en"
                          ? "Hello Miss Chawarma!"
                          : "Bonjour Miss Chawarma !",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-row about-social-row-whatsapp group"
                      aria-label={t("about.whatsapp", "WhatsApp")}
                    >
                      <span className="about-social-icon about-social-icon-whatsapp">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-4.5 w-4.5"
                          fill="white"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.85.505 3.632 1.464 5.192L2.057 22l4.933-1.397A9.936 9.936 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.007a8.02 8.02 0 0 1-4.086-1.117l-.293-.174-3.036.86.86-3.037-.19-.31A8.006 8.006 0 1 1 20.008 12a8.014 8.014 0 0 1-8.007 8.007z" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-white">
                          {t("about.whatsapp", "WhatsApp")}
                        </span>
                        <span className="block text-[10px] text-white/50">
                          {t(
                            "about.whatsappSubtitle",
                            "Réserver ou nous écrire",
                          )}
                        </span>
                      </span>
                      <span className="about-social-arrow">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .about-page {
          isolation: isolate;
        }

        .about-hero {
          box-shadow: 0 32px 80px rgba(31,60,30,0.16);
        }

        .about-hero-image {
          transform: scale(1.03);
          animation: aboutHeroMove 18s ease-in-out infinite alternate;
          transition: transform 1s ease;
          will-change: transform;
        }

        .about-hero:hover .about-hero-image {
          animation-play-state: paused;
          transform: scale(1.08);
        }

        .about-light-sweep {
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 38%,
            rgba(255,255,255,0.18) 50%,
            transparent 62%,
            transparent 100%
          );
          transform: translateX(-130%);
          animation: aboutLightSweep 10s ease-in-out infinite;
        }

        .about-eyebrow,
        .about-title,
        .about-subtitle,
        .about-scroll-button {
          opacity: 0;
          transform: translateY(22px);
        }

        .about-page-visible .about-eyebrow {
          animation: aboutFadeUp 0.7s ease-out 0.15s forwards;
        }

        .about-page-visible .about-title {
          animation: aboutFadeUp 0.9s ease-out 0.35s forwards;
        }

        .about-page-visible .about-subtitle {
          animation: aboutFadeUp 0.9s ease-out 0.58s forwards;
        }

        .about-page-visible .about-scroll-button {
          animation: aboutFadeUp 0.9s ease-out 0.78s forwards;
        }

        .about-story-visual img {
          transition: transform 0.8s ease;
        }

        .about-story-visual:hover img {
          transform: scale(1.04);
        }

        .about-logo-seal {
          --drag-x: 0px;
          --drag-y: 0px;

          z-index: 20;
          opacity: 0;
          cursor: grab;
          touch-action: none;
          user-select: none;
          will-change: transform, opacity;
          transform:
            translate3d(
              var(--drag-x),
              calc(-780px + var(--drag-y)),
              0
            )
            rotate(-16deg)
            scale(0.78);
          filter: drop-shadow(0 18px 22px rgba(17,56,26,0.25));
        }

        .about-logo-dropped {
          animation:
            aboutLogoFallIntoCorner 1.45s
            cubic-bezier(0.18,0.82,0.24,1.14)
            forwards;
        }

        .about-logo-dropped:not(.about-logo-dragging) {
          transition:
            transform 0.18s ease-out,
            filter 0.25s ease;
        }

        .about-logo-dragging {
          cursor: grabbing;
          animation: none !important;
          opacity: 1;
          transform:
            translate3d(
              var(--drag-x),
              var(--drag-y),
              0
            )
            rotate(2deg)
            scale(1.08) !important;
          filter:
            drop-shadow(0 28px 30px rgba(17,56,26,0.34))
            drop-shadow(0 0 16px rgba(196,125,14,0.18));
          transition: none !important;
        }

        .about-logo-seal:hover:not(.about-logo-dragging) {
          transform:
            translate3d(
              var(--drag-x),
              calc(-5px + var(--drag-y)),
              0
            )
            rotate(-2deg)
            scale(1.06);
          filter:
            drop-shadow(0 24px 26px rgba(17,56,26,0.30))
            drop-shadow(0 0 14px rgba(196,125,14,0.18));
        }

        .about-logo-seal:focus-visible {
          border-radius: 999px;
          box-shadow:
            0 0 0 4px rgba(247,240,228,0.95),
            0 0 0 7px rgba(196,125,14,0.48);
        }

        .about-logo-image {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 999px;
          pointer-events: none;
          user-select: none;
          filter:
            drop-shadow(0 8px 10px rgba(18,63,29,0.20))
            saturate(1.05);
          transition:
            transform 0.25s ease,
            filter 0.25s ease;
        }

        .about-logo-seal:hover .about-logo-image {
          transform: scale(1.05);
          filter:
            drop-shadow(0 11px 14px rgba(18,63,29,0.25))
            saturate(1.15);
        }

        .about-logo-dragging .about-logo-image {
          transform: scale(1.04) rotate(-2deg);
        }

        .about-logo-glow {
          position: absolute;
          inset: 7px;
          z-index: 1;
          border-radius: 999px;
          background:
            radial-gradient(
              circle,
              rgba(229,199,126,0.28),
              rgba(31,107,45,0.10) 48%,
              transparent 72%
            );
          filter: blur(10px);
          opacity: 0.72;
          transform: scale(1.08);
          animation: aboutLogoGlow 3.4s ease-in-out infinite;
          pointer-events: none;
        }

        .about-logo-spark {
          position: absolute;
          z-index: 4;
          color: ${GOLD};
          opacity: 0;
          pointer-events: none;
          text-shadow: 0 3px 8px rgba(196,125,14,0.35);
        }

        .about-logo-spark-one {
          right: 0;
          top: 13px;
        }

        .about-logo-spark-two {
          left: 1px;
          top: 38px;
          font-size: 12px;
        }

        .about-logo-spark-three {
          bottom: 7px;
          right: 17px;
          font-size: 14px;
        }

        .about-logo-seal:hover .about-logo-spark,
        .about-logo-dragging .about-logo-spark {
          animation: aboutLogoSparkle 1.15s ease-in-out infinite;
        }

        .about-logo-seal:hover .about-logo-spark-two,
        .about-logo-dragging .about-logo-spark-two {
          animation-delay: 0.22s;
        }

        .about-logo-seal:hover .about-logo-spark-three,
        .about-logo-dragging .about-logo-spark-three {
          animation-delay: 0.44s;
        }

        .about-value-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .about-value-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 36px rgba(31,60,30,0.10);
        }

        .about-gallery-marquee {
          width: max-content;
          animation: aboutGalleryScroll 32s linear infinite;
        }

        .about-gallery-track:hover .about-gallery-marquee {
          animation-play-state: paused;
        }

        .about-gallery-item img {
          transition: transform 0.8s ease;
        }

        .about-gallery-item:hover img {
          transform: scale(1.07);
        }

        .about-social-card {
          isolation: isolate;
          border: 1px solid rgba(255,255,255,0.09);
        }

        .about-social-decor {
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: 30px;
          overflow: hidden;
          pointer-events: none;
        }

        .about-social-decor::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 0%, transparent 42%, rgba(255,255,255,0.045) 50%, transparent 58%, transparent 100%);
          transform: translateX(-130%);
          animation: aboutSocialSweep 8s ease-in-out infinite;
        }

        .about-social-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
        }

        .about-social-glow-one {
          width: 260px;
          height: 260px;
          right: -80px;
          top: -120px;
          background: radial-gradient(circle, rgba(229,199,126,0.17), transparent 70%);
        }

        .about-social-glow-two {
          width: 180px;
          height: 180px;
          left: 30%;
          bottom: -120px;
          background: radial-gradient(circle, rgba(255,255,255,0.07), transparent 72%);
        }

        .about-social-orbit {
          position: absolute;
          z-index: 1;
          color: rgba(229,199,126,0.52);
          pointer-events: none;
          animation: aboutSocialFloat 5s ease-in-out infinite;
        }

        .about-social-orbit-one { right: 46%; top: 18%; font-size: 13px; }
        .about-social-orbit-two { right: 6%; bottom: 17%; font-size: 7px; animation-delay: 0.8s; }
        .about-social-orbit-three { left: 4%; bottom: 15%; font-size: 11px; animation-delay: 1.5s; }

        .about-social-row {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 58px;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 18px;
          color: white;
          background: rgba(255,255,255,0.075);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .about-social-row:hover {
          transform: translateX(6px);
          background: rgba(255,255,255,0.13);
          border-color: rgba(229,199,126,0.35);
          box-shadow: 0 12px 28px rgba(6,30,12,0.16);
        }

        /* Instagram et TikTok : place à recevoir la carte d'aperçu, qui doit pouvoir dépasser du bloc */
        .about-social-row-insta,
        .about-social-row-tiktok {
          overflow: visible;
        }

        .about-insta-preview {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 26px);
          transform: translateX(-50%);
          width: 220px;
          height: 96px;
          pointer-events: none;
          z-index: 30;
        }

        .about-insta-polaroid {
          position: absolute;
          top: 0;
          left: 50%;
          width: 76px;
          height: 92px;
          padding: 5px 5px 14px;
          background: #fdfbf6;
          border-radius: 4px;
          box-shadow: 0 14px 30px rgba(0,0,0,0.30);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        .about-insta-polaroid img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 2px;
        }

        /* Position de repos : empilées, centrées, légèrement décalées */
        .about-insta-polaroid-1 { transform: translate(-50%, 6px) rotate(0deg) scale(0.9); z-index: 1; }
        .about-insta-polaroid-2 { transform: translate(-50%, 3px) rotate(0deg) scale(0.95); z-index: 2; }
        .about-insta-polaroid-3 { transform: translate(-50%, 0) rotate(0deg) scale(1); z-index: 3; }

        /* Déploiement en éventail au survol */
        .about-social-row-insta:hover .about-insta-polaroid-1,
        .about-social-row-insta:focus-visible .about-insta-polaroid-1,
        .about-social-row-tiktok:hover .about-insta-polaroid-1,
        .about-social-row-tiktok:focus-visible .about-insta-polaroid-1 {
          opacity: 1;
          transform: translate(calc(-50% - 58px), 10px) rotate(-11deg) scale(1);
        }
        .about-social-row-insta:hover .about-insta-polaroid-2,
        .about-social-row-insta:focus-visible .about-insta-polaroid-2,
        .about-social-row-tiktok:hover .about-insta-polaroid-2,
        .about-social-row-tiktok:focus-visible .about-insta-polaroid-2 {
          opacity: 1;
          transform: translate(-50%, -6px) rotate(2deg) scale(1.02);
        }
        .about-social-row-insta:hover .about-insta-polaroid-3,
        .about-social-row-insta:focus-visible .about-insta-polaroid-3,
        .about-social-row-tiktok:hover .about-insta-polaroid-3,
        .about-social-row-tiktok:focus-visible .about-insta-polaroid-3 {
          opacity: 1;
          transform: translate(calc(-50% + 58px), 10px) rotate(10deg) scale(1);
        }

        .about-insta-polaroid-badge-tiktok {
          background: #000;
          border-radius: 6px;
          padding: 3px;
        }

        .about-insta-polaroid-badge {
          position: absolute;
          bottom: -6px;
          right: -6px;
          display: flex;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
        }

        .about-insta-preview-cta {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 6px;
          width: max-content;
          max-width: 200px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(10,10,10,0.92);
          color: rgba(255,255,255,0.85);
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s ease 0.1s;
        }

        .about-social-row-insta:hover .about-insta-preview-cta,
        .about-social-row-insta:focus-visible .about-insta-preview-cta,
        .about-social-row-tiktok:hover .about-insta-preview-cta,
        .about-social-row-tiktok:focus-visible .about-insta-preview-cta {
          opacity: 1;
        }

        @media (hover: none), (pointer: coarse) {
          /* Vrais écrans tactiles sans survol réel : la carte n'y aurait aucune utilité.
             On ne se base plus sur la largeur de fenêtre, qui peut être étroite
             même sur un vrai bureau avec souris (fenêtre redimensionnée). */
          .about-insta-preview { display: none; }
        }

        .about-social-icon-tiktok {
          background: #000;
        }

        .about-social-icon-whatsapp {
          background: #25D366;
        }

        .about-social-row-whatsapp {
          background: rgba(37,211,102,0.12);
          border-color: rgba(37,211,102,0.23);
        }

        .about-social-row-whatsapp:hover {
          background: rgba(37,211,102,0.18);
          border-color: rgba(37,211,102,0.38);
        }

        .about-social-icon {
          display: flex;
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #fff;
          background: rgba(255,255,255,0.10);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .about-social-row:hover .about-social-icon {
          transform: rotate(-6deg) scale(1.08);
          background: rgba(255,255,255,0.17);
        }

        .about-social-row:hover .about-social-icon-tiktok {
          background: #000;
        }

        .about-social-row:hover .about-social-icon-whatsapp {
          background: #25D366;
        }

        .about-social-arrow {
          flex: 0 0 auto;
          color: rgba(255,255,255,0.52);
          font-size: 16px;
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .about-social-row:hover .about-social-arrow {
          transform: translate(3px, -3px);
          color: #e5c77e;
        }

        @keyframes aboutHeroMove {
          0% {
            transform: scale(1.03) translate3d(0,0,0);
          }
          50% {
            transform: scale(1.07) translate3d(-8px,-4px,0);
          }
          100% {
            transform: scale(1.10) translate3d(6px,3px,0);
          }
        }

        @keyframes aboutLightSweep {
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

        @keyframes aboutFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aboutLogoFallIntoCorner {
          0% {
            opacity: 0;
            transform:
              translate3d(
                var(--drag-x),
                calc(-780px + var(--drag-y)),
                0
              )
              rotate(-18deg)
              scale(0.72);
          }

          42% {
            opacity: 1;
            transform:
              translate3d(
                var(--drag-x),
                calc(24px + var(--drag-y)),
                0
              )
              rotate(8deg)
              scale(1.08);
          }

          60% {
            transform:
              translate3d(
                var(--drag-x),
                calc(-14px + var(--drag-y)),
                0
              )
              rotate(-5deg)
              scale(0.98);
          }

          74% {
            transform:
              translate3d(
                var(--drag-x),
                calc(8px + var(--drag-y)),
                0
              )
              rotate(3deg)
              scale(1.025);
          }

          87% {
            transform:
              translate3d(
                var(--drag-x),
                calc(-4px + var(--drag-y)),
                0
              )
              rotate(-1.5deg)
              scale(0.995);
          }

          100% {
            opacity: 1;
            transform:
              translate3d(
                var(--drag-x),
                var(--drag-y),
                0
              )
              rotate(0deg)
              scale(1);
          }
        }

        @keyframes aboutLogoGlow {
          0%, 100% {
            opacity: 0.42;
            transform: scale(0.96);
          }

          50% {
            opacity: 0.90;
            transform: scale(1.16);
          }
        }

        @keyframes aboutLogoSparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5) rotate(0deg);
          }

          40% {
            opacity: 1;
            transform: scale(1.15) rotate(90deg);
          }

          70% {
            opacity: 0.65;
            transform: scale(0.9) rotate(160deg);
          }
        }

        @keyframes aboutSocialSweep {
          0%, 20% { opacity: 0; transform: translateX(-130%); }
          35% { opacity: 1; }
          62% { opacity: 0; transform: translateX(130%); }
          100% { opacity: 0; transform: translateX(130%); }
        }

        @keyframes aboutSocialFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
          50% { transform: translateY(-7px) rotate(14deg); opacity: 0.75; }
        }

        @keyframes aboutGalleryScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 10px));
          }
        }

        @media (max-width: 640px) {
          .about-hero {
            min-height: 560px;
          }

          .about-title {
            font-size: 3.7rem;
          }

          .about-logo-seal {
            width: 92px;
            height: 92px;
            right: 12px;
            left: auto;
            bottom: -42px;
          }

          .about-logo-image {
            width: 82px;
            height: 82px;
          }

          .about-social-card { border-radius: 24px; }
          .about-social-row { min-height: 54px; }
          .about-social-orbit { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-hero-image,
          .about-light-sweep,
          .about-eyebrow,
          .about-title,
          .about-subtitle,
          .about-scroll-button,
          .about-logo-seal,
          .about-logo-glow,
          .about-logo-spark,
          .about-gallery-marquee,
          .about-social-card::after,
          .about-social-orbit {
            animation: none !important;
          }

          .about-logo-seal {
            opacity: 1 !important;
            transform:
              translate3d(
                var(--drag-x),
                var(--drag-y),
                0
              ) !important;
          }

          .about-eyebrow,
          .about-title,
          .about-subtitle,
          .about-scroll-button,
          .about-logo-seal {
            opacity: 1 !important;
            transform: none !important;
          }
        }
          .elfsight-app * {
    background: transparent !important;
}

.elfsight-app iframe{
    background: transparent !important;
}
      `}</style>
    </div>
  );
};

export default About;
