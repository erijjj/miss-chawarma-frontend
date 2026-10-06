import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Crosshair,
  Gift,
  Home,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  User,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/SuccessModal";
import { useCart } from "@/context/CartContext";
const API_URL =
  import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

const stripePromise: Promise<Stripe | null> | null = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;
const round2 = (n: number) => Math.round(n * 100) / 100;
const GREEN = "#1f6b2d";
const DARK_GREEN = "#123f1d";
const AMBER = "#c47d0e";
const GOLD = "#d2a619";
const BEIGE = "#f7f0e4";
const PAPER = "#fffdf8";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const GOOGLE_MAPS_MAP_ID =
  import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

let googleMapsPromise: Promise<any> | null = null;

const loadGoogleMaps = (language: "fr" | "en") => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps is only available in the browser."),
    );
  }

  if ((window as any).google?.maps?.importLibrary) {
    return Promise.resolve((window as any).google);
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY is missing."));
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      "miss-chawarma-google-maps",
    ) as HTMLScriptElement | null;

    const finish = () => {
      let attempts = 0;
      const maxAttempts = 50; // 5 secondes max (50 x 100ms)

      const check = () => {
        if ((window as any).google?.maps?.importLibrary) {
          resolve((window as any).google);
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          reject(new Error("Google Maps failed to initialize."));
          return;
        }

        setTimeout(check, 100);
      };

      check();
    };

    if (existingScript) {
      existingScript.addEventListener("load", finish, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google Maps failed to load.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "miss-chawarma-google-maps";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&v=weekly&loading=async&libraries=places,marker&language=${language}&region=FR`;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Google Maps failed to load.")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

const PLACEHOLDER =
  "https://placehold.co/160x160/f0eadf/1f6b2d?text=Miss+Chawarma";

const formatEuro = (value: number) => `${value.toFixed(2).replace(".", ",")}€`;

// dimanche = 0, lundi = 1, ... samedi = 6
const OPENING_HOURS: Record<
  number,
  { open: string; close: string; closesNextDay: boolean }
> = {
  0: { open: "11:30", close: "02:00", closesNextDay: true }, // Dimanche
  1: { open: "11:30", close: "00:00", closesNextDay: false }, // Lundi
  2: { open: "11:30", close: "00:00", closesNextDay: false }, // Mardi
  3: { open: "11:30", close: "00:00", closesNextDay: false }, // Mercredi
  4: { open: "11:30", close: "02:00", closesNextDay: true }, // Jeudi
  5: { open: "11:30", close: "02:00", closesNextDay: true }, // Vendredi
  6: { open: "11:30", close: "02:00", closesNextDay: true }, // Samedi
};

const PREP_BUFFER_MIN: Record<"emporter" | "livraison", number> = {
  emporter: 20,
  livraison: 45,
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const minutesToHHMM = (mins: number) => {
  const total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const formatDateISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Retourne le prochain créneau valide selon le mode de commande
const getNextAvailableSlot = (
  orderType: "emporter" | "livraison",
): { date: string; time: string } => {
  const now = new Date();
  const buffer = PREP_BUFFER_MIN[orderType];

  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + dayOffset);
    const dow = candidate.getDay();
    const hours = OPENING_HOURS[dow];

    const openMin = toMinutes(hours.open);
    const closeMin =
      toMinutes(hours.close) + (hours.closesNextDay ? 24 * 60 : 0);
    const lastOrderMin = closeMin - buffer;

    let earliestMin = openMin;

    if (dayOffset === 0) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      earliestMin = Math.max(openMin, nowMin + buffer);
      earliestMin = Math.ceil(earliestMin / 15) * 15; // arrondi au quart d'heure
    }

    if (earliestMin <= lastOrderMin) {
      return {
        date: formatDateISO(candidate),
        time: minutesToHHMM(earliestMin),
      };
    }
  }

  // Ne devrait jamais arriver (ouvert 7j/7), sécurité
  return { date: formatDateISO(now), time: OPENING_HOURS[now.getDay()].open };
};

// Vérifie qu'un créneau choisi par le client tombe bien dans les horaires
// d'ouverture, avec assez de marge pour la préparation/livraison, et pas
// dans le passé.
const isRequestedSlotValid = (
  dateStr: string,
  timeStr: string,
  orderType: "emporter" | "livraison",
): boolean => {
  if (!dateStr || !timeStr) return false;

  const requested = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(requested.getTime())) return false;

  const buffer = PREP_BUFFER_MIN[orderType];
  const minAllowed = new Date(Date.now() + buffer * 60000);
  if (requested < minAllowed) return false;

  const dow = requested.getDay();
  const hours = OPENING_HOURS[dow];
  const openMin = toMinutes(hours.open);
  const closeMin = toMinutes(hours.close) + (hours.closesNextDay ? 24 * 60 : 0);
  const lastOrderMin = closeMin - buffer;

  const requestedMin = requested.getHours() * 60 + requested.getMinutes();

  return requestedMin >= openMin && requestedMin <= lastOrderMin;
};

const getMinDate = () => new Date().toISOString().split("T")[0];

const quickNotes = {
  fr: ["🎂 Anniversaire", "🌶️ Peu épicé", "🚫 Sans oignons", "🥬 Végétarien"],
  en: ["🎂 Birthday", "🌶️ Mild spice", "🚫 No onions", "🥬 Vegetarian"],
};

const FieldShell: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <label className="checkout-field">
    <span className="checkout-field-label">
      {icon}
      {label}
    </span>
    {children}
  </label>
);

const SectionCard: React.FC<{
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ eyebrow, title, icon, children }) => (
  <section className="checkout-section-card">
    <div className="checkout-section-heading">
      <span className="checkout-section-icon">{icon}</span>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
    {children}
  </section>
);
type DeliveryAddress = {
  street: string;
  postalCode: string;
  city: string;
  formattedAddress: string;
  lat: number;
  lng: number;
};

interface DeliveryAddressPickerProps {
  lang: "fr" | "en";
  value: string;
  postalCode: string;
  city: string;
  onSelect: (address: DeliveryAddress) => void;
}

const getAddressComponent = (components: any[] = [], type: string) => {
  const component = components.find((item) => item.types?.includes(type));

  return (
    component?.longText ||
    component?.long_name ||
    component?.shortText ||
    component?.short_name ||
    ""
  );
};

const createDeliveryAddress = (
  components: any[] = [],
  formattedAddress = "",
  location?: any,
): DeliveryAddress => {
  const streetNumber = getAddressComponent(components, "street_number");

  const route = getAddressComponent(components, "route");

  const postalCode = getAddressComponent(components, "postal_code");

  const city =
    getAddressComponent(components, "locality") ||
    getAddressComponent(components, "postal_town") ||
    getAddressComponent(components, "administrative_area_level_2");

  const lat =
    typeof location?.lat === "function" ? location.lat() : location?.lat || 0;

  const lng =
    typeof location?.lng === "function" ? location.lng() : location?.lng || 0;

  return {
    street: [streetNumber, route].filter(Boolean).join(" "),
    postalCode,
    city,
    formattedAddress,
    lat,
    lng,
  };
};

const DeliveryAddressPicker: React.FC<DeliveryAddressPickerProps> = ({
  lang,
  value,
  postalCode,
  city,
  onSelect,
}) => {
  const autocompleteHostRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(null);

  useEffect(() => {
    let cancelled = false;
    let autocompleteElement: any = null;
    let selectHandler: ((event: any) => void) | null = null;

    loadGoogleMaps(lang)
      .then(async (google) => {
        if (cancelled || !autocompleteHostRef.current) {
          return;
        }

        const { PlaceAutocompleteElement } =
          await google.maps.importLibrary("places");

        autocompleteHostRef.current.innerHTML = "";

        autocompleteElement = new PlaceAutocompleteElement({
          includedRegionCodes: ["fr"],
        });

        autocompleteElement.placeholder =
          lang === "fr"
            ? "Commencez à saisir votre adresse…"
            : "Start typing your address…";

        autocompleteElement.className = "checkout-google-autocomplete";

        selectHandler = async (event: any) => {
          try {
            const place = event.placePrediction.toPlace();

            await place.fetchFields({
              fields: ["formattedAddress", "addressComponents", "location"],
            });

            const address = createDeliveryAddress(
              place.addressComponents,
              place.formattedAddress || "",
              place.location,
            );

            setSelectedAddress(address);
            onSelect(address);
            setMapsError("");
          } catch {
            setMapsError(
              lang === "fr"
                ? "Impossible de récupérer cette adresse."
                : "Unable to retrieve this address.",
            );
          }
        };

        autocompleteElement.addEventListener("gmp-select", selectHandler);

        autocompleteHostRef.current.appendChild(autocompleteElement);

        setMapsReady(true);
      })
      .catch((err) => {
        console.error("Google Maps init error:", err);
        setMapsError(
          lang === "fr"
            ? "Google Maps est indisponible. Vérifiez la clé API et les restrictions."
            : "Google Maps is unavailable. Check the API key and restrictions.",
        );
      });

    return () => {
      cancelled = true;

      if (autocompleteElement && selectHandler) {
        autocompleteElement.removeEventListener("gmp-select", selectHandler);
      }
    };
  }, [lang, onSelect]);

  useEffect(() => {
    if (!mapOpen || !mapsReady || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleMaps(lang).then(async (google) => {
      if (cancelled || !mapContainerRef.current) {
        return;
      }

      const [{ Map }, { AdvancedMarkerElement, PinElement }] =
        await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
        ]);

      const initialPosition =
        selectedAddress?.lat && selectedAddress?.lng
          ? {
              lat: selectedAddress.lat,
              lng: selectedAddress.lng,
            }
          : {
              lat: 48.8658,
              lng: 2.3786,
            };

      const map = new Map(mapContainerRef.current, {
        center: initialPosition,
        zoom: selectedAddress ? 17 : 14,
        mapId: GOOGLE_MAPS_MAP_ID,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });

      const pin = new PinElement({
        background: GREEN,
        borderColor: DARK_GREEN,
        glyphColor: "#ffffff",
        scale: 1.15,
      });

      const marker = new AdvancedMarkerElement({
        map,
        position: initialPosition,
        gmpDraggable: true,
        content: pin.element,
      });

      const geocoder = new google.maps.Geocoder();

      const selectPosition = async (position: any) => {
        marker.position = position;
        map.panTo(position);

        try {
          const response = await geocoder.geocode({
            location: position,
          });

          const result = response.results?.[0];

          if (!result) return;

          const address = createDeliveryAddress(
            result.address_components,
            result.formatted_address || "",
            result.geometry?.location || position,
          );

          setSelectedAddress(address);
          setMapsError("");
        } catch {
          setMapsError(
            lang === "fr"
              ? "Impossible d’identifier cette position."
              : "Unable to identify this location.",
          );
        }
      };

      marker.addListener("dragend", () => {
        if (marker.position) {
          void selectPosition(marker.position);
        }
      });

      map.addListener("click", (event: any) => {
        if (event.latLng) {
          void selectPosition(event.latLng);
        }
      });

      mapRef.current = map;
      markerRef.current = marker;
      geocoderRef.current = geocoder;

      // Force le recalcul de la taille une fois l'animation de la modale terminée
      window.setTimeout(() => {
        google.maps.event.trigger(map, "resize");
        map.setCenter(initialPosition);
      }, 500); // légèrement plus long que les 450ms de l'animation checkoutMapIn
      markerRef.current = marker;
      geocoderRef.current = geocoder;
    });

    return () => {
      cancelled = true;

      if (markerRef.current) {
        markerRef.current.map = null;
      }

      mapRef.current = null;
      markerRef.current = null;
      geocoderRef.current = null;
    };
  }, [mapOpen, mapsReady, lang]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMapsError(
        lang === "fr"
          ? "La géolocalisation n’est pas disponible."
          : "Geolocation is unavailable.",
      );
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        mapRef.current?.setZoom(18);
        mapRef.current?.panTo(position);

        if (markerRef.current) {
          markerRef.current.position = position;
        }

        try {
          const google = await loadGoogleMaps(lang);

          const geocoder = geocoderRef.current || new google.maps.Geocoder();

          const response = await geocoder.geocode({
            location: position,
          });

          const result = response.results?.[0];

          if (result) {
            setSelectedAddress(
              createDeliveryAddress(
                result.address_components,
                result.formatted_address || "",
                result.geometry?.location || position,
              ),
            );
          }
        } catch {
          setMapsError(
            lang === "fr"
              ? "Impossible de lire votre position."
              : "Unable to read your location.",
          );
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setLoadingLocation(false);

        setMapsError(
          lang === "fr"
            ? "Autorisez la localisation dans votre navigateur."
            : "Allow location access in your browser.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const confirmAddress = () => {
    if (!selectedAddress) return;

    onSelect(selectedAddress);
    setMapOpen(false);
  };

  return (
    <>
      <div className="checkout-address-search">
        <div className="checkout-address-search-top">
          <div>
            <span className="checkout-field-label">
              <Home className="h-4 w-4" />
              {lang === "fr" ? "Adresse" : "Address"}
            </span>

            <p>
              {lang === "fr"
                ? "Recherchez votre adresse ou sélectionnez-la sur la carte."
                : "Search your address or select it on the map."}
            </p>
          </div>

          <button
            type="button"
            className="checkout-map-button"
            onClick={() => setMapOpen(true)}
          >
            <MapPin className="h-4 w-4" />
            {lang === "fr" ? "Choisir sur la carte" : "Choose on map"}
          </button>
        </div>

        <div ref={autocompleteHostRef} className="checkout-autocomplete-host" />

        {value && (
          <div className="checkout-selected-address">
            <span>
              <Check className="h-4 w-4" />
            </span>

            <div>
              <strong>
                {lang === "fr" ? "Adresse sélectionnée" : "Selected address"}
              </strong>

              <p>{[value, postalCode, city].filter(Boolean).join(", ")}</p>
            </div>
          </div>
        )}

        {mapsError && <div className="checkout-map-error">{mapsError}</div>}
      </div>

      {mapOpen &&
        createPortal(
          <div className="checkout-map-overlay" role="dialog" aria-modal="true">
            <div className="checkout-map-modal">
              <header className="checkout-map-header">
                <div>
                  <p className="checkout-eyebrow">
                    {lang === "fr"
                      ? "Adresse de livraison"
                      : "Delivery address"}
                  </p>

                  <h3>
                    {lang === "fr"
                      ? "Placez le repère chez vous"
                      : "Place the pin at your home"}
                  </h3>

                  <span>
                    {lang === "fr"
                      ? "Cliquez sur la carte ou déplacez le repère."
                      : "Click the map or drag the pin."}
                  </span>
                </div>

                <button
                  type="button"
                  className="checkout-map-close"
                  onClick={() => setMapOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="checkout-map-canvas-wrap">
                <div ref={mapContainerRef} className="checkout-map-canvas" />

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={loadingLocation}
                  className="checkout-current-location"
                >
                  <Crosshair className="h-4 w-4" />

                  {loadingLocation
                    ? lang === "fr"
                      ? "Localisation…"
                      : "Locating…"
                    : lang === "fr"
                      ? "Ma position"
                      : "My location"}
                </button>
              </div>

              <footer className="checkout-map-footer">
                <div className="checkout-map-address-preview">
                  <MapPin className="h-5 w-5" />

                  <div>
                    <strong>
                      {lang === "fr" ? "Adresse retenue" : "Selected address"}
                    </strong>

                    <p>
                      {selectedAddress?.formattedAddress ||
                        (lang === "fr"
                          ? "Choisissez un point sur la carte."
                          : "Choose a point on the map.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!selectedAddress?.street}
                  onClick={confirmAddress}
                  className="checkout-map-confirm"
                >
                  <Check className="h-4 w-4" />

                  {lang === "fr"
                    ? "Utiliser cette adresse"
                    : "Use this address"}
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
const OrderSummary: React.FC<{
  subtotal: number;
  deliveryFee?: number | null;
  total: number;
  orderType: "emporter" | "livraison";
  discountAmount?: number;
}> = ({ subtotal, deliveryFee, total, orderType, discountAmount }) => {
  const { items } = useCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";

  return (
    <aside className="checkout-summary">
      <div className="checkout-summary-top">
        <span className="checkout-summary-bag">
          <ShoppingBag className="h-5 w-5" />
        </span>

        <div>
          <p className="checkout-eyebrow">
            {lang === "fr" ? "Votre sélection" : "Your selection"}
          </p>
          <h2>{lang === "fr" ? "Votre commande" : "Your order"}</h2>
        </div>
      </div>

      <div className="checkout-summary-items">
        {items.map((item) => {
          const image = (item as { image?: string }).image;

          return (
            <div key={item.dishId} className="checkout-summary-item">
              <img
                src={image || PLACEHOLDER}
                alt={item.name}
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER;
                }}
              />

              <div className="min-w-0 flex-1">
                <p className="checkout-summary-item-name">{item.name}</p>
                <p className="checkout-summary-item-meta">
                  {item.quantity} × {formatEuro(item.price)}
                </p>
              </div>

              <strong>{formatEuro(item.price * item.quantity)}</strong>
            </div>
          );
        })}
      </div>

      <div className="checkout-summary-divider" />

      <div className="checkout-summary-lines">
        <div>
          <span>{lang === "fr" ? "Sous-total" : "Subtotal"}</span>
          <strong>{formatEuro(subtotal)}</strong>
        </div>

        {discountAmount != null && discountAmount > 0 && (
          <div>
            <span style={{ color: "#1f6b2d" }}>
              {lang === "fr" ? "Réduction" : "Discount"}
            </span>
            <strong style={{ color: "#1f6b2d" }}>
              −{formatEuro(discountAmount)}
            </strong>
          </div>
        )}

        <div className="checkout-summary-total">
          <span>{lang === "fr" ? "Total" : "Total"}</span>
          <strong>{formatEuro(total)}</strong>
        </div>
      </div>

      <div className="checkout-summary-time">
        {orderType === "emporter" ? (
          <Store className="h-4 w-4" />
        ) : (
          <Truck className="h-4 w-4" />
        )}
        <div>
          <p>
            {orderType === "emporter"
              ? lang === "fr"
                ? "Préparation estimée"
                : "Estimated preparation"
              : lang === "fr"
                ? "Livraison estimée"
                : "Estimated delivery"}
          </p>
          <strong>
            {orderType === "emporter" ? "15–20 min" : "30–45 min"}
          </strong>
        </div>
      </div>

      <div className="checkout-trust-list">
        <span>
          <ShieldCheck className="h-4 w-4" />
          {lang === "fr" ? "Paiement sécurisé" : "Secure payment"}
        </span>
        <span>
          <UtensilsCrossed className="h-4 w-4" />
          {lang === "fr" ? "Préparation maison" : "Homemade preparation"}
        </span>
        <span>
          <PackageCheck className="h-4 w-4" />
          {lang === "fr" ? "Confirmation immédiate" : "Instant confirmation"}
        </span>
      </div>
    </aside>
  );
};

const StripePaymentForm: React.FC<{
  onSuccess: () => void;
  onError: (message: string) => void;
}> = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      onError(
        error.message || t("checkout.paymentError", "Le paiement a échoué."),
      );
      setIsPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
      return;
    }

    setIsPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="checkout-stripe-form">
      <div className="checkout-stripe-shell">
        <PaymentElement options={{ wallets: { link: "never" } }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || isPaying}
        className="checkout-primary-button"
      >
        <span>
          {isPaying
            ? t("checkout.paying", "Paiement en cours…")
            : t("checkout.payNow", "Payer maintenant")}
        </span>
        <span className="checkout-primary-button-icon">
          {isPaying ? (
            <span className="checkout-spinner" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </span>
      </button>
    </form>
  );
};

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();

  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";

  // Desktop floating order summary.
  // We intentionally emulate sticky with position: fixed because some global
  // layout/overflow rules in the app prevent CSS sticky from working reliably.
  const checkoutLayoutRef = useRef<HTMLDivElement | null>(null);
  const desktopSummaryRef = useRef<HTMLDivElement | null>(null);
  const paymentStopRef = useRef<HTMLButtonElement | null>(null);

  const [orderType, setOrderType] = useState<"emporter" | "livraison">(
    "emporter",
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    requestedDate: "",
    requestedTime: "",
    addressStreet: "",
    addressExtra: "",
    postalCode: "",
    city: "",
    note: "",
  });

  // Pré-remplit automatiquement le prochain créneau disponible dès que le
  // mode de réception change, en tenant compte des horaires d'ouverture et
  // du délai de préparation/livraison — le client peut toujours modifier
  // manuellement ensuite.
  useEffect(() => {
    const slot = getNextAvailableSlot(orderType);
    setForm((current) => ({
      ...current,
      requestedDate: slot.date,
      requestedTime: slot.time,
    }));
  }, [orderType]);

  // On laptop/desktop, keep "Votre commande / Your order" visible while the
  // customer scrolls through the form. This does not depend on CSS sticky,
  // so it still works even if another global parent uses overflow/transform.
  useEffect(() => {
    const layout = checkoutLayoutRef.current;
    const summary = desktopSummaryRef.current;

    if (!layout || !summary) return;

    const DESKTOP_BREAKPOINT = 1024;
    const TOP_OFFSET = 104;
    const MAX_CONTAINER_WIDTH = 1180;
    const DESKTOP_SUMMARY_WIDTH = 360;

    const resetSummary = () => {
      summary.style.position = "relative";
      summary.style.top = "auto";
      summary.style.right = "auto";
      summary.style.width = "auto";
      summary.style.zIndex = "20";
      summary.style.transform = "none";
    };

    const updateSummaryPosition = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        resetSummary();
        return;
      }

      const layoutRect = layout.getBoundingClientRect();
      const summaryHeight = summary.offsetHeight;

      // Before the checkout grid reaches the floating position, leave the
      // summary exactly in its original place.
      if (layoutRect.top > TOP_OFFSET) {
        resetSummary();
        return;
      }

      // Right edge aligned with the 1180px checkout container.
      const rightOffset = Math.max(
        16,
        (window.innerWidth - MAX_CONTAINER_WIDTH) / 2,
      );

      // Stop boundary:
      // while the form is active, the summary must never go lower than the
      // "Continuer vers le paiement / Continue to payment" button.
      // When the summary reaches that button, its bottom edge follows the
      // button upward instead of continuing into the footer.
      const paymentButton = paymentStopRef.current;

      let stopBottom = layoutRect.bottom;

      if (paymentButton) {
        stopBottom = paymentButton.getBoundingClientRect().bottom;
      }

      const maxAllowedTop = stopBottom - summaryHeight;

      // Normal state: fixed just under the header.
      // End state: it is progressively pushed upward with the payment button,
      // which makes it stop at exactly the end of the form.
      const floatingTop = Math.min(TOP_OFFSET, maxAllowedTop);

      summary.style.position = "fixed";
      summary.style.top = `${floatingTop}px`;
      summary.style.right = `${rightOffset}px`;
      summary.style.width = `${DESKTOP_SUMMARY_WIDTH}px`;
      summary.style.zIndex = "30";
      summary.style.transform = "translateZ(0)";
    };

    updateSummaryPosition();

    window.addEventListener("scroll", updateSummaryPosition, { passive: true });
    window.addEventListener("resize", updateSummaryPosition);

    return () => {
      window.removeEventListener("scroll", updateSummaryPosition);
      window.removeEventListener("resize", updateSummaryPosition);
      resetSummary();
    };
  }, []);

  // Validation en direct : recalculée à chaque changement de date/heure/mode,
  // pour afficher un avertissement immédiatement sous le champ plutôt que
  // d'attendre la soumission du formulaire.
  const slotIsValid = useMemo(
    () =>
      isRequestedSlotValid(form.requestedDate, form.requestedTime, orderType),
    [form.requestedDate, form.requestedTime, orderType],
  );

  const nextSlotSuggestion = useMemo(
    () => (!slotIsValid ? getNextAvailableSlot(orderType) : null),
    [slotIsValid, orderType],
  );

  const [paymentMethod, setPaymentMethod] = useState<"carte" | "sur_place">(
    "sur_place",
  );

  const [deliveryInfo, setDeliveryInfo] = useState<{
    minimum: number | null;
    fee: number;
    meetsMinimum: boolean;
    freeThreshold: number;
  } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [receivedCouponCode, setReceivedCouponCode] = useState<string | null>(
    null,
  );
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "verified" | "error"
  >("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [step, setStep] = useState<
    "form" | "paymentChoice" | "payment" | "success"
  >("form");

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [orderResult, setOrderResult] = useState<{
    id: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const sendVerificationCode = async () => {
    if (!isTalintsDomain) return;
    setVerificationStatus("sending");
    setVerificationMessage("");
    try {
      const response = await fetch(`${API_URL}/api/verification/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      if (!response.ok) throw new Error();
      setVerificationStatus("sent");
    } catch {
      setVerificationStatus("error");
      setVerificationMessage(
        lang === "fr"
          ? "Erreur lors de l'envoi du code"
          : "Error sending the code",
      );
    }
  };

  const verifyEmailCode = async () => {
    if (!verificationCode.trim()) return;
    setVerificationStatus("verifying");
    try {
      const response = await fetch(`${API_URL}/api/verification/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          code: verificationCode.trim(),
        }),
      });
      const data = await response.json();
      if (data.verified) {
        setVerificationStatus("verified");
        setVerificationMessage(
          lang === "fr" ? "Email vérifié !" : "Email verified!",
        );
      } else {
        setVerificationStatus("sent");
        setVerificationMessage(
          data.message || (lang === "fr" ? "Code incorrect" : "Incorrect code"),
        );
      }
    } catch {
      setVerificationStatus("sent");
      setVerificationMessage(
        lang === "fr" ? "Erreur de vérification" : "Verification error",
      );
    }
  };
  // Suivi de conversion Google Ads : se déclenche une seule fois dès que
  // la commande passe à l'état "success", que ce soit via paiement carte
  // (Stripe) ou paiement sur place — les deux mettent à jour `step` et
  // `orderResult` de la même façon.
  useEffect(() => {
    if (step === "success" && orderResult && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-18328707444/3AHuCITp-tQcEPTC56NE",
        transaction_id: String(orderResult.id),
        value: orderResult.total,
        currency: "EUR",
      });
    }
  }, [step, orderResult]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    if (event.target.name === "email") {
      setVerificationStatus("idle");
      setVerificationCode("");
      setVerificationMessage("");
    }
  };

  const handleAddressSelect = React.useCallback((address: DeliveryAddress) => {
    setForm((current) => ({
      ...current,
      addressStreet: address.street || address.formattedAddress,
      postalCode: address.postalCode,
      city: address.city,
    }));
  }, []);

  const addQuickNote = (note: string) => {
    setForm((current) => ({
      ...current,
      note: current.note
        ? `${current.note}${current.note.endsWith(" ") ? "" : " "}${note}`
        : note,
    }));
  };

  useEffect(() => {
    if (orderType !== "livraison" || form.postalCode.trim().length < 4) {
      setDeliveryInfo(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      fetch(`${API_URL}/api/orders/delivery-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postal_code: form.postalCode.trim(),
          city: form.city.trim(),
          subtotal,
        }),
      })
        .then((response) => response.json())
        .then((data) =>
          setDeliveryInfo({
            minimum: data.minimum,
            fee: data.fee,
            meetsMinimum: data.meets_minimum,
            freeThreshold: data.free_delivery_threshold,
          }),
        )
        .catch(() => setDeliveryInfo(null));
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [orderType, form.postalCode, form.city, subtotal]);

  const isTalintsDomain = form.email
    .trim()
    .toLowerCase()
    .endsWith("@talints.fr");
  const isTalintsEmployee =
    isTalintsDomain && verificationStatus === "verified";
  const effectiveDiscountPercent = isTalintsEmployee
    ? 60
    : couponDiscountPercent;
  const deliveryFeeValue =
    orderType === "livraison" && deliveryInfo ? deliveryInfo.fee : 0;
  const couponDiscountAmount = round2(
    (subtotal * effectiveDiscountPercent) / 100,
  );
  const currentTotal = subtotal + deliveryFeeValue - couponDiscountAmount;
  const scrollCheckoutToTop = () => {
    window.requestAnimationFrame(() => {
      document.querySelector(".checkout-progress")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleContinueToPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!slotIsValid) {
      const slot = nextSlotSuggestion ?? getNextAvailableSlot(orderType);
      setErrorMessage(
        lang === "fr"
          ? `Cet horaire n'est pas disponible (restaurant fermé ou délai insuffisant). Prochain créneau disponible : ${slot.date} à ${slot.time}.`
          : `This time slot isn't available (restaurant closed or not enough lead time). Next available slot: ${slot.date} at ${slot.time}.`,
      );
      return;
    }

    if (orderType === "livraison" && !form.addressStreet.trim()) {
      setErrorMessage(
        lang === "fr"
          ? "Sélectionnez une adresse de livraison avant de continuer."
          : "Select a delivery address before continuing.",
      );
      return;
    }

    if (
      orderType === "livraison" &&
      deliveryInfo &&
      !deliveryInfo.meetsMinimum
    ) {
      setErrorMessage(
        t(
          "checkout.minimumNotMet",
          `Le minimum de commande pour votre zone est de ${deliveryInfo.minimum}€.`,
        ),
      );
      return;
    }

    setStep("paymentChoice");
    scrollCheckoutToTop();
  };

  const returnToInformation = () => {
    setErrorMessage("");
    setStep("form");
    scrollCheckoutToTop();
  };
  const checkCoupon = async () => {
    if (!couponCode.trim() || !form.email.trim() || !form.phone.trim()) return;
    setCouponStatus("checking");
    try {
      const response = await fetch(`${API_URL}/api/orders/check-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        }),
      });
      const data = await response.json();
      if (data.valid) {
        setCouponStatus("valid");
        setCouponDiscountPercent(data.discount_percent ?? 0);
        setCouponMessage(
          lang === "fr"
            ? `Code appliqué : -${data.discount_percent}%`
            : `Code applied: -${data.discount_percent}%`,
        );
      } else {
        setCouponStatus("invalid");
        setCouponDiscountPercent(0);
        setCouponMessage(
          data.message || (lang === "fr" ? "Code invalide" : "Invalid code"),
        );
      }
    } catch {
      setCouponStatus("invalid");
      setCouponDiscountPercent(0);
      setCouponMessage(
        lang === "fr" ? "Erreur de vérification" : "Verification error",
      );
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (
      orderType === "livraison" &&
      deliveryInfo &&
      !deliveryInfo.meetsMinimum
    ) {
      setErrorMessage(
        t(
          "checkout.minimumNotMet",
          `Le minimum de commande pour votre zone est de ${deliveryInfo.minimum}€.`,
        ),
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: orderType,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          requested_date: form.requestedDate,
          requested_time: form.requestedTime,
          address_street: form.addressStreet,
          address_extra: form.addressExtra,
          postal_code: form.postalCode,
          city: form.city,
          note: form.note,
          payment_method: paymentMethod,
          language: lang,
          coupon_code: couponStatus === "valid" ? couponCode.trim() : undefined,
          items: items.map((item) => ({
            dish_id: item.dishId,
            quantity: item.quantity,
            removed_ingredients: item.customizations?.removed ?? [],
            selected_choices: item.customizations?.choices ?? undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.detail || t("checkout.genericError", "Une erreur est survenue."),
        );
        return;
      }

      setOrderResult({
        id: data.id,
        subtotal: data.subtotal,
        deliveryFee: data.delivery_fee,
        total: data.total,
      });
      setReceivedCouponCode(data.new_coupon_code ?? null);

      if (paymentMethod === "carte") {
        const paymentResponse = await fetch(
          `${API_URL}/api/orders/${data.id}/create-payment-intent`,
          { method: "POST" },
        );

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          setErrorMessage(
            paymentData.detail ||
              t(
                "checkout.paymentUnavailable",
                "Le paiement en ligne est indisponible pour le moment.",
              ),
          );
          return;
        }

        setClientSecret(paymentData.client_secret);
        setStep("payment");
      } else {
        clearCart();
        setStep("success");
      }
    } catch {
      setErrorMessage(t("checkout.genericError", "Une erreur est survenue."));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setStep("success");
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen" style={{ background: BEIGE }}>
        <Header />

        <main className="checkout-empty">
          <span className="checkout-empty-icon">
            <ShoppingBag className="h-8 w-8" />
          </span>

          <p className="checkout-eyebrow">
            {lang === "fr"
              ? "Votre panier vous attend"
              : "Your cart is waiting"}
          </p>

          <h1>
            {lang === "fr" ? "Votre panier est vide" : "Your cart is empty"}
          </h1>

          <p>
            {lang === "fr"
              ? "Ajoutez des plats depuis notre menu pour commander."
              : "Add dishes from our menu to place your order."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="checkout-primary-button checkout-empty-button"
          >
            <span>{lang === "fr" ? "Voir le menu" : "View menu"}</span>
            <span className="checkout-primary-button-icon">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </main>

        <Footer />
      </div>
    );
  }

  if (step === "success" && orderResult) {
    return (
      <div className="min-h-screen" style={{ background: BEIGE }}>
        <Header />
        <div className="min-h-[70vh]" />
        <Footer />

        <SuccessModal
          firstName={form.firstName}
          orderId={orderResult.id}
          total={formatEuro(orderResult.total)}
          redirectTo="/menu"
          delayMs={receivedCouponCode ? 9000 : 4000}
          newCouponCode={receivedCouponCode}
        />
      </div>
    );
  }

  return (
    <div className="checkout-page min-h-screen" style={{ background: BEIGE }}>
      <Header />

      <div
        className="fixed left-0 right-0 top-0 z-40 h-2"
        onMouseEnter={() => window.dispatchEvent(new CustomEvent("showHeader"))}
      />

      <main className="checkout-container">
        <button
          type="button"
          onClick={() => navigate("/menu")}
          className="checkout-back"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour au menu" : "Back to menu"}
        </button>

        <section className="checkout-hero">
          <div className="checkout-hero-copy">
            <span className="checkout-hero-icon">
              <Sparkles className="h-5 w-5" />
            </span>

            <div>
              <p className="checkout-eyebrow">
                {step === "paymentChoice" || step === "payment"
                  ? lang === "fr"
                    ? "Dernière étape"
                    : "Final step"
                  : lang === "fr"
                    ? "Encore quelques détails"
                    : "Just a few details"}
              </p>

              <h1>
                {step === "paymentChoice" || step === "payment"
                  ? t("checkout.paymentTitle", "Paiement")
                  : t("checkout.title", "Finaliser ma commande")}
              </h1>

              <p className="checkout-hero-description">
                {step === "paymentChoice" || step === "payment"
                  ? lang === "fr"
                    ? "Votre commande est enregistrée. Finalisez votre paiement en toute sécurité."
                    : "Your order is saved. Complete your secure payment."
                  : lang === "fr"
                    ? "Choisissez votre mode de réception, indiquez vos coordonnées et notre équipe s’occupe du reste."
                    : "Choose pickup or delivery, enter your details and our team will take care of the rest."}
              </p>
            </div>
          </div>

          <div className="checkout-hero-badges">
            <span>
              <Clock3 className="h-4 w-4" />
              {orderType === "emporter" ? "15–20 min" : "30–45 min"}
            </span>
            <span>
              <ShoppingBag className="h-4 w-4" />
              {itemCount}{" "}
              {lang === "fr"
                ? itemCount > 1
                  ? "articles"
                  : "article"
                : itemCount > 1
                  ? "items"
                  : "item"}
            </span>
          </div>
        </section>

        <div className="checkout-progress">
          <span className="checkout-progress-step is-active">
            <ShoppingBag className="h-4 w-4" />
            {lang === "fr" ? "Panier" : "Cart"}
          </span>
          <span className="checkout-progress-line is-active" />
          <span
            className={`checkout-progress-step ${
              step !== "success" ? "is-active" : ""
            }`}
          >
            <User className="h-4 w-4" />
            {lang === "fr" ? "Informations" : "Details"}
          </span>
          <span
            className={`checkout-progress-line ${
              step === "paymentChoice" || step === "payment" ? "is-active" : ""
            }`}
          />
          <span
            className={`checkout-progress-step ${
              step === "paymentChoice" || step === "payment" ? "is-active" : ""
            }`}
          >
            <CreditCard className="h-4 w-4" />
            {lang === "fr" ? "Paiement" : "Payment"}
          </span>
        </div>

        <div className="checkout-mobile-summary">
          <OrderSummary
            subtotal={orderResult ? orderResult.subtotal : subtotal}
            deliveryFee={
              step === "payment"
                ? (orderResult?.deliveryFee ?? null)
                : orderType === "livraison"
                  ? (deliveryInfo?.fee ?? null)
                  : null
            }
            total={orderResult ? orderResult.total : currentTotal}
            orderType={orderType}
            discountAmount={couponDiscountAmount}
          />
        </div>

        <div ref={checkoutLayoutRef} className="checkout-layout">
          <div className="checkout-main-column">
            {step === "form" && (
              <form
                onSubmit={handleContinueToPayment}
                className="checkout-form"
              >
                <SectionCard
                  eyebrow={
                    lang === "fr"
                      ? "Comment souhaitez-vous recevoir votre commande ?"
                      : "How would you like to receive your order?"
                  }
                  title={lang === "fr" ? "Mode de réception" : "Order method"}
                  icon={<PackageCheck className="h-5 w-5" />}
                >
                  <div className="checkout-choice-grid">
                    <button
                      type="button"
                      onClick={() => setOrderType("emporter")}
                      className={`checkout-choice-card ${
                        orderType === "emporter" ? "is-selected" : ""
                      }`}
                    >
                      <span className="checkout-choice-icon">
                        <Store className="h-6 w-6" />
                      </span>
                      <span>
                        <strong>
                          {lang === "fr" ? "À emporter" : "Pickup"}
                        </strong>
                        <small>
                          {lang === "fr"
                            ? "Prêt en 15–20 minutes"
                            : "Ready in 15–20 minutes"}
                        </small>
                      </span>
                      <span className="checkout-choice-check">
                        <Check className="h-4 w-4" />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("livraison")}
                      className={`checkout-choice-card ${
                        orderType === "livraison" ? "is-selected" : ""
                      }`}
                    >
                      <span className="checkout-choice-icon">
                        <Truck className="h-6 w-6" />
                      </span>
                      <span>
                        <strong>
                          {lang === "fr" ? "Livraison" : "Delivery"}
                        </strong>
                        <small>
                          {lang === "fr"
                            ? "Chez vous en 30–45 minutes"
                            : "At your door in 30–45 minutes"}
                        </small>
                      </span>
                      <span className="checkout-choice-check">
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow={
                    lang === "fr"
                      ? "Choisissez votre moment"
                      : "Choose your moment"
                  }
                  title={lang === "fr" ? "Date et heure" : "Date and time"}
                  icon={<CalendarDays className="h-5 w-5" />}
                >
                  <div className="checkout-fields-grid checkout-datetime-grid">
                    {" "}
                    <FieldShell
                      label={
                        lang === "fr" ? "Date souhaitée" : "Preferred date"
                      }
                      icon={<CalendarDays className="h-4 w-4" />}
                    >
                      <input
                        type="date"
                        name="requestedDate"
                        required
                        min={getMinDate()}
                        value={form.requestedDate}
                        onChange={handleChange}
                      />
                    </FieldShell>
                    <FieldShell
                      label={
                        lang === "fr" ? "Heure souhaitée" : "Preferred time"
                      }
                      icon={<Clock3 className="h-4 w-4" />}
                    >
                      <input
                        type="time"
                        name="requestedTime"
                        required
                        value={form.requestedTime}
                        onChange={handleChange}
                      />
                    </FieldShell>
                  </div>

                  {form.requestedDate &&
                    form.requestedTime &&
                    !slotIsValid &&
                    nextSlotSuggestion && (
                      <div className="checkout-delivery-status is-warning">
                        <Clock3 className="h-4 w-4" />
                        <span>
                          {lang === "fr"
                            ? `Cet horaire n'est pas disponible (restaurant fermé ou délai insuffisant). Prochain créneau : ${nextSlotSuggestion.date} à ${nextSlotSuggestion.time}.`
                            : `This time slot isn't available (restaurant closed or not enough lead time). Next available slot: ${nextSlotSuggestion.date} at ${nextSlotSuggestion.time}.`}
                        </span>
                      </div>
                    )}
                </SectionCard>

                <SectionCard
                  eyebrow={
                    lang === "fr"
                      ? "Pour vous contacter facilement"
                      : "So we can contact you easily"
                  }
                  title={lang === "fr" ? "Vos coordonnées" : "Your details"}
                  icon={<User className="h-5 w-5" />}
                >
                  <div className="checkout-fields-grid">
                    <FieldShell
                      label={lang === "fr" ? "Prénom" : "First name"}
                      icon={<User className="h-4 w-4" />}
                    >
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder={
                          lang === "fr" ? "Votre prénom" : "Your first name"
                        }
                      />
                    </FieldShell>

                    <FieldShell
                      label={lang === "fr" ? "Nom" : "Last name"}
                      icon={<User className="h-4 w-4" />}
                    >
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder={
                          lang === "fr" ? "Votre nom" : "Your last name"
                        }
                      />
                    </FieldShell>

                    <FieldShell
                      label="Email"
                      icon={<Mail className="h-4 w-4" />}
                    >
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder={
                          lang === "fr" ? "vous@email.com" : "you@email.com"
                        }
                      />
                      {isTalintsDomain && verificationStatus === "verified" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 8,
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: "rgba(31,107,45,0.10)",
                            color: GREEN,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          🎉{" "}
                          {lang === "fr"
                            ? "Réduction employé Talints activée (-60%)"
                            : "Talints employee discount active (-60%)"}
                        </span>
                      )}

                      {isTalintsDomain && verificationStatus === "idle" && (
                        <button
                          type="button"
                          onClick={sendVerificationCode}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 8,
                            padding: "7px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(31,107,45,0.25)",
                            background: "rgba(31,107,45,0.06)",
                            color: DARK_GREEN,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {lang === "fr"
                            ? "Vérifier cet email Talints"
                            : "Verify this Talints email"}
                        </button>
                      )}

                      {isTalintsDomain && verificationStatus === "sending" && (
                        <span
                          style={{
                            display: "block",
                            marginTop: 8,
                            fontSize: 11,
                            color: "#8b8983",
                          }}
                        >
                          {lang === "fr" ? "Envoi du code…" : "Sending code…"}
                        </span>
                      )}

                      {isTalintsDomain &&
                        (verificationStatus === "sent" ||
                          verificationStatus === "verifying") && (
                          <div style={{ marginTop: 8 }}>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#8b8983",
                                marginBottom: 6,
                              }}
                            >
                              {lang === "fr"
                                ? "Entrez le code reçu par email"
                                : "Enter the code you received by email"}
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                                placeholder="123456"
                                maxLength={6}
                                style={{
                                  width: 100,
                                  minHeight: 40,
                                  padding: "0 12px",
                                  borderRadius: 10,
                                  border: "1px solid rgba(31,107,45,0.18)",
                                  outline: "none",
                                  fontSize: 14,
                                }}
                              />
                              <button
                                type="button"
                                onClick={verifyEmailCode}
                                disabled={
                                  !verificationCode.trim() ||
                                  verificationStatus === "verifying"
                                }
                                style={{
                                  padding: "0 16px",
                                  borderRadius: 10,
                                  background: GREEN,
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: 12,
                                  opacity: !verificationCode.trim() ? 0.6 : 1,
                                }}
                              >
                                {verificationStatus === "verifying"
                                  ? lang === "fr"
                                    ? "…"
                                    : "…"
                                  : lang === "fr"
                                    ? "Valider"
                                    : "Confirm"}
                              </button>
                            </div>
                          </div>
                        )}

                      {isTalintsDomain && verificationMessage && (
                        <p
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color:
                              verificationStatus === "verified"
                                ? GREEN
                                : "#c0504d",
                          }}
                        >
                          {verificationMessage}
                        </p>
                      )}
                    </FieldShell>

                    <FieldShell
                      label={lang === "fr" ? "Téléphone" : "Phone"}
                      icon={<Phone className="h-4 w-4" />}
                    >
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+33 6 00 00 00 00"
                      />
                    </FieldShell>
                  </div>
                </SectionCard>

                {orderType === "livraison" && (
                  <SectionCard
                    eyebrow={
                      lang === "fr"
                        ? "Où devons-nous vous livrer ?"
                        : "Where should we deliver?"
                    }
                    title={
                      lang === "fr"
                        ? "Adresse de livraison"
                        : "Delivery address"
                    }
                    icon={<MapPin className="h-5 w-5" />}
                  >
                    <div className="checkout-address-grid">
                      <DeliveryAddressPicker
                        lang={lang}
                        value={form.addressStreet}
                        postalCode={form.postalCode}
                        city={form.city}
                        onSelect={handleAddressSelect}
                      />

                      <FieldShell
                        label={
                          lang === "fr" ? "Complément" : "Additional details"
                        }
                        icon={<MapPin className="h-4 w-4" />}
                      >
                        <input
                          type="text"
                          name="addressExtra"
                          placeholder={t(
                            "checkout.extraPlaceholder",
                            "Bâtiment, étage, code (facultatif)",
                          )}
                          value={form.addressExtra}
                          onChange={handleChange}
                        />
                      </FieldShell>

                      <div className="checkout-fields-grid">
                        <FieldShell
                          label={lang === "fr" ? "Code postal" : "Postal code"}
                          icon={<MapPin className="h-4 w-4" />}
                        >
                          <input
                            type="text"
                            name="postalCode"
                            required
                            readOnly
                            placeholder="75011"
                            value={form.postalCode}
                            onChange={handleChange}
                          />
                        </FieldShell>

                        <FieldShell
                          label={lang === "fr" ? "Ville" : "City"}
                          icon={<MapPin className="h-4 w-4" />}
                        >
                          <input
                            type="text"
                            name="city"
                            required
                            readOnly
                            placeholder="Paris"
                            value={form.city}
                            onChange={handleChange}
                          />
                        </FieldShell>
                      </div>
                    </div>

                    {deliveryInfo && (
                      <div
                        className={`checkout-delivery-status ${
                          deliveryInfo.meetsMinimum ? "is-valid" : "is-warning"
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                        <span>
                          {deliveryInfo.minimum
                            ? t(
                                "checkout.zoneMinimum",
                                `Minimum de commande pour cette zone : ${deliveryInfo.minimum}€`,
                              )
                            : t(
                                "checkout.noMinimum",
                                "Aucun minimum pour cette zone",
                              )}
                          {" · "}
                          {t(
                            "checkout.deliveryFeeLabel",
                            "Frais de livraison",
                          )}{" "}
                          :{" "}
                          {deliveryInfo.fee === 0
                            ? t("checkout.free", "gratuite")
                            : formatEuro(deliveryInfo.fee)}
                        </span>
                      </div>
                    )}
                  </SectionCard>
                )}

                <SectionCard
                  eyebrow={
                    lang === "fr"
                      ? "Un petit détail pour notre équipe ?"
                      : "Anything our team should know?"
                  }
                  title={
                    lang === "fr" ? "Demande particulière" : "Special request"
                  }
                  icon={<Gift className="h-5 w-5" />}
                >
                  <div className="checkout-note-chips">
                    {quickNotes[lang].map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => addQuickNote(note)}
                      >
                        {note}
                      </button>
                    ))}
                  </div>

                  <textarea
                    name="note"
                    rows={4}
                    value={form.note}
                    onChange={handleChange}
                    placeholder={
                      lang === "fr"
                        ? "Allergie, bougies, sauce à part, instructions particulières…"
                        : "Allergy, candles, sauce on the side, special instructions…"
                    }
                  />
                </SectionCard>

                {errorMessage && (
                  <div className="checkout-error">{errorMessage}</div>
                )}

                <button
                  ref={paymentStopRef}
                  type="submit"
                  className="checkout-primary-button"
                >
                  <span>
                    {lang === "fr"
                      ? "Continuer vers le paiement"
                      : "Continue to payment"}
                  </span>

                  <span className="checkout-primary-button-icon">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </form>
            )}

            {step === "paymentChoice" && (
              <div className="checkout-payment-step">
                <button
                  type="button"
                  onClick={returnToInformation}
                  className="checkout-step-back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {lang === "fr"
                    ? "Modifier mes informations"
                    : "Edit my information"}
                </button>

                <SectionCard
                  eyebrow={
                    lang === "fr" ? "Tout est prêt" : "Everything is ready"
                  }
                  title={
                    lang === "fr"
                      ? "Choisissez votre paiement"
                      : "Choose your payment"
                  }
                  icon={<WalletCards className="h-5 w-5" />}
                >
                  <div className="checkout-details-recap">
                    <div>
                      <span>
                        {orderType === "livraison" ? (
                          <Truck className="h-4 w-4" />
                        ) : (
                          <Store className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <small>
                          {lang === "fr" ? "Réception" : "Order method"}
                        </small>
                        <strong>
                          {orderType === "livraison"
                            ? lang === "fr"
                              ? "Livraison"
                              : "Delivery"
                            : lang === "fr"
                              ? "À emporter"
                              : "Pickup"}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span>
                        <CalendarDays className="h-4 w-4" />
                      </span>
                      <div>
                        <small>{lang === "fr" ? "Créneau" : "Time slot"}</small>
                        <strong>
                          {form.requestedDate} · {form.requestedTime}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span>
                        <User className="h-4 w-4" />
                      </span>
                      <div>
                        <small>{lang === "fr" ? "Client" : "Customer"}</small>
                        <strong>
                          {form.firstName} {form.lastName}
                        </strong>
                      </div>
                    </div>

                    {orderType === "livraison" && (
                      <div className="is-wide">
                        <span>
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div>
                          <small>
                            {lang === "fr" ? "Livraison" : "Delivery"}
                          </small>
                          <strong>
                            {[form.addressStreet, form.postalCode, form.city]
                              .filter(Boolean)
                              .join(", ")}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="checkout-payment-grid">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("carte")}
                      className={`checkout-payment-card ${
                        paymentMethod === "carte" ? "is-selected" : ""
                      }`}
                    >
                      <span className="checkout-payment-card-icon">
                        <CreditCard className="h-6 w-6" />
                      </span>
                      <span>
                        <strong>
                          {lang === "fr"
                            ? "Carte / Apple Pay / Google Pay"
                            : "Card / Apple Pay / Google Pay"}
                        </strong>
                        <small>
                          {lang === "fr"
                            ? "Paiement sécurisé en ligne"
                            : "Secure online payment"}
                        </small>
                      </span>
                      <span className="checkout-choice-check">
                        <Check className="h-4 w-4" />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("sur_place")}
                      className={`checkout-payment-card ${
                        paymentMethod === "sur_place" ? "is-selected" : ""
                      }`}
                    >
                      <span className="checkout-payment-card-icon">
                        <Store className="h-6 w-6" />
                      </span>
                      <span>
                        <strong>
                          {lang === "fr" ? "Payer sur place" : "Pay on site"}
                        </strong>
                        <small>
                          {lang === "fr"
                            ? orderType === "livraison"
                              ? "À la réception de votre commande"
                              : "Au retrait de votre commande"
                            : orderType === "livraison"
                              ? "When your order arrives"
                              : "When collecting your order"}
                        </small>
                      </span>
                      <span className="checkout-choice-check">
                        <Check className="h-4 w-4" />
                      </span>
                    </button>
                  </div>

                  <div style={{ marginTop: 18, marginBottom: 8 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: DARK_GREEN,
                        marginBottom: 6,
                      }}
                    >
                      {lang === "fr" ? "Code promo" : "Promo code"}
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponStatus("idle");
                        }}
                        placeholder="MISS-XXXXXXX"
                        style={{
                          flex: 1,
                          minHeight: 46,
                          padding: "0 14px",
                          borderRadius: 12,
                          border: `1px solid ${couponStatus === "invalid" ? "#c0504d" : "rgba(31,107,45,0.18)"}`,
                          outline: "none",
                          fontSize: 14,
                        }}
                      />
                      <button
                        type="button"
                        onClick={checkCoupon}
                        disabled={
                          !couponCode.trim() || couponStatus === "checking"
                        }
                        style={{
                          padding: "0 18px",
                          borderRadius: 12,
                          background: GREEN,
                          color: "white",
                          fontWeight: 700,
                          fontSize: 13,
                          opacity:
                            !couponCode.trim() || couponStatus === "checking"
                              ? 0.6
                              : 1,
                        }}
                      >
                        {couponStatus === "checking"
                          ? lang === "fr"
                            ? "Vérification…"
                            : "Checking…"
                          : lang === "fr"
                            ? "Appliquer"
                            : "Apply"}
                      </button>
                    </div>
                    {couponMessage && (
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: couponStatus === "valid" ? GREEN : "#c0504d",
                        }}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="checkout-error checkout-payment-error">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="checkout-primary-button checkout-payment-submit"
                    >
                      <span>
                        {submitting
                          ? t("checkout.processing", "Traitement…")
                          : paymentMethod === "carte"
                            ? lang === "fr"
                              ? `Payer ${formatEuro(currentTotal)}`
                              : `Pay ${formatEuro(currentTotal)}`
                            : lang === "fr"
                              ? "Confirmer ma commande"
                              : "Confirm my order"}
                      </span>

                      <span className="checkout-primary-button-icon">
                        {submitting ? (
                          <span className="checkout-spinner" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  </form>
                </SectionCard>
              </div>
            )}

            {step === "payment" && clientSecret && stripePromise && (
              <SectionCard
                eyebrow={
                  lang === "fr"
                    ? "Transaction protégée"
                    : "Protected transaction"
                }
                title={
                  lang === "fr"
                    ? "Finalisez votre paiement"
                    : "Complete your payment"
                }
                icon={<ShieldCheck className="h-5 w-5" />}
              >
                {errorMessage && (
                  <div className="checkout-error">{errorMessage}</div>
                )}

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: GREEN,
                        colorBackground: PAPER,
                        colorText: DARK_GREEN,
                        borderRadius: "14px",
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={setErrorMessage}
                  />
                </Elements>
              </SectionCard>
            )}
          </div>

          <div ref={desktopSummaryRef} className="checkout-desktop-summary">
            <OrderSummary
              subtotal={orderResult ? orderResult.subtotal : subtotal}
              deliveryFee={
                step === "payment"
                  ? (orderResult?.deliveryFee ?? null)
                  : orderType === "livraison"
                    ? (deliveryInfo?.fee ?? null)
                    : null
              }
              total={orderResult ? orderResult.total : currentTotal}
              orderType={orderType}
              discountAmount={couponDiscountAmount}
            />
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .checkout-page {
          position: relative;
          /* IMPORTANT:
             overflow-x:hidden creates a scrolling ancestor and prevents
             the order summary from sticking to the viewport correctly.
             clip still hides horizontal overflow without breaking sticky. */
          overflow-x: clip;
          overflow-y: visible;
          color: #343431;
        }

        .checkout-page::before,
        .checkout-page::after {
          content: "";
          position: fixed;
          z-index: 0;
          width: 420px;
          height: 420px;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
        }

        .checkout-page::before {
          left: -210px;
          top: 140px;
          background:
            radial-gradient(circle, rgba(31,107,45,.10), transparent 70%);
        }

        .checkout-page::after {
          right: -220px;
          bottom: 30px;
          background:
            radial-gradient(circle, rgba(196,125,14,.12), transparent 70%);
        }

        .checkout-container {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 116px 0 80px;
        }

        .checkout-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          color: ${GREEN};
          font-size: 13px;
          font-weight: 700;
          transition: transform .25s ease, opacity .25s ease;
        }

        .checkout-back:hover {
          transform: translateX(-4px);
          opacity: .78;
        }

        .checkout-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          overflow: hidden;
          border: 1px solid rgba(31,107,45,.10);
          border-radius: 32px;
          padding: 28px 30px;
          background:
            radial-gradient(circle at right top, rgba(196,125,14,.14), transparent 34%),
            linear-gradient(145deg, rgba(255,255,255,.96), rgba(250,244,232,.96));
          box-shadow: 0 24px 60px rgba(31,60,30,.10);
        }

        .checkout-hero-copy {
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }

        .checkout-hero-icon {
          display: flex;
          width: 52px;
          height: 52px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          color: #fff8d8;
          background: linear-gradient(135deg, ${AMBER}, ${GOLD});
          box-shadow: 0 14px 28px rgba(196,125,14,.24);
        }

        .checkout-eyebrow {
          color: ${AMBER};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .24em;
          text-transform: uppercase;
        }

        .checkout-hero h1 {
          margin-top: 5px;
          color: ${DARK_GREEN};
          font-family: "Playfair Display", serif;
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.04;
        }

        .checkout-hero-description {
          max-width: 650px;
          margin-top: 10px;
          color: #6d6b66;
          font-size: 14px;
          line-height: 1.7;
        }

        .checkout-hero-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .checkout-hero-badges span {
          display: inline-flex;
          min-width: 130px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(31,107,45,.11);
          border-radius: 999px;
          padding: 10px 14px;
          color: ${DARK_GREEN};
          background: rgba(255,255,255,.72);
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 10px 24px rgba(31,60,30,.06);
        }

        .checkout-progress {
          display: flex;
          max-width: 720px;
          align-items: center;
          justify-content: center;
          margin: 22px auto 28px;
        }

        .checkout-progress-step {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #9d9a92;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          transition: color .3s ease;
        }

        .checkout-progress-step.is-active {
          color: ${GREEN};
        }

        .checkout-progress-line {
          width: 80px;
          height: 1px;
          margin: 0 14px;
          background: #ded8cc;
          transition: background .3s ease;
        }

        .checkout-progress-line.is-active {
          background: linear-gradient(90deg, ${GREEN}, ${GOLD});
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
          align-items: start;
        }

        /* Mobile gets its own sticky summary outside the grid.
           Because its containing block is the whole checkout container,
           it can follow the customer for the entire form instead of
           being trapped inside a one-row mobile grid cell. */
        .checkout-mobile-summary {
          display: none;
        }

        .checkout-desktop-summary {
          min-width: 0;
          align-self: start;
        }

        .checkout-main-column,
        .checkout-form {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 20px;
        }

        .checkout-section-card,
        .checkout-summary {
          border: 1px solid rgba(31,107,45,.10);
          background: rgba(255,253,248,.94);
          box-shadow: 0 22px 54px rgba(31,60,30,.08);
        }

        .checkout-section-card {
          border-radius: 28px;
          padding: 24px;
          animation: checkoutCardIn .55s cubic-bezier(.16,1,.3,1) both;
        }

        .checkout-section-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .checkout-section-heading p {
          color: ${AMBER};
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .checkout-section-heading h2 {
          margin-top: 3px;
          color: ${DARK_GREEN};
          font-family: "Playfair Display", serif;
          font-size: 22px;
        }

        .checkout-section-icon {
          display: flex;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: ${GREEN};
          background: rgba(31,107,45,.08);
        }

        .checkout-choice-grid,
        .checkout-payment-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .checkout-choice-card,
        .checkout-payment-card {
          position: relative;
          display: flex;
          min-height: 118px;
          align-items: center;
          gap: 14px;
          overflow: hidden;
          border: 1px solid rgba(31,107,45,.12);
          border-radius: 22px;
          padding: 18px;
          text-align: left;
          background: white;
          transition:
            transform .3s cubic-bezier(.16,1,.3,1),
            border-color .3s ease,
            box-shadow .3s ease,
            background .3s ease;
        }

        .checkout-choice-card:hover,
        .checkout-payment-card:hover {
          transform: translateY(-4px);
          border-color: rgba(31,107,45,.30);
          box-shadow: 0 16px 30px rgba(31,60,30,.09);
        }

        .checkout-choice-card.is-selected,
        .checkout-payment-card.is-selected {
          border-color: rgba(196,125,14,.35);
          background:
            radial-gradient(circle at right top, rgba(210,166,25,.14), transparent 42%),
            linear-gradient(145deg, rgba(31,107,45,.07), rgba(255,255,255,.98));
          box-shadow:
            0 18px 34px rgba(31,107,45,.12),
            inset 0 0 0 1px rgba(196,125,14,.08);
        }

        .checkout-choice-card.is-selected::after,
        .checkout-payment-card.is-selected::after {
          content: "";
          position: absolute;
          inset: -70% auto auto -30%;
          width: 42px;
          height: 260%;
          opacity: .75;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent);
          transform: rotate(24deg);
          animation: checkoutChoiceShine 2.8s ease-in-out infinite;
        }

        .checkout-choice-icon,
        .checkout-payment-card-icon {
          display: flex;
          width: 48px;
          height: 48px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: ${GREEN};
          background: rgba(31,107,45,.09);
        }

        .checkout-choice-card strong,
        .checkout-payment-card strong {
          display: block;
          color: ${DARK_GREEN};
          font-size: 14px;
        }

        .checkout-choice-card small,
        .checkout-payment-card small {
          display: block;
          margin-top: 5px;
          color: #8b8983;
          font-size: 11px;
          line-height: 1.45;
        }

        .checkout-choice-check {
          position: absolute;
          right: 14px;
          top: 14px;
          display: flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          border: 1px solid #d9d5cb;
          border-radius: 999px;
          color: transparent;
          background: #fff;
          transition: color .25s ease, background .25s ease, transform .25s ease;
        }

        .is-selected .checkout-choice-check {
          color: white;
          background: ${GREEN};
          transform: scale(1.06);
        }

.checkout-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}



        .checkout-address-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .checkout-field {
          display: block;
          min-width: 0;
        }

        .checkout-field-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: ${DARK_GREEN};
          font-size: 11px;
          font-weight: 700;
        }

        .checkout-field input,
        .checkout-section-card textarea {
          width: 100%;
          border: 1px solid rgba(31,107,45,.13);
          border-radius: 16px;
          outline: none;
          color: #31312f;
          background: #fff;
          font-size: 14px;
          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            transform .25s ease;
        }

        .checkout-field input {
          min-height: 52px;
          padding: 0 15px;
        }

        .checkout-section-card textarea {
          min-height: 125px;
          resize: vertical;
          padding: 14px 15px;
        }

        .checkout-field input:focus,
        .checkout-section-card textarea:focus {
          border-color: rgba(31,107,45,.55);
          box-shadow:
            0 0 0 4px rgba(31,107,45,.07),
            0 13px 26px rgba(31,60,30,.06);
          transform: translateY(-1px);
        }

        .checkout-field input::placeholder,
        .checkout-section-card textarea::placeholder {
          color: #aaa69d;
        }

        .checkout-address-search {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .checkout-address-search-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .checkout-address-search-top p {
          max-width: 520px;
          margin-top: 4px;
          color: #8c8981;
          font-size: 11px;
          line-height: 1.55;
        }

        .checkout-map-button {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(31,107,45,.18);
          border-radius: 14px;
          padding: 10px 13px;
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.065);
          font-size: 11px;
          font-weight: 800;
          transition:
            transform .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .checkout-map-button:hover {
          transform: translateY(-2px);
          background: rgba(31,107,45,.11);
          box-shadow: 0 12px 22px rgba(31,60,30,.08);
        }

        .checkout-autocomplete-host {
          position: relative;
          z-index: 12;
          width: 100%;
          min-height: 54px;
        }

        .checkout-google-autocomplete,
        .checkout-autocomplete-host gmp-place-autocomplete {
          display: block;
          width: 100%;
          color-scheme: light;
        }

        .checkout-google-autocomplete {
          --gmp-mat-color-surface: #ffffff;
          --gmp-mat-color-on-surface: #31312f;
          --gmp-mat-color-primary: ${GREEN};
          --gmp-mat-font-family: inherit;
          border: 1px solid rgba(31,107,45,.13);
          border-radius: 16px;
          background: white;
          box-shadow: none;
        }

        .checkout-selected-address {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(31,107,45,.10);
          border-radius: 15px;
          padding: 11px 13px;
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.055);
        }

        .checkout-selected-address > span {
          display: flex;
          width: 24px;
          height: 24px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: white;
          background: ${GREEN};
        }

        .checkout-selected-address strong {
          display: block;
          font-size: 11px;
        }

        .checkout-selected-address p {
          margin-top: 3px;
          color: #74716a;
          font-size: 11px;
          line-height: 1.5;
        }

        .checkout-map-error {
          border: 1px solid rgba(165,51,51,.12);
          border-radius: 14px;
          padding: 10px 12px;
          color: #9f3f3f;
          background: rgba(220,80,80,.08);
          font-size: 11px;
        }

        .checkout-map-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(16,36,20,.48);
          backdrop-filter: blur(12px);
          animation: checkoutMapFade .25s ease both;
        }

        .checkout-map-modal {
          display: flex;
          width: min(940px, 100%);
          max-height: min(820px, calc(100dvh - 40px));
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.70);
          border-radius: 30px;
          background: ${PAPER};
          box-shadow: 0 36px 100px rgba(18,63,29,.28);
          animation: checkoutMapIn .45s cubic-bezier(.16,1,.3,1) both;
        }

        .checkout-map-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 24px 18px;
          background:
            radial-gradient(circle at right top, rgba(196,125,14,.13), transparent 36%),
            linear-gradient(145deg, #fffdf8, #faf4e8);
        }

        .checkout-map-header h3 {
          margin-top: 4px;
          color: ${DARK_GREEN};
          font-family: "Playfair Display", serif;
          font-size: 28px;
        }

        .checkout-map-header span {
          display: block;
          margin-top: 6px;
          color: #817e76;
          font-size: 12px;
        }

        .checkout-map-close {
          display: flex;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(31,107,45,.12);
          border-radius: 999px;
          color: ${DARK_GREEN};
          background: rgba(255,255,255,.70);
          transition: transform .25s ease, background .25s ease;
        }

    .checkout-map-close:hover {
  transform: rotate(7deg) scale(1.05);
  background: white;
}

.checkout-map-canvas-wrap {
  position: relative;
  height: min(420px, 50dvh);
  flex: 0 0 auto;
  background: #ece8de;
}

.checkout-map-canvas {
  position: absolute;
  inset: 0;
}



        .checkout-current-location {
          position: absolute;
          left: 18px;
          bottom: 18px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 11px 15px;
          color: ${DARK_GREEN};
          background: rgba(255,255,255,.94);
          box-shadow: 0 14px 30px rgba(31,60,30,.18);
          font-size: 11px;
          font-weight: 800;
          backdrop-filter: blur(10px);
        }

        .checkout-current-location:disabled {
          cursor: wait;
          opacity: .68;
        }

        .checkout-map-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 22px;
          border-top: 1px solid rgba(31,107,45,.10);
          background: #fff;
        }

        .checkout-map-address-preview {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 11px;
          color: ${GREEN};
        }

        .checkout-map-address-preview strong {
          display: block;
          color: ${DARK_GREEN};
          font-size: 12px;
        }

        .checkout-map-address-preview p {
          max-width: 560px;
          margin-top: 3px;
          overflow: hidden;
          color: #77746d;
          font-size: 11px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .checkout-map-confirm {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 16px;
          padding: 13px 17px;
          color: white;
          background: linear-gradient(135deg, ${GREEN}, #2d8a3e);
          box-shadow: 0 14px 26px rgba(31,107,45,.22);
          font-size: 12px;
          font-weight: 800;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .checkout-map-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(31,107,45,.28);
        }

        .checkout-map-confirm:disabled {
          cursor: not-allowed;
          opacity: .45;
        }

        .checkout-field input[readonly] {
          cursor: default;
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.045);
        }

        .checkout-note-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .checkout-note-chips button {
          border: 1px solid rgba(31,107,45,.11);
          border-radius: 999px;
          padding: 8px 11px;
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.045);
          font-size: 11px;
          font-weight: 600;
          transition: transform .2s ease, background .2s ease;
        }

        .checkout-note-chips button:hover {
          transform: translateY(-2px);
          background: rgba(31,107,45,.10);
        }

        .checkout-delivery-status,
        .checkout-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          border-radius: 15px;
          padding: 12px 14px;
          font-size: 12px;
          line-height: 1.55;
        }

        .checkout-delivery-status {
          margin-top: 15px;
        }

        .checkout-delivery-status.is-valid {
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.08);
        }

        .checkout-delivery-status.is-warning {
          color: #925a06;
          background: rgba(196,125,14,.10);
        }

        .checkout-error {
          border: 1px solid rgba(165,51,51,.12);
          color: #9f3f3f;
          background: rgba(220,80,80,.08);
        }

        .checkout-payment-step {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: checkoutCardIn .5s cubic-bezier(.16,1,.3,1) both;
        }

        .checkout-step-back {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 9px 13px;
          color: ${GREEN};
          background: rgba(255,255,255,.68);
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 10px 24px rgba(31,60,30,.06);
          transition: transform .25s ease, background .25s ease;
        }

        .checkout-step-back:hover {
          transform: translateX(-4px);
          background: white;
        }

        .checkout-details-recap {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .checkout-details-recap > div {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(31,107,45,.10);
          border-radius: 16px;
          padding: 12px;
          background: rgba(31,107,45,.045);
        }

        .checkout-details-recap > div.is-wide {
          grid-column: 1 / -1;
        }

        .checkout-details-recap > div > span {
          display: flex;
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: ${GREEN};
          background: white;
        }

        .checkout-details-recap small,
        .checkout-details-recap strong {
          display: block;
        }

        .checkout-details-recap small {
          color: #918e86;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .checkout-details-recap strong {
          margin-top: 3px;
          overflow: hidden;
          color: ${DARK_GREEN};
          font-size: 12px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .checkout-payment-error {
          margin-top: 14px;
        }

        .checkout-payment-submit {
          margin-top: 16px;
        }

        .checkout-primary-button {
          position: relative;
          display: flex;
          width: 100%;
          min-height: 58px;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          border-radius: 19px;
          padding: 8px 9px 8px 22px;
          color: white;
          background: linear-gradient(135deg, ${GREEN}, #2d8a3e);
          box-shadow: 0 17px 32px rgba(31,107,45,.22);
          font-size: 14px;
          font-weight: 800;
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .checkout-primary-button::before {
          content: "";
          position: absolute;
          left: -70px;
          top: -30px;
          width: 42px;
          height: 120px;
          opacity: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.68), transparent);
          transform: rotate(24deg);
          transition: left .6s ease, opacity .3s ease;
        }

        .checkout-primary-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 23px 38px rgba(31,107,45,.29);
        }

        .checkout-primary-button:hover::before {
          left: calc(100% + 35px);
          opacity: .9;
        }

        .checkout-primary-button:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .checkout-primary-button-icon {
          position: relative;
          z-index: 2;
          display: flex;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,.14);
          transition: transform .3s ease;
        }

        .checkout-primary-button:hover .checkout-primary-button-icon {
          transform: translateX(3px);
        }

        .checkout-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: white;
          border-radius: 999px;
          animation: checkoutSpin .7s linear infinite;
        }

        .checkout-desktop-summary {
          position: relative;
          align-self: start;
          height: max-content;
          min-width: 0;
          z-index: 20;
        }

        .checkout-summary {
          position: relative;
          height: fit-content;
          overflow: hidden;
          border-radius: 28px;
          padding: 22px;
        }

        .checkout-summary::before {
          content: "";
          position: absolute;
          right: -90px;
          top: -90px;
          width: 210px;
          height: 210px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(196,125,14,.12), transparent 68%);
          pointer-events: none;
        }

        .checkout-summary-top {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .checkout-summary-top h2 {
          margin-top: 3px;
          color: ${DARK_GREEN};
          font-family: "Playfair Display", serif;
          font-size: 23px;
        }

        .checkout-summary-bag {
          display: flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          color: white;
          background: ${GREEN};
          box-shadow: 0 10px 22px rgba(31,107,45,.18);
        }

        .checkout-summary-items {
          position: relative;
          display: flex;
          max-height: 360px;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          margin-top: 20px;
          padding-right: 3px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .checkout-summary-items::-webkit-scrollbar {
          display: none;
        }

        .checkout-summary-item {
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid rgba(31,107,45,.08);
          border-radius: 17px;
          padding: 9px;
          background: rgba(255,255,255,.82);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .checkout-summary-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(31,60,30,.07);
        }

        .checkout-summary-item img {
          width: 54px;
          height: 54px;
          flex: 0 0 auto;
          border-radius: 14px;
          object-fit: cover;
        }

        .checkout-summary-item-name {
          overflow: hidden;
          color: ${DARK_GREEN};
          font-size: 12px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .checkout-summary-item-meta {
          margin-top: 4px;
          color: #9b978f;
          font-size: 10px;
        }

        .checkout-summary-item > strong {
          color: ${AMBER};
          font-size: 12px;
          white-space: nowrap;
        }

        .checkout-summary-divider {
          height: 1px;
          margin: 18px 0;
          background: linear-gradient(90deg, transparent, rgba(31,107,45,.18), transparent);
        }

        .checkout-summary-lines {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkout-summary-lines > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: #77746d;
          font-size: 12px;
        }

        .checkout-summary-lines strong {
          color: ${DARK_GREEN};
        }

        .checkout-summary-total {
          margin-top: 4px;
          padding-top: 12px;
          border-top: 1px solid rgba(31,107,45,.10);
          font-size: 15px !important;
          font-weight: 800;
        }

        .checkout-summary-total strong {
          color: ${AMBER};
          font-family: "Playfair Display", serif;
          font-size: 24px;
        }

        .checkout-summary-time {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          border-radius: 17px;
          padding: 12px;
          color: ${DARK_GREEN};
          background: rgba(31,107,45,.065);
        }

        .checkout-summary-time p {
          color: #7c7972;
          font-size: 10px;
        }

        .checkout-summary-time strong {
          display: block;
          margin-top: 2px;
          font-size: 12px;
        }

        .checkout-trust-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 17px;
        }

        .checkout-trust-list span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #77746d;
          font-size: 10px;
        }

        .checkout-trust-list svg {
          color: ${GREEN};
        }

        .checkout-stripe-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .checkout-stripe-shell {
          border: 1px solid rgba(31,107,45,.10);
          border-radius: 20px;
          padding: 16px;
          background: white;
        }

        .checkout-empty {
          display: flex;
          min-height: 75vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 60px;
          text-align: center;
        }

        .checkout-empty-icon {
          display: flex;
          width: 78px;
          height: 78px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: white;
          background: ${GREEN};
          box-shadow: 0 18px 38px rgba(31,107,45,.24), 0 0 0 12px rgba(31,107,45,.06);
        }

        .checkout-empty h1 {
          margin-top: 10px;
          color: ${DARK_GREEN};
          font-family: "Playfair Display", serif;
          font-size: 36px;
        }

        .checkout-empty > p:not(.checkout-eyebrow) {
          max-width: 480px;
          margin-top: 10px;
          color: #716f69;
          font-size: 14px;
          line-height: 1.7;
        }

        .checkout-empty-button {
          max-width: 280px;
          margin-top: 24px;
        }

        @keyframes checkoutMapFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes checkoutMapIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes checkoutCardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes checkoutChoiceShine {
          0%, 65% {
            left: -30%;
            opacity: 0;
          }
          74% {
            opacity: .75;
          }
          95%, 100% {
            left: 130%;
            opacity: 0;
          }
        }

        @keyframes checkoutSpin {
          to { transform: rotate(360deg); }
        }

        /* =========================================================
           LAPTOP / DESKTOP
           "Votre commande / Your order" suit le scroll à droite.
        ========================================================= */
        @media (min-width: 1024px) {
          .checkout-container,
          .checkout-layout,
          .checkout-main-column {
            overflow: visible !important;
          }

          .checkout-layout {
            align-items: start !important;
          }

          .checkout-desktop-summary {
            display: block;
            position: relative;
            align-self: start !important;
            height: max-content !important;
            min-width: 0;
            z-index: 20;
          }

          .checkout-desktop-summary .checkout-summary {
            position: relative !important;
            top: auto !important;
            width: 100%;
          }
        }

        /* =========================================================
           TABLET / MOBILE
           Le résumé reste normal : PAS sticky sur téléphone.
        ========================================================= */
        @media (max-width: 1023px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .checkout-desktop-summary {
            display: none;
          }

          .checkout-mobile-summary {
            display: block;
            position: static;
            margin-bottom: 14px;
          }

          .checkout-mobile-summary .checkout-summary {
            position: relative;
            top: auto;
            width: 100%;
          }

          .checkout-summary-items {
            max-height: none;
            overflow: visible;
          }
        }

        @media (max-width: 700px) {
          .checkout-container {
            width: min(100% - 24px, 1180px);
            padding-top: 98px;
          }

          .checkout-hero {
            align-items: flex-start;
            flex-direction: column;
            border-radius: 25px;
            padding: 22px;
          }

          .checkout-hero-copy {
            gap: 13px;
          }

          .checkout-hero-icon {
            width: 44px;
            height: 44px;
            border-radius: 15px;
          }

          .checkout-hero-badges {
            width: 100%;
            align-items: stretch;
            flex-direction: row;
          }

          .checkout-hero-badges span {
            min-width: 0;
            flex: 1;
          }

          .checkout-progress-line {
            width: 24px;
            margin: 0 7px;
          }

          .checkout-progress-step {
            font-size: 0;
          }

          .checkout-progress-step svg {
            width: 18px;
            height: 18px;
          }

          .checkout-layout {
            gap: 14px;
          }

          .checkout-section-card {
            border-radius: 20px;
            padding: 13px;
          }

          /* -------------------------------------------------------
             STICKY ORDER SUMMARY
             It remains visible while the customer fills the form.
          ------------------------------------------------------- */
          .checkout-mobile-summary {
            position: static;
          }

          .checkout-mobile-summary .checkout-summary {
            max-height: 40dvh;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            border-radius: 20px;
            padding: 13px;
            background: rgba(255,253,248,.97);
            box-shadow:
              0 18px 42px rgba(18,63,29,.16),
              0 0 0 1px rgba(196,125,14,.06);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }

          .checkout-mobile-summary .checkout-summary::-webkit-scrollbar {
            display: none;
          }

          .checkout-summary-top {
            gap: 9px;
          }

          .checkout-summary-bag {
            width: 36px;
            height: 36px;
            border-radius: 12px;
          }

          .checkout-summary-top h2 {
            margin-top: 1px;
            font-size: 18px;
            line-height: 1.05;
          }

          .checkout-summary .checkout-eyebrow {
            font-size: 8px;
            letter-spacing: .16em;
          }

          .checkout-summary-items {
            max-height: none;
            overflow: visible;
            margin-top: 10px;
            gap: 6px;
          }

          .checkout-summary-item {
            min-height: 58px;
            gap: 8px;
            border-radius: 13px;
            padding: 6px;
          }

          .checkout-summary-item img {
            width: 42px;
            height: 42px;
            border-radius: 11px;
          }

          .checkout-summary-item-name {
            font-size: 11px;
          }

          .checkout-summary-item-meta {
            margin-top: 2px;
            font-size: 9px;
          }

          .checkout-summary-item > strong {
            font-size: 11px;
          }

          .checkout-summary-divider {
            margin: 9px 0;
          }

          .checkout-summary-lines {
            gap: 5px;
          }

          .checkout-summary-lines > div {
            font-size: 10px;
          }

          .checkout-summary-total {
            margin-top: 2px;
            padding-top: 7px;
            font-size: 12px !important;
          }

          .checkout-summary-total strong {
            font-size: 19px;
          }

          /* These are useful on desktop, but hiding them here keeps the
             sticky summary compact enough to leave room for the form. */
          .checkout-summary-time,
          .checkout-trust-list {
            display: none;
          }

          /* -------------------------------------------------------
             TRUE 2-COLUMN MOBILE PAIRS
          ------------------------------------------------------- */
          .checkout-choice-grid,
          .checkout-fields-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 14px;
            row-gap: 10px;
          }
.checkout-fields-grid.checkout-datetime-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) !important;
  gap: 14px !important;
}

          /* Payment choices can contain longer labels, so keep them
             vertical for readability. */
          .checkout-payment-grid {
            grid-template-columns: 1fr;
          }

          .checkout-choice-card {
            min-height: 86px;
            gap: 8px;
            border-radius: 17px;
            padding: 11px 9px;
          }

          .checkout-payment-card {
            min-height: 94px;
          }

          .checkout-choice-icon {
            width: 37px;
            height: 37px;
            border-radius: 12px;
          }

          .checkout-choice-icon svg {
            width: 19px;
            height: 19px;
          }

          .checkout-choice-card > span:nth-child(2) {
            min-width: 0;
            padding-right: 12px;
          }

          .checkout-choice-card strong {
            font-size: 11px;
            line-height: 1.2;
          }

          .checkout-choice-card small {
            margin-top: 3px;
            font-size: 8.5px;
            line-height: 1.25;
          }

          .checkout-choice-check {
            right: 7px;
            top: 7px;
            width: 19px;
            height: 19px;
          }

          .checkout-choice-check svg {
            width: 12px;
            height: 12px;
          }

          /* Date/time and customer fields stay small enough to fit
             comfortably side by side on iPhone-sized screens. */
          .checkout-field-label {
            gap: 4px;
            margin-bottom: 5px;
            font-size: 8.5px;
            line-height: 1.2;
          }

          .checkout-field-label svg {
            width: 13px;
            height: 13px;
            flex: 0 0 auto;
          }

          .checkout-field {
            min-width: 0;
            width: 100%;
          }

          .checkout-field input {
            display: block;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            height: 40px;
            min-height: 40px;
            box-sizing: border-box;
            border-radius: 12px;
            padding: 0 9px;
            font-size: 16px; /* avoids iPhone zoom on focus */
            line-height: normal;
            background: #fff;
          }

          /* iPhone/Safari/Chrome date & time inputs need explicit dimensions.
             Without this, the browser can render the native control as a tiny
             pill even though the parent grid cell is much taller. */
          .checkout-field input[type="date"],
          .checkout-field input[type="time"] {
            display: block;
            width: 100%;
            min-width: 0;
            height: 40px;
            min-height: 40px;
            box-sizing: border-box;
            padding: 0 9px;
            font-size: 16px;
            line-height: 40px;
            color: #31312f;
            background-color: #fff;
          }

          .checkout-field input[type="date"]::-webkit-date-and-time-value,
          .checkout-field input[type="time"]::-webkit-date-and-time-value {
            min-height: 1.2em;
            margin: 0;
            text-align: left;
          }

          .checkout-field input[type="date"]::-webkit-calendar-picker-indicator,
          .checkout-field input[type="time"]::-webkit-calendar-picker-indicator {
            margin-left: auto;
            opacity: .72;
          }

          /* Payment-step recap:
             3 columns are too narrow on a phone. Keep the two useful summary
             cards side by side, then give the client card the full row. */
          .checkout-details-recap {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 12px;
            row-gap: 10px;
            margin-bottom: 14px;
          }

          .checkout-details-recap > div {
            min-width: 0;
            min-height: 58px;
            gap: 7px;
            border-radius: 13px;
            padding: 8px 9px;
          }

          .checkout-details-recap > div:nth-child(3):not(.is-wide) {
            grid-column: 1 / -1;
          }

          .checkout-details-recap > div > span {
            width: 28px;
            height: 28px;
            border-radius: 9px;
          }

          .checkout-details-recap > div > span svg {
            width: 14px;
            height: 14px;
          }

          .checkout-details-recap > div > div {
            min-width: 0;
          }

          .checkout-details-recap small {
            font-size: 8px;
            letter-spacing: .07em;
          }

          .checkout-details-recap strong {
            margin-top: 2px;
            overflow: visible;
            font-size: 10.5px;
            line-height: 1.3;
            text-overflow: clip;
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .checkout-section-heading {
            gap: 10px;
            margin-bottom: 14px;
          }

          .checkout-section-icon {
            width: 37px;
            height: 37px;
            border-radius: 12px;
          }

          .checkout-section-heading p {
            font-size: 7.5px;
            letter-spacing: .15em;
          }

          .checkout-section-heading h2 {
            font-size: 18px;
          }

          .checkout-address-search-top,
          .checkout-map-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .checkout-map-button,
          .checkout-map-confirm {
            width: 100%;
          }

          .checkout-map-overlay {
            align-items: flex-end;
            padding: 0;
          }

          .checkout-map-modal {
            width: 100%;
            max-height: 92dvh;
            border-radius: 26px 26px 0 0;
          }

          .checkout-map-header {
            padding: 18px;
          }

          .checkout-map-header h3 {
            font-size: 23px;
          }




          .checkout-map-address-preview p {
            white-space: normal;
          }
        }

        @media (max-width: 350px) {
          .checkout-choice-grid,
          .checkout-fields-grid,
          .checkout-fields-grid.checkout-datetime-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .checkout-mobile-summary .checkout-summary {
            max-height: 38dvh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .checkout-section-card,
          .checkout-choice-card.is-selected::after,
          .checkout-payment-card.is-selected::after,
          .checkout-spinner {
            animation: none !important;
          }

          .checkout-choice-card,
          .checkout-payment-card,
          .checkout-primary-button,
          .checkout-back,
          .checkout-field input,
          .checkout-section-card textarea {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
