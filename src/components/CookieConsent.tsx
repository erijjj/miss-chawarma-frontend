// src/components/CookieConsent.tsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cookie, X } from "lucide-react";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";

const STORAGE_KEY = "mc_cookie_consent"; // "accepted" | "rejected"

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function updateConsent(granted: boolean) {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted") {
      updateConsent(true);
      return;
    }
    if (stored === "rejected") {
      updateConsent(false);
      return;
    }
    // Pas encore de choix : on affiche le bandeau après un court délai
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    updateConsent(true);
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    updateConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("cookies.title", "Préférences de cookies")}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        padding: "16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          borderRadius: 24,
          padding: "22px 22px 18px",
          background:
            "linear-gradient(145deg, rgba(255,255,255,.98), rgba(249,242,227,.98))",
          border: "1px solid rgba(31,107,45,0.14)",
          boxShadow: "0 24px 60px rgba(31,60,30,0.22)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span
            style={{
              flex: "none",
              width: 38,
              height: 38,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: `linear-gradient(135deg, ${GREEN}, #3f934d)`,
            }}
          >
            <Cookie size={18} />
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: DARK_GREEN,
              }}
            >
              {t("cookies.title", "Nous respectons votre vie privée")}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "#6f6a5e",
              }}
            >
              {t(
                "cookies.text",
                "Nous utilisons des cookies pour mesurer l'audience du site et améliorer votre expérience. Vous pouvez accepter, refuser, ou en savoir plus.",
              )}
            </p>

            {details && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 14,
                  background: "rgba(31,107,45,0.06)",
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  color: "#5c6b5a",
                }}
              >
                {t(
                  "cookies.detailsText",
                  "Cookies analytiques (Google Analytics) et publicitaires (Google Ads) : désactivables à tout moment depuis ce bandeau. Aucun cookie non essentiel n'est déposé tant que vous n'avez pas donné votre accord.",
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={accept}
                style={{
                  flex: "1 1 auto",
                  minHeight: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: "#fff",
                  background: `linear-gradient(135deg, ${GREEN}, ${DARK_GREEN})`,
                  boxShadow: "0 10px 22px rgba(31,107,45,0.22)",
                }}
              >
                {t("cookies.accept", "Tout accepter")}
              </button>

              <button
                type="button"
                onClick={reject}
                style={{
                  flex: "1 1 auto",
                  minHeight: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: DARK_GREEN,
                  background: "rgba(31,107,45,0.07)",
                  border: "1px solid rgba(31,107,45,0.14)",
                }}
              >
                {t("cookies.reject", "Refuser")}
              </button>

              <button
                type="button"
                onClick={() => setDetails((d) => !d)}
                style={{
                  flex: "1 1 auto",
                  minHeight: 40,
                  padding: "0 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#7b4d08",
                  background: "rgba(197,154,40,0.10)",
                  border: "1px solid rgba(197,154,40,0.20)",
                }}
              >
                {details
                  ? t("cookies.less", "Moins d'infos")
                  : t("cookies.more", "En savoir plus")}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={reject}
            aria-label={t("cookies.close", "Fermer et refuser")}
            style={{
              flex: "none",
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              cursor: "pointer",
              color: "#9b9384",
              background: "rgba(31,107,45,0.06)",
              border: "none",
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;