import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  textColor?: string;
}

const FlagFR = () => (
  <svg
    viewBox="0 0 30 30"
    className="language-flag-svg"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="fr-circle">
        <circle cx="15" cy="15" r="14" />
      </clipPath>

      <linearGradient id="fr-gloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="42%" stopColor="rgba(255,255,255,0.18)" />
        <stop offset="75%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>

      <radialGradient id="fr-depth" cx="35%" cy="25%" r="80%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
        <stop offset="68%" stopColor="rgba(255,255,255,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
      </radialGradient>
    </defs>

    <g clipPath="url(#fr-circle)">
      <rect width="10" height="30" x="0" fill="#0055A4" />
      <rect width="10" height="30" x="10" fill="#FFFFFF" />
      <rect width="10" height="30" x="20" fill="#EF4135" />

      <ellipse
        cx="10"
        cy="7"
        rx="14"
        ry="7"
        fill="url(#fr-gloss)"
        opacity="0.78"
      />

      <circle cx="15" cy="15" r="14" fill="url(#fr-depth)" />
    </g>

    <circle
      cx="15"
      cy="15"
      r="14"
      fill="none"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="0.8"
    />
  </svg>
);

const FlagGB = () => (
  <svg
    viewBox="0 0 30 30"
    className="language-flag-svg"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="gb-circle">
        <circle cx="15" cy="15" r="14" />
      </clipPath>

      <linearGradient id="gb-gloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="42%" stopColor="rgba(255,255,255,0.18)" />
        <stop offset="75%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>

      <radialGradient id="gb-depth" cx="35%" cy="25%" r="80%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
        <stop offset="68%" stopColor="rgba(255,255,255,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
      </radialGradient>
    </defs>

    <g clipPath="url(#gb-circle)">
      <rect width="30" height="30" fill="#012169" />

      <path
        d="M0 0 L30 30 M30 0 L0 30"
        stroke="#FFFFFF"
        strokeWidth="7"
      />

      <path
        d="M0 0 L30 30 M30 0 L0 30"
        stroke="#C8102E"
        strokeWidth="3.4"
      />

      <path
        d="M15 0 V30 M0 15 H30"
        stroke="#FFFFFF"
        strokeWidth="9"
      />

      <path
        d="M15 0 V30 M0 15 H30"
        stroke="#C8102E"
        strokeWidth="4.7"
      />

      <ellipse
        cx="10"
        cy="7"
        rx="14"
        ry="7"
        fill="url(#gb-gloss)"
        opacity="0.76"
      />

      <circle cx="15" cy="15" r="14" fill="url(#gb-depth)" />
    </g>

    <circle
      cx="15"
      cy="15"
      r="14"
      fill="none"
      stroke="rgba(255,255,255,0.65)"
      strokeWidth="0.8"
    />
  </svg>
);

const LanguageSwitcher = ({
  textColor = "#1f6b2d",
}: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const isFrench = i18n.resolvedLanguage?.startsWith("fr");
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState<"fr" | "en">(
    isFrench ? "fr" : "en",
  );

  useEffect(() => {
    setDisplayLanguage(isFrench ? "fr" : "en");
  }, [isFrench]);

  const toggleLanguage = () => {
    if (isFlipping) return;

    const nextLanguage = isFrench ? "en" : "fr";

    setIsFlipping(true);

    window.setTimeout(() => {
      setDisplayLanguage(nextLanguage);
      i18n.changeLanguage(nextLanguage);
    }, 280);

    window.setTimeout(() => {
      setIsFlipping(false);
    }, 620);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={
        isFrench
          ? "Switch language to English"
          : "Changer la langue en français"
      }
      title={isFrench ? "English" : "Français"}
      className={`language-switcher ${
        isFlipping ? "language-switcher-flipping" : ""
      }`}
      style={
        {
          "--switcher-accent": textColor,
        } as React.CSSProperties
      }
    >
      <span className="language-orbit" aria-hidden="true" />

      <span className="language-glass">
        <span className="language-shine" aria-hidden="true" />

        <span className="language-flag-wrap">
          {displayLanguage === "fr" ? <FlagFR /> : <FlagGB />}
        </span>
      </span>

      <style>{`
        .language-switcher {
          --switcher-accent: #1f6b2d;

          position: relative;
          display: inline-flex;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          outline: none;
          perspective: 700px;
          -webkit-tap-highlight-color: transparent;
        }

        .language-glass {
          position: relative;
          z-index: 2;
          display: flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 4px;
          border: 1px solid rgba(255,255,255,0.45);
          border-radius: 50%;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.34),
              rgba(255,255,255,0.12)
            );
          box-shadow:
            0 8px 18px rgba(18,63,29,0.13),
            inset 0 1px 1px rgba(255,255,255,0.65),
            inset 0 -3px 8px rgba(18,63,29,0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transform-style: preserve-3d;
          transition:
            transform 0.3s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.3s ease,
            background 0.3s ease;
        }

        .language-flag-wrap {
          position: relative;
          z-index: 3;
          display: block;
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          overflow: hidden;
          border-radius: 50%;
          transform: translateZ(18px);
          filter:
            drop-shadow(0 4px 5px rgba(10,30,15,0.22))
            saturate(1.08);
        }

        .language-flag-svg {
          display: block;
          width: 28px;
          height: 28px;
          max-width: 28px;
          max-height: 28px;
          overflow: hidden;
          border-radius: 50%;
        }

        .language-switcher:hover .language-glass {
          transform: translateY(-2px) scale(1.08);
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.44),
              rgba(255,255,255,0.15)
            );
          box-shadow:
            0 12px 24px rgba(18,63,29,0.20),
            0 0 18px rgba(31,107,45,0.16),
            inset 0 1px 1px rgba(255,255,255,0.72);
        }

        .language-switcher:active .language-glass {
          transform: translateY(0) scale(0.96);
        }

        .language-switcher:focus-visible .language-glass {
          box-shadow:
            0 0 0 3px rgba(247,240,228,0.95),
            0 0 0 5px var(--switcher-accent),
            0 10px 22px rgba(18,63,29,0.18);
        }

        .language-shine {
          position: absolute;
          z-index: 4;
          top: -10px;
          left: -22px;
          width: 16px;
          height: 62px;
          opacity: 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.72),
              transparent
            );
          transform: rotate(22deg) translateX(-40px);
          pointer-events: none;
          animation: languageShine 5.5s ease-in-out infinite;
        }

        .language-orbit {
          position: absolute;
          inset: 1px;
          z-index: 1;
          border-radius: 50%;
          background:
            conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 275deg,
              rgba(196,125,14,0.80) 320deg,
              rgba(31,107,45,0.72) 350deg,
              transparent 360deg
            );
          -webkit-mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 1.5px),
              #000 calc(100% - 1px)
            );
          mask:
            radial-gradient(
              farthest-side,
              transparent calc(100% - 1.5px),
              #000 calc(100% - 1px)
            );
          opacity: 0.62;
          pointer-events: none;
          animation: languageOrbit 8s linear infinite;
        }

        .language-switcher:hover .language-orbit {
          opacity: 1;
          animation-duration: 2.8s;
        }

        .language-switcher-flipping .language-glass {
          animation:
            languageFlip 0.62s
            cubic-bezier(0.2,0.7,0.2,1)
            forwards;
        }

        .language-switcher-flipping .language-orbit {
          animation:
            languageOrbitFast 0.62s
            cubic-bezier(0.2,0.7,0.2,1)
            forwards;
        }

        @keyframes languageFlip {
          0% {
            transform: translateY(0) rotateY(0deg) scale(1);
          }

          45% {
            transform: translateY(-2px) rotateY(90deg) scale(0.92);
          }

          55% {
            transform: translateY(-2px) rotateY(270deg) scale(0.92);
          }

          100% {
            transform: translateY(0) rotateY(360deg) scale(1);
          }
        }

        @keyframes languageShine {
          0%, 70% {
            opacity: 0;
            transform: rotate(22deg) translateX(-40px);
          }

          76% {
            opacity: 0.85;
          }

          88% {
            opacity: 0;
            transform: rotate(22deg) translateX(78px);
          }

          100% {
            opacity: 0;
            transform: rotate(22deg) translateX(78px);
          }
        }

        @keyframes languageOrbit {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes languageOrbitFast {
          from {
            transform: rotate(0deg) scale(1);
          }

          50% {
            transform: rotate(220deg) scale(1.08);
          }

          to {
            transform: rotate(430deg) scale(1);
          }
        }

        @media (max-width: 640px) {
          .language-switcher {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .language-glass {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
            padding: 4px;
          }

          .language-flag-wrap {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
          }

          .language-flag-svg {
            width: 27px;
            height: 27px;
            max-width: 27px;
            max-height: 27px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .language-shine,
          .language-orbit,
          .language-switcher-flipping .language-glass {
            animation: none !important;
          }

          .language-glass {
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
};

export default LanguageSwitcher;