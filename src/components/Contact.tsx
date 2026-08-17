import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

const GREEN = "#1f6b2d";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Miss+Chawarma/@48.8662047,2.3775387,600m/data=!3m3!1e3!4b1!5s0x47e66defe8b207f3:0xe65f353a869ba6c3!4m6!3m5!1s0x47e66deb2cc93ce9:0xa7f2b63f667ad067!8m2!3d48.8662012!4d2.3801136!16s%2Fg%2F11z6z1n__z?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D";
const DARK_GREEN = "#123f1d";
const GOLD = "#c47d0e";
const CREAM = "#f7f0e4";

type Status = "idle" | "loading" | "success" | "error";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  const [fields, setFields] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const wordCount = useMemo(
    () => fields.message.trim().split(/\s+/).filter(Boolean).length,
    [fields.message],
  );

  const updateField = (field: "name" | "email" | "message", value: string) => {
    setStatus("idle");
    setFields((current) => ({ ...current, [field]: value }));

    if (field === "name") {
      setErrors((current) => ({
        ...current,
        name: /^[a-zA-ZÀ-ÿ\s'-]*$/.test(value) ? "" : t("contact.nameError"),
      }));
    }

    if (field === "message") {
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      setErrors((current) => ({
        ...current,
        message: words > 500 ? `${words}/500 ${t("contact.wordsMax")}` : "",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (errors.name || errors.message || wordCount > 500) return;

    setStatus("loading");

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          language: lang,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");

      fetch("https://formspree.io/f/mvzjdobn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
      }).catch(() => {});

      setFields({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const infoCards = [
    {
      icon: MapPin,
      title: t("contact.address"),
      text: "128 Rue Oberkampf, Paris 11e",
      action: lang === "fr" ? "Voir l’itinéraire" : "Get directions",
      href: GOOGLE_MAPS_URL,
      color: GREEN,
    },
    {
      icon: Clock3,
      title: t("contact.hours"),
      text:
        lang === "fr"
          ? "Lun–Mer 11h30–00h00 · Jeu–Dim 11h30–02h00"
          : "Mon–Wed 11:30–00:00 · Thu–Sun 11:30–02:00",
      action: t("contact.openDaily"),
      color: GOLD,
    },
    {
      icon: Phone,
      title: t("contact.phone"),
      text: "+33 1 42 52 60 48",
      action: lang === "fr" ? "Nous appeler" : "Call us",
      href: "tel:+33142526048",
      color: GREEN,
    },
    {
      icon: Mail,
      title: t("contact.email2"),
      text: "misschawarma@gmail.com",
      action: lang === "fr" ? "Nous écrire" : "Email us",
      href: "mailto:misschawarma@gmail.com",
      color: GOLD,
    },
  ];

  return (
    <section
      id="contact"
      className="contact-premium relative overflow-hidden px-4 py-16 md:px-8 md:py-20"
      style={{ background: CREAM }}
    >
      <div className="contact-glow contact-glow-left" />
      <div className="contact-glow contact-glow-right" />

      <div className="container-width relative mx-auto max-w-7xl">
        <header
          className="mx-auto mb-10 max-w-3xl text-center"
          data-aos="fade-up"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            {lang === "fr"
              ? "Un mot, une table, un événement"
              : "A message, a table, an event"}
          </p>

          <h2
            className="mt-3 font-playfair text-4xl font-bold md:text-5xl lg:text-6xl"
            style={{ color: DARK_GREEN }}
          >
            {t("contact.title1")}{" "}
            <span style={{ color: GOLD }}>{t("contact.title2")}</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
            {lang === "fr"
              ? "Une question, une réservation ou un événement à préparer ? Notre équipe vous répond avec plaisir."
              : "A question, a booking or an event to organise? Our team will be happy to help."}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div
            className="contact-visual relative min-h-[560px] overflow-hidden rounded-[32px]"
            data-aos="fade-right"
          >
            <img
              src="/images/contact.png"
              alt="Miss Chawarma"
              className="contact-visual-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/25 to-[#102c17]/90" />

            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <span className="contact-chip">
                <Sparkles className="h-4 w-4" />
                {lang === "fr"
                  ? "Maison libanaise à Paris"
                  : "Lebanese house in Paris"}
              </span>
              <span className="contact-chip contact-chip-gold">Paris 11e</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                Miss Chawarma · Oberkampf
              </p>

              <h3 className="mt-3 max-w-xl font-playfair text-4xl leading-tight text-white md:text-5xl">
                {lang === "fr" ? "Un mot pour nous ?" : "A word for us?"}
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/80">
                {lang === "fr"
                  ? "Une question, une envie, un petit mot après votre visite - on est toujours ravis de vous lire. Écrivez-nous, on vous répond vite."
                  : "A question, a craving, a little note after your visit - we are always happy to hear from you. Write to us, we will reply quickly."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:+33142526048"
                  className="contact-visual-action contact-visual-action-primary"
                >
                  <Phone className="h-4 w-4" />
                  +33 1 42 52 60 48
                </a>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-visual-action"
                >
                  <Navigation className="h-4 w-4" />
                  {lang === "fr" ? "Itinéraire" : "Directions"}
                </a>
              </div>
            </div>
          </div>

          <div
            className="contact-form-card rounded-[32px] p-5 sm:p-7 md:p-9"
            data-aos="fade-left"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-[0.22em]"
                  style={{ color: GOLD }}
                >
                  {lang === "fr"
                    ? "Nous vous répondons rapidement"
                    : "We reply quickly"}
                </p>
                <h3
                  className="mt-2 font-playfair text-3xl"
                  style={{ color: DARK_GREEN }}
                >
                  {t("contact.sendMessage")}
                </h3>
              </div>

              <span className="contact-form-icon">
                <MessageSquare className="h-5 w-5" />
              </span>
            </div>

            {status === "success" ? (
              <div className="contact-success">
                <span className="contact-success-icon">
                  <Check className="h-7 w-7" />
                </span>
                <h4
                  className="mt-5 font-playfair text-2xl"
                  style={{ color: DARK_GREEN }}
                >
                  {lang === "fr" ? "Message envoyé !" : "Message sent!"}
                </h4>
                <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
                  {t("contact.successMessage")}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-full px-5 py-3 text-sm font-semibold text-white"
                  style={{ background: GREEN }}
                >
                  {lang === "fr"
                    ? "Envoyer un autre message"
                    : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    <User className="h-4 w-4" />
                    {t("contact.fullName")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fields.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder={t("contact.namePlaceholder")}
                  />
                  {errors.name && (
                    <p className="contact-error">{errors.name}</p>
                  )}
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    <Mail className="h-4 w-4" />
                    {t("contact.email")}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={fields.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder={t("contact.emailPlaceholder")}
                  />
                </div>

                <div className="contact-field">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="contact-message">
                      <MessageSquare className="h-4 w-4" />
                      {t("contact.message")}
                    </label>
                    <span
                      className="text-xs"
                      style={{
                        color: wordCount > 500 ? "#b84242" : "#8a8a82",
                      }}
                    >
                      {wordCount}/500 {t("contact.wordsCount")}
                    </span>
                  </div>

                  <textarea
                    id="contact-message"
                    required
                    rows={6}
                    value={fields.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder={t("contact.messagePlaceholder")}
                  />

                  {errors.message && (
                    <p className="contact-error">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    status === "loading" ||
                    Boolean(errors.name) ||
                    Boolean(errors.message)
                  }
                  className="contact-submit"
                >
                  <span>
                    {status === "loading"
                      ? t("contact.sending")
                      : t("contact.send")}
                  </span>
                  <span className="contact-submit-icon">
                    <Send className="h-4 w-4" />
                  </span>
                </button>

                {status === "error" && (
                  <div className="contact-submit-error">
                    {t(
                      "contact.errorMessage",
                      lang === "fr"
                        ? "Une erreur est survenue. Réessayez dans quelques instants."
                        : "Something went wrong. Please try again in a moment.",
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {infoCards.map((item, index) => {
            const Icon = item.icon;
            const isGold = item.color === GOLD;
            const isHours = !item.href;

            const content = (
              <>
                <div
                  className={`contact-info-card-bg ${
                    isGold ? "contact-info-card-bg-gold" : "contact-info-card-bg-green"
                  }`}
                />

                <div className="contact-info-watermark" aria-hidden="true">
                  <Icon strokeWidth={1.35} />
                </div>

                <div className="contact-info-top">
                  <span
                    className="contact-info-icon"
                    style={{
                      color: "#fff8d8",
                      background: isGold
                        ? "linear-gradient(145deg, #b87405, #e5c77e)"
                        : "linear-gradient(145deg, #175a25, #3c9547)",
                      boxShadow: isGold
                        ? "0 14px 30px rgba(196,125,14,0.28)"
                        : "0 14px 30px rgba(31,107,45,0.25)",
                    }}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.15} />
                  </span>

                  <span className="contact-info-number" style={{ color: item.color }}>
                    0{index + 1}
                  </span>
                </div>

                <div className="relative z-[2] mt-5">
                  <p
                    className="text-[10px] font-extrabold uppercase tracking-[0.28em]"
                    style={{ color: item.color }}
                  >
                    {item.title}
                  </p>

                  <p className="contact-info-main mt-3" style={{ color: DARK_GREEN }}>
                    {item.text}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <span
                      className={`contact-info-action ${
                        isGold ? "contact-info-action-gold" : "contact-info-action-green"
                      }`}
                    >
                      {item.action}
                      {item.href && <ArrowUpRight className="h-4 w-4" />}
                    </span>

                    {isHours && (
                      <span className="contact-info-open-dot">
                        <span />
                        {lang === "fr" ? "Ouvert" : "Open"}
                      </span>
                    )}
                  </div>
                </div>
              </>
            );

            return item.href ? (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="contact-info-card"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                {content}
              </a>
            ) : (
              <div
                key={item.title}
                className="contact-info-card"
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                {content}
              </div>
            );
          })}
        </div>

        <div
          className="contact-map-shell relative mt-7 overflow-hidden rounded-[32px]"
          data-aos="fade-up"
        >
          <iframe
            title="Miss Chawarma sur Google Maps"
            src="https://maps.google.com/maps?q=128+Rue+Oberkampf+75011+Paris&t=&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            className="min-h-[430px] w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="contact-map-panel">
            <span className="contact-map-pin">
              <MapPin className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p
                className="font-playfair text-xl"
                style={{ color: DARK_GREEN }}
              >
                Miss Chawarma
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                128 Rue Oberkampf, 75011 Paris
              </p>
            </div>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-map-button"
            >
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">
                {lang === "fr" ? "Itinéraire" : "Directions"}
              </span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .contact-premium { isolation: isolate; }

        .contact-glow {
          position: absolute;
          z-index: -1;
          width: 380px;
          height: 380px;
          border-radius: 999px;
          pointer-events: none;
        }

        .contact-glow-left {
          left: -180px;
          top: 120px;
          background: radial-gradient(circle, rgba(31,107,45,0.10), transparent 70%);
        }

        .contact-glow-right {
          right: -180px;
          bottom: 60px;
          background: radial-gradient(circle, rgba(196,125,14,0.11), transparent 70%);
        }

        .contact-visual {
          border: 1px solid rgba(31,107,45,0.10);
          box-shadow: 0 28px 70px rgba(31,60,30,0.14);
        }

        .contact-visual-image {
          transform: scale(1.03);
          animation: contactCinema 18s ease-in-out infinite alternate;
        }

        .contact-chip,
        .contact-visual-action {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(255,255,255,0.20);
          border-radius: 999px;
          color: white;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .contact-chip {
          padding: 8px 12px;
          background: rgba(18,63,29,0.58);
          font-size: 11px;
          font-weight: 700;
        }

        .contact-chip-gold {
          color: #fff8d8;
          background: rgba(196,125,14,0.78);
        }

        .contact-visual-action {
          min-height: 36px;
          padding: 8px 13px;
          background: rgba(255,255,255,0.10);
          font-size: 12px;
          font-weight: 700;
          transition: transform .3s ease, background .3s ease;
        }

        .contact-visual-action:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.18);
        }

        .contact-visual-action-primary {
          border-color: transparent;
          color: #fff8d8;
          background: linear-gradient(135deg, #1f6b2d, #2d8a3e);
        }

        .contact-form-card {
          border: 1px solid rgba(31,107,45,0.10);
          background: linear-gradient(145deg, rgba(255,255,255,.97), rgba(251,247,239,.97));
          box-shadow: 0 28px 70px rgba(31,60,30,0.11);
        }

        .contact-form-icon,
        .contact-info-icon,
        .contact-map-pin {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-form-icon {
          width: 46px;
          height: 46px;
          border-radius: 16px;
          color: #1f6b2d;
          background: rgba(31,107,45,0.09);
        }

        .contact-field label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #123f1d;
          font-size: 12px;
          font-weight: 700;
        }

        .contact-field input,
        .contact-field textarea {
          width: 100%;
          border: 1px solid rgba(31,107,45,0.12);
          border-radius: 17px;
          outline: none;
          color: #2e2e2c;
          background: #fffdf8;
          font-size: 15px;
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }

        .contact-field input {
          min-height: 52px;
          padding: 0 16px;
        }

        .contact-field textarea {
          min-height: 156px;
          resize: vertical;
          padding: 15px 16px;
        }

        .contact-field input:focus,
        .contact-field textarea:focus {
          border-color: rgba(31,107,45,0.55);
          box-shadow: 0 0 0 4px rgba(31,107,45,0.08), 0 12px 26px rgba(31,60,30,0.06);
          transform: translateY(-1px);
        }

        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: #aaa79f;
        }

        .contact-error {
          margin-top: 6px;
          color: #a84444;
          font-size: 11px;
        }

        .contact-submit {
          display: flex;
          width: 100%;
          min-height: 54px;
          align-items: center;
          justify-content: space-between;
          border-radius: 18px;
          padding: 7px 8px 7px 20px;
          color: white;
          background: linear-gradient(135deg, #1f6b2d, #2d8a3e);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 14px 28px rgba(31,107,45,0.20);
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .contact-submit:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 20px 34px rgba(31,107,45,0.27);
        }

        .contact-submit:disabled {
          cursor: not-allowed;
          opacity: .58;
        }

        .contact-submit-icon {
          display: flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(255,255,255,0.13);
          transition: transform .3s ease;
        }

        .contact-submit:hover .contact-submit-icon {
          transform: translateX(3px) rotate(-8deg);
        }

        .contact-submit-error {
          border: 1px solid rgba(168,68,68,0.16);
          border-radius: 15px;
          padding: 12px 14px;
          color: #8b3636;
          background: rgba(224,92,92,0.08);
          font-size: 12px;
        }

        .contact-success {
          display: flex;
          min-height: 440px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          padding: 30px;
          text-align: center;
          background: radial-gradient(circle at top, rgba(31,107,45,0.08), transparent 55%);
        }

        .contact-success-icon {
          display: flex;
          width: 72px;
          height: 72px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #fff8d8;
          background: linear-gradient(135deg, #1f6b2d, #2d8a3e);
          box-shadow: 0 15px 34px rgba(31,107,45,0.24), 0 0 0 10px rgba(31,107,45,0.06);
          animation: contactSuccess .7s cubic-bezier(.16,1,.3,1);
        }
.contact-info-card {
  position: relative;
  min-height: 218px;
  overflow: hidden;
  border: 1px solid rgba(31,107,45,0.10);
  border-radius: 25px;
  padding: 19px;
  background: rgba(255,253,248,0.96);
  box-shadow: 0 20px 46px rgba(31,60,30,0.08);
  isolation: isolate;
  transition: transform .38s cubic-bezier(.16,1,.3,1), box-shadow .38s ease, border-color .38s ease;
}

.contact-info-card::after {
  content: "";
  position: absolute;
  inset: auto 24px 0 24px;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(90deg, #1f6b2d, #c47d0e);
  transform: scaleX(.22);
  transform-origin: left;
  opacity: .55;
  transition: transform .42s cubic-bezier(.16,1,.3,1), opacity .3s ease;
}

.contact-info-card-bg {
  position: absolute;
  z-index: -2;
  width: 145px;
  height: 145px;
  right: -52px;
  top: -58px;
  border-radius: 999px;
  opacity: .7;
  transition: transform .45s cubic-bezier(.16,1,.3,1), opacity .35s ease;
}

.contact-info-card-bg-green {
  background: radial-gradient(circle, rgba(31,107,45,.15), rgba(31,107,45,0) 70%);
}

.contact-info-card-bg-gold {
  background: radial-gradient(circle, rgba(196,125,14,.18), rgba(196,125,14,0) 70%);
}

.contact-info-top {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.contact-info-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .35s ease;
}

.contact-info-number {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .08em;
  opacity: .42;
}

.contact-info-watermark {
  position: absolute;
  right: -12px;
  bottom: -8px;
  z-index: -1;
  width: 82px;
  height: 82px;
  color: rgba(31,107,45,.045);
  transform: rotate(-8deg);
  transition: transform .45s cubic-bezier(.16,1,.3,1), color .3s ease;
}

.contact-info-watermark svg { width: 100%; height: 100%; }

.contact-info-main {
  min-height: 48px;
  max-width: 95%;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -.02em;
}

.contact-info-action {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 8px 13px;
  font-size: 12px;
  font-weight: 800;
  transition: transform .3s ease, background .3s ease, box-shadow .3s ease;
}

.contact-info-action-green {
  color: #164f22;
  background: rgba(31,107,45,0.09);
}

.contact-info-action-gold {
  color: #8a5a08;
  background: rgba(196,125,14,0.12);
}

.contact-info-open-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #5e6a5f;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.contact-info-open-dot > span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #2f8a40;
  box-shadow: 0 0 0 5px rgba(47,138,64,.09);
  animation: contactOpenPulse 2.2s ease-in-out infinite;
}

.contact-info-card:hover {
  transform: translateY(-11px);
  border-color: rgba(31,107,45,0.20);
  box-shadow: 0 30px 64px rgba(31,60,30,0.15);
}

.contact-info-card:hover::after {
  transform: scaleX(1);
  opacity: 1;
}

.contact-info-card:hover .contact-info-card-bg {
  transform: scale(1.18) translate(-8px, 8px);
  opacity: 1;
}

.contact-info-card:hover .contact-info-icon {
  transform: translateY(-3px) rotate(-5deg) scale(1.06);
}

.contact-info-card:hover .contact-info-watermark {
  color: rgba(31,107,45,.07);
  transform: rotate(-2deg) scale(1.08);
}

.contact-info-card:hover .contact-info-action {
  transform: translateX(3px);
}

@keyframes contactOpenPulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 0 5px rgba(47,138,64,.09); }
  50% { transform: scale(1.08); box-shadow: 0 0 0 9px rgba(47,138,64,.04); }
}

        .contact-map-shell {
          min-height: 430px;
          border: 1px solid rgba(31,107,45,0.10);
          background: #ded8cc;
          box-shadow: 0 24px 60px rgba(31,60,30,0.11);
        }

        .contact-map-panel {
          position: absolute;
          left: 22px;
          top: 22px;
          display: flex;
          max-width: calc(100% - 44px);
          align-items: center;
          gap: 13px;
          border: 1px solid rgba(31,107,45,0.11);
          border-radius: 20px;
          padding: 12px;
          background: rgba(255,253,248,0.94);
          box-shadow: 0 16px 36px rgba(31,60,30,0.16);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .contact-map-pin {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          color: #fff8d8;
          background: #1f6b2d;
        }

        .contact-map-button {
          display: inline-flex;
          min-height: 40px;
          align-items: center;
          gap: 7px;
          border-radius: 13px;
          padding: 10px 12px;
          color: #fff8d8;
          background: #1f6b2d;
          font-size: 11px;
          font-weight: 700;
        }

        @keyframes contactCinema {
          0% { transform: scale(1.03) translate3d(0,0,0); }
          50% { transform: scale(1.07) translate3d(-1.5%,-1%,0); }
          100% { transform: scale(1.045) translate3d(1%,.5%,0); }
        }

        @keyframes contactSuccess {
          0% { opacity: 0; transform: scale(.65) rotate(-12deg); }
          70% { transform: scale(1.08) rotate(3deg); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 1023px) {
          .contact-visual { min-height: 500px; }
        }

        @media (max-width: 640px) {
          .contact-visual {
            min-height: 480px;
            border-radius: 25px;
          }

          .contact-form-card { border-radius: 25px; }

          .contact-map-panel {
            left: 12px;
            right: 12px;
            top: 12px;
            max-width: none;
          }

          .contact-info-card { min-height: 205px; padding: 18px; border-radius: 22px; }\n.contact-info-main { min-height: auto; font-size: 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-visual-image,
          .contact-success-icon {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
