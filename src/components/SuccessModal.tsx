import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SuccessAnimation from "@/components/SuccessAnimation";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const CREAM = "#f7f0e4";
const LIGHT_GOLD = "#e4d9bd";

interface SuccessModalProps {
  firstName: string;
  orderId: number;
  total: string;
  redirectTo?: string;
  delayMs?: number;
  newCouponCode?: string | null;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  firstName,
  orderId,
  total,
  redirectTo = "/menu",
  delayMs = 5500,
  newCouponCode,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = () => {
    if (!newCouponCode) return;
    navigator.clipboard.writeText(newCouponCode).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setClosing(true);

      window.setTimeout(() => {
        navigate(redirectTo);
      }, 220);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, redirectTo, delayMs]);

  const handleSkip = () => {
    setClosing(true);

    window.setTimeout(() => {
      navigate(redirectTo);
    }, 200);
  };

  return (
    <div
      className={`success-modal-overlay ${
        closing ? "success-modal-closing" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="success-modal-card">
        <div className="success-modal-decoration success-decoration-left">
          <span />
          <span />
          <span />
        </div>

        <div className="success-modal-decoration success-decoration-right">
          <span />
          <span />
          <span />
        </div>

        <div className="success-modal-content">
          <SuccessAnimation>
            <div className="success-order-label success-fade-1">
              {t("checkout.orderAccepted", "Commande acceptée")}
            </div>

            <h2
              id="success-modal-title"
              className="success-title success-fade-1"
            >
              {t("checkout.successTitle", "Commande confirmée !")}
            </h2>

            <p className="success-message success-fade-2">
              {t("checkout.successText", "Merci")} <strong>{firstName}</strong>
              {" — "}
              {t("checkout.successOrderNumber", "votre commande")}{" "}
              <strong>#{orderId}</strong>{" "}
              {t("checkout.successOrderTotal", "d'un montant de")}{" "}
              <strong>{total}</strong>{" "}
              {t("checkout.successConfirmed", "est bien enregistrée.")}
            </p>

            <div className="success-order-card success-fade-2">
              <div className="success-order-row">
                <span>
                  {t("checkout.orderNumberLabel", "Numéro de commande")}
                </span>

                <strong>#{orderId}</strong>
              </div>

              <div className="success-order-divider" />

              <div className="success-order-row">
                <span>{t("checkout.totalLabel", "Total")}</span>

                <strong>{total}</strong>
              </div>
            </div>
            {newCouponCode && (
              <div className="success-coupon-card success-fade-2">
                <p className="success-coupon-label">
                  🎁{" "}
                  {t(
                    "checkout.couponEarned",
                    "-10% offerts pour votre prochaine commande !",
                  )}
                </p>
                <div className="success-coupon-row">
                  <strong>{newCouponCode}</strong>
                  <button
                    type="button"
                    onClick={handleCopyCoupon}
                    className="success-coupon-copy"
                  >
                    {copied
                      ? t("checkout.copied", "Copié !")
                      : t("checkout.copy", "Copier")}
                  </button>
                </div>
                <p className="success-coupon-note">
                  {t(
                    "checkout.couponSentEmail",
                    "Ce code vous a aussi été envoyé par email.",
                  )}
                </p>
              </div>
            )}
            <p className="success-preparation-text success-fade-3">
              <span className="success-pulse-dot" />

              {t(
                "checkout.preparationText",
                "Notre équipe commence la préparation de votre commande.",
              )}
            </p>

            <button
              type="button"
              onClick={handleSkip}
              className="success-menu-button success-fade-3"
            >
              <span>{t("checkout.seeMenuNow", "Retourner au menu")}</span>

              <span className="success-button-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </SuccessAnimation>
        </div>

        <div className="success-progress-track">
          <div
            className="success-progress-bar"
            style={{
              animationDuration: `${delayMs}ms`,
            }}
          />
        </div>
      </div>

      <style>{`
        .success-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background:
            radial-gradient(
              circle at center,
              rgba(31, 107, 45, 0.18),
              rgba(21, 31, 18, 0.72)
            );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: successOverlayIn 0.3s ease-out;
        }

        .success-modal-overlay.success-modal-closing {
          animation: successOverlayOut 0.22s ease-in forwards;
        }

        .success-modal-card {
          position: relative;
          width: 100%;
          max-width: 470px;
          max-height: calc(100vh - 40px);
          overflow: hidden auto;
          border: 1px solid rgba(31, 107, 45, 0.12);
          border-radius: 28px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 252, 244, 0.98),
              rgba(247, 240, 228, 0.98)
            );
          box-shadow:
            0 35px 90px rgba(15, 37, 18, 0.3),
            0 12px 35px rgba(15, 37, 18, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          animation: successCardReveal 0.55s
            cubic-bezier(0.16, 1, 0.3, 1);
        }

        .success-modal-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 200px;
          height: 5px;
          border-radius: 0 0 999px 999px;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            transparent,
            ${GREEN},
            #c59a28,
            ${GREEN},
            transparent
          );
        }

        .success-modal-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 36px 34px;
          text-align: center;
        }

        .success-order-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 14px;
          border: 1px solid rgba(31, 107, 45, 0.16);
          border-radius: 999px;
          color: ${GREEN};
          background: rgba(31, 107, 45, 0.08);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.11em;
          line-height: 1;
          text-transform: uppercase;
        }

        .success-title {
          margin: 0;
          color: ${GREEN};
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(27px, 5vw, 34px);
          font-weight: 600;
          line-height: 1.15;
        }

        .success-message {
          max-width: 355px;
          margin: 0;
          color: #5c5b54;
          font-size: 14px;
          line-height: 1.7;
        }

        .success-message strong {
          color: ${DARK_GREEN};
          font-weight: 700;
        }

        .success-order-card {
          width: 100%;
          max-width: 350px;
          padding: 16px 18px;
          border: 1px solid rgba(31, 107, 45, 0.12);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.52);
          box-shadow:
            0 8px 25px rgba(31, 72, 35, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .success-order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: #6a685f;
          font-size: 13px;
        }

        .success-order-row strong {
          color: ${GREEN};
          font-size: 14px;
          font-weight: 800;
        }

        .success-order-divider {
          width: 100%;
          height: 1px;
          margin: 12px 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(31, 107, 45, 0.16),
            transparent
          );
        }
.success-coupon-card {
          width: 100%;
          max-width: 350px;
          padding: 16px 18px;
          border: 1px solid rgba(196, 125, 14, 0.28);
          border-radius: 17px;
          background: linear-gradient(145deg, rgba(196,125,14,0.09), rgba(229,199,126,0.14));
          box-shadow: 0 8px 25px rgba(120, 80, 10, 0.08);
        }

        .success-coupon-label {
          margin: 0 0 10px;
          color: #8a5a08;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
        }

        .success-coupon-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .success-coupon-row strong {
          color: #7b4d08;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .success-coupon-copy {
          flex-shrink: 0;
          padding: 7px 14px;
          border: 0;
          border-radius: 999px;
          color: white;
          background: #c47d0e;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .success-coupon-copy:hover {
          transform: translateY(-1px);
          background: #a86808;
        }

        .success-coupon-note {
          margin: 8px 0 0;
          color: #937449;
          font-size: 10.5px;
          line-height: 1.4;
        }
        .success-preparation-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin: 0;
          color: #66645c;
          font-size: 12px;
          line-height: 1.5;
        }

        .success-pulse-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: ${GREEN};
          box-shadow: 0 0 0 rgba(31, 107, 45, 0.4);
          animation: successPulse 1.8s infinite;
        }

        .success-menu-button {
          width: 100%;
          max-width: 350px;
          min-height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 22px;
          border: 0;
          border-radius: 999px;
          color: white;
          background: linear-gradient(
            135deg,
            ${GREEN},
            ${DARK_GREEN}
          );
          box-shadow:
            0 12px 24px rgba(31, 107, 45, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .success-menu-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow:
            0 16px 30px rgba(31, 107, 45, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        .success-menu-button:active {
          transform: translateY(0) scale(0.98);
        }

        .success-menu-button:focus-visible {
          outline: 3px solid rgba(31, 107, 45, 0.24);
          outline-offset: 3px;
        }

        .success-button-arrow {
          display: inline-block;
          font-size: 18px;
          transition: transform 0.25s ease;
        }

        .success-menu-button:hover .success-button-arrow {
          transform: translateX(4px);
        }

        .success-progress-track {
          width: 100%;
          height: 5px;
          overflow: hidden;
          background: ${LIGHT_GOLD};
        }

        .success-progress-bar {
          width: 100%;
          height: 100%;
          transform: scaleX(1);
          transform-origin: left;
          background: linear-gradient(
            90deg,
            ${GREEN},
            #5ba458,
            #c59a28
          );
          animation-name: successProgressShrink;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        .success-modal-decoration {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          opacity: 0.14;
        }

        .success-decoration-left {
          top: 45px;
          left: 15px;
          transform: rotate(-24deg);
        }

        .success-decoration-right {
          right: 15px;
          bottom: 68px;
          transform: rotate(150deg);
        }

        .success-modal-decoration span {
          position: absolute;
          width: 12px;
          height: 25px;
          border-radius: 90% 10% 90% 10%;
          background: ${GREEN};
          transform-origin: bottom center;
        }

        .success-modal-decoration span:nth-child(1) {
          transform: rotate(-35deg) translateY(-4px);
        }

        .success-modal-decoration span:nth-child(2) {
          transform: rotate(0deg) translateY(-19px);
        }

        .success-modal-decoration span:nth-child(3) {
          transform: rotate(35deg) translateY(-4px);
        }

        @keyframes successOverlayIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes successOverlayOut {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
          }
        }

        @keyframes successCardReveal {
          0% {
            opacity: 0;
            transform: translateY(38px) scale(0.88);
          }

          65% {
            opacity: 1;
            transform: translateY(-5px) scale(1.015);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes successProgressShrink {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        @keyframes successPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(31, 107, 45, 0.38);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(31, 107, 45, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(31, 107, 45, 0);
          }
        }

        @media (max-width: 520px) {
          .success-modal-overlay {
            align-items: center;
            padding: 14px;
          }

          .success-modal-card {
            border-radius: 23px;
          }

          .success-modal-content {
            padding: 22px 20px 28px;
          }

          .success-message {
            font-size: 13px;
          }
        }

        @media (max-height: 700px) {
          .success-modal-overlay {
            align-items: flex-start;
          }

          .success-modal-card {
            margin: 10px 0;
          }

          .success-modal-content {
            padding-top: 18px;
            padding-bottom: 24px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .success-modal-overlay,
          .success-modal-card,
          .success-progress-bar,
          .success-pulse-dot {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
