import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile — captcha anti-robot (le plus souvent invisible).
 *
 * - Clé publique : VITE_TURNSTILE_SITE_KEY dans le .env du front.
 * - Sans clé, le composant n'affiche rien et ne bloque rien
 *   (TURNSTILE_ENABLED = false) : le site continue de fonctionner.
 * - Un jeton ne sert qu'une fois : appeler ref.reset() après chaque envoi.
 */

export const TURNSTILE_SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
export const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      language?: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile script"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface Props {
  onToken: (token: string) => void;
  language?: string;
  className?: string;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(
  ({ onToken, language, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current("");
        if (window.turnstile && widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_ENABLED) return;
      let cancelled = false;

      loadScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(""),
            "error-callback": () => onTokenRef.current(""),
            language: language || "auto",
            theme: "light",
            size: "flexible",
          });
        })
        .catch(() => onTokenRef.current(""));

      return () => {
        cancelled = true;
        if (window.turnstile && widgetId.current) {
          window.turnstile.remove(widgetId.current);
        }
        widgetId.current = null;
      };
    }, [language]);

    if (!TURNSTILE_ENABLED) return null;
    return <div ref={containerRef} className={className} />;
  },
);

Turnstile.displayName = "Turnstile";
export default Turnstile;
