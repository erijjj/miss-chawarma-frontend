// src/components/EventForm.tsx
// Formulaire dédié par type d'événement — Miss Chawarma
// Reprend toutes les validations de l'ancien formulaire (téléphone, dates,
// horaires 11h30–02h00/00h00, 42 personnes max, 500 mots max) + envoi Formspree.
// Affiché INLINE dans la page (pas en popup) pour garder le header visible (switch FR/EN).

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
  TicketCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import { getEventType, EventField } from "../config/eventFormsConfig";

// En local, VITE_API_URL (dans .env) prend le dessus ; sinon on retombe sur Render.
const API_URL =
  import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

interface EventFormProps {
  eventTypeId: string; // "anniversaire", "seminaire", ...
  onBack: () => void; // retour au choix du type
}

type SpecificValues = Record<string, string | string[]>;

const EventForm = ({ eventTypeId, onBack }: EventFormProps) => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en")
    ? "en"
    : "fr";
  const eventType = getEventType(eventTypeId);
  const [searchParams, setSearchParams] = useSearchParams();

  const referenceParam = searchParams.get("ref");
  const emailParam = searchParams.get("email");

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    date: "",
    heure: "",
    personnes: "",
    demandes: "",
  });
  const [specific, setSpecific] = useState<SpecificValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    | "idle"
    | "loading"
    | "created"
    | "manage"
    | "updated"
    | "error"
    | "cancelled"
  >("idle");
  const [reference, setReference] = useState<number | null>(
    referenceParam ? Number(referenceParam) : null,
  );
  const [editMode, setEditMode] = useState(
    Boolean(referenceParam && emailParam),
  );
  const [lookupLoading, setLookupLoading] = useState(
    Boolean(referenceParam && emailParam),
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (
      status === "created" ||
      status === "updated" ||
      status === "manage" ||
      status === "cancelled"
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  if (!eventType) return null;

  const parseDetailsIntoSpecific = (details: string) => {
    const parsed: SpecificValues = {};
    if (!details.trim()) return parsed;

    details.split(" ; ").forEach((piece) => {
      const separator = piece.indexOf(" : ");
      if (separator === -1) return;

      const label = piece.slice(0, separator).trim();
      const value = piece.slice(separator + 3).trim();

      const field = eventType.fields.find(
        (candidate) => candidate.label.fr.trim() === label,
      );
      if (!field) return;

      parsed[field.name] =
        field.type === "checkbox-group"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : value;
    });

    return parsed;
  };

  useEffect(() => {
    if (!referenceParam || !emailParam) {
      setLookupLoading(false);
      return;
    }

    let cancelled = false;

    const loadReservation = async () => {
      setLookupLoading(true);
      setStatus("idle");

      try {
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

        if (!response.ok) throw new Error("event_not_found");

        const data = await response.json();
        if (cancelled) return;

        setReference(Number(data.id));
        setEditMode(true);
        setFormData({
          prenom: data.first_name || "",
          nom: data.last_name || "",
          email: data.email || emailParam,
          telephone: data.phone || "",
          date: String(data.date || "").slice(0, 10),
          heure: String(data.time || "").slice(0, 5),
          personnes: data.guests ? String(data.guests) : "",
          demandes: data.note || "",
        });
        setSpecific(parseDetailsIntoSpecific(data.details || ""));
        setErrors({});
        // IMPORTANT: when a reservation is opened from ref + email,
        // do NOT jump straight into the edit form.
        // Show the same management card as after a successful booking.
        setStatus("manage");
      } catch (error) {
        console.error("[event form lookup]", error);
        if (!cancelled) setStatus("error");
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    };

    void loadReservation();

    return () => {
      cancelled = true;
    };
  }, [referenceParam, emailParam, eventTypeId]);

  // ─────────────── Contrôles de saisie (repris de l'ancien formulaire) ───────────────

  const onlyLetters = (val: string) => /^[a-zA-ZÀ-ÿ\s'-]*$/.test(val);
  const wordCount = (text: string) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const getMinDate = () => new Date().toISOString().split("T")[0];

  const getMinTime = (selectedDate: string) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (selectedDate === today) {
      const minTime = new Date(now.getTime() + 30 * 60000);
      return minTime.toTimeString().slice(0, 5);
    }
    return "11:30";
  };

  const getMaxTime = (selectedDate: string) => {
    if (!selectedDate) return "02:00";
    const day = new Date(selectedDate).getDay();
    return [0, 4, 5, 6].includes(day) ? "02:00" : "00:00";
  };

  const getDayLabel = (selectedDate: string) => {
    if (!selectedDate) return "";
    const day = new Date(selectedDate).getDay();
    return [0, 4, 5, 6].includes(day) ? "11h30 – 02h00" : "11h30 – 00h00";
  };

  const requiredMsg = t(
    "eventForm.errRequired",
    lang === "fr" ? "Ce champ est requis" : "This field is required",
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim())
      newErrors.prenom = t("eventForm.errFirstNameRequired");
    else if (!onlyLetters(formData.prenom))
      newErrors.prenom = t("eventForm.errLettersOnly");

    if (!formData.nom.trim())
      newErrors.nom = t("eventForm.errLastNameRequired");
    else if (!onlyLetters(formData.nom))
      newErrors.nom = t("eventForm.errLettersOnly");

    if (!formData.email.trim())
      newErrors.email = t("eventForm.errEmailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t("eventForm.errEmailInvalid");

    if (!formData.telephone.trim())
      newErrors.telephone = t("eventForm.errPhoneRequired");
    else if (!isValidPhoneNumber(formData.telephone))
      newErrors.telephone = t("eventForm.errPhoneInvalid");

    if (!formData.date) newErrors.date = t("eventForm.errDateRequired");
    else if (formData.date < getMinDate())
      newErrors.date = t("eventForm.errDateInvalid");

    if (!formData.heure) {
      newErrors.heure = t("eventForm.errTimeRequired");
    } else if (formData.date) {
      const minTime = getMinTime(formData.date);
      const maxTime = getMaxTime(formData.date);
      const h = formData.heure;
      if (maxTime === "02:00") {
        const validAfterMidnight = h >= "00:00" && h <= "02:00";
        const validEvening = h >= minTime;
        if (!validAfterMidnight && !validEvening) {
          newErrors.heure = t("eventForm.errTimeMin", {
            time: minTime.replace(":", "h"),
          });
        }
      } else {
        if (h < minTime) {
          newErrors.heure = t("eventForm.errTimeMin", {
            time: minTime.replace(":", "h"),
          });
        }
      }
    }

    if (!formData.personnes)
      newErrors.personnes = t("eventForm.errPeopleRequired");
    else {
      const n = parseInt(formData.personnes);
      if (isNaN(n) || n < 1 || n > 42)
        newErrors.personnes = t("eventForm.errPeopleRange");
    }

    if (wordCount(formData.demandes) > 500) {
      newErrors.demandes = t("eventForm.errMaxWords", {
        count: wordCount(formData.demandes),
      });
    }

    // Champs spécifiques obligatoires (définis dans eventFormsConfig.ts)
    eventType.fields.forEach((field) => {
      if (!field.required) return;
      const v = specific[field.name];
      const empty = Array.isArray(v) ? v.length === 0 : !v || !String(v).trim();
      if (empty) newErrors[`sp_${field.name}`] = requiredMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─────────────── Handlers ───────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (
      (name === "prenom" || name === "nom") &&
      value !== "" &&
      !onlyLetters(value)
    )
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setSpecificValue = (name: string, value: string) => {
    setSpecific((prev) => ({ ...prev, [name]: value }));
    if (errors[`sp_${name}`])
      setErrors((prev) => ({ ...prev, [`sp_${name}`]: "" }));
  };

  const toggleSpecificCheckbox = (name: string, optionFr: string) => {
    setSpecific((prev) => {
      const current = Array.isArray(prev[name]) ? (prev[name] as string[]) : [];
      return {
        ...prev,
        [name]: current.includes(optionFr)
          ? current.filter((v) => v !== optionFr)
          : [...current, optionFr],
      };
    });
    if (errors[`sp_${name}`])
      setErrors((prev) => ({ ...prev, [`sp_${name}`]: "" }));
  };

  const buildDetailsText = () => {
    const specificPayload: Record<string, string> = {};

    eventType.fields.forEach((field) => {
      const value = specific[field.name];
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      specificPayload[field.label.fr] = Array.isArray(value)
        ? value.join(", ")
        : String(value);
    });

    return Object.entries(specificPayload)
      .map(([label, value]) => `${label} : ${value}`)
      .join(" ; ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setCancelError(null);

    const payload = {
      event_type: eventType.title.fr,
      first_name: formData.prenom,
      last_name: formData.nom,
      email: formData.email,
      phone: formData.telephone,
      date: formData.date,
      time: formData.heure,
      guests: parseInt(formData.personnes, 10),
      details: buildDetailsText(),
      note: formData.demandes || "",
      language: lang,
    };

    try {
      const isUpdate = Boolean(editMode && reference);

      const endpoint = isUpdate
        ? `${API_URL}/api/reservations/event/modify`
        : `${API_URL}/api/reservations/event`;

      const body = isUpdate ? { reference, ...payload } : payload;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = await res.json();
      const nextReference = Number(data.id || reference);

      setReference(nextReference);
      setEditMode(true);
      setStatus(isUpdate ? "updated" : "created");

      if (nextReference && formData.email) {
        setSearchParams(
          {
            ref: String(nextReference),
            email: formData.email,
          },
          { replace: true },
        );
      }
    } catch (error) {
      console.error("[event submit]", error);
      setStatus("error");
    }
  };

  const cancelReservation = async () => {
    if (!reference || !formData.email) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      const response = await fetch(`${API_URL}/api/reservations/event/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        throw new Error("cancel_failed");
      }

      setCancelOpen(false);
      setStatus("cancelled");
    } catch (error) {
      console.error("[event cancel]", error);
      setCancelError(
        t(
          "eventForm.cancelError",
          lang === "fr"
            ? "Impossible d'annuler la demande pour le moment."
            : "We couldn't cancel the request right now.",
        ),
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const startAnotherEvent = () => {
    setReference(null);
    setEditMode(false);
    setStatus("idle");
    setCancelOpen(false);
    setCancelError(null);
    setSearchParams({}, { replace: true });
    setFormData({
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      date: "",
      heure: "",
      personnes: "",
      demandes: "",
    });
    setSpecific({});
    setErrors({});
    onBack();
  };

  // ─────────────── Styles (identiques à l'ancien formulaire) ───────────────

  const inputBase: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e0d9cc",
    color: "#333",
    fontFamily: "inherit",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const inputError: React.CSSProperties = {
    ...inputBase,
    border: "1px solid #e05c5c",
  };
  const errorMsg = (field: string) =>
    errors[field] ? (
      <p className="text-xs mt-1 ml-1" style={{ color: "#e05c5c" }}>
        {errors[field]}
      </p>
    ) : null;

  const labelStyle: React.CSSProperties = { color: "#1f6b2d" };

  const wc = wordCount(formData.demandes);

  if (lookupLoading) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center rounded-[28px]"
        style={{
          color: "#164f22",
          background:
            "linear-gradient(145deg, rgba(255,255,255,.94), rgba(249,242,227,.96))",
          border: "1px solid rgba(31,107,45,.10)",
        }}
      >
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t(
            "eventForm.loadingExisting",
            lang === "fr"
              ? "Chargement de votre événement..."
              : "Loading your event...",
          )}
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="event-success-shell event-cancelled-shell">
        <div className="event-success-icon">
          <Check className="h-7 w-7" />
        </div>

        <p className="event-success-kicker">
          {t(
            "eventForm.cancelledKicker",
            lang === "fr" ? "Demande annulée" : "Request cancelled",
          )}
        </p>

        <h2 className="event-success-title font-playfair">
          {t(
            "eventForm.cancelledTitle",
            lang === "fr"
              ? "Votre événement est annulé"
              : "Your event request is cancelled",
          )}
        </h2>

        <p className="event-success-text">
          {t(
            "eventForm.cancelledText",
            lang === "fr"
              ? "Votre demande n'est plus active. Nous espérons organiser un prochain moment avec vous chez Miss Chawarma."
              : "Your request is no longer active. We hope to help you plan another special moment at Miss Chawarma.",
          )}
        </p>

        {reference && (
          <div className="event-reference">
            <TicketCheck className="h-4 w-4" />
            <span>
              {t(
                "eventForm.reference",
                lang === "fr" ? "Référence" : "Reference",
              )}
            </span>
            <strong>#{reference}</strong>
          </div>
        )}

        <div className="event-success-actions">
          <button
            type="button"
            className="event-primary-action"
            onClick={startAnotherEvent}
          >
            <RotateCcw className="h-4 w-4" />
            {t(
              "eventForm.anotherEvent",
              lang === "fr"
                ? "Organiser un autre événement"
                : "Plan another event",
            )}
          </button>

          <Link to="/" className="event-secondary-action">
            {t(
              "eventForm.backHome",
              lang === "fr" ? "Retour à l'accueil" : "Back to home",
            )}
          </Link>
        </div>

        <EventSuccessStyles />
      </div>
    );
  }

  if (
    (status === "created" || status === "manage" || status === "updated") &&
    reference
  ) {
    return (
      <div className="event-success-shell">
        <div className="event-success-accent" />
        <Sparkles className="event-success-spark event-success-spark-one" />
        <Sparkles className="event-success-spark event-success-spark-two" />

        <div className="event-success-icon-wrap">
          <span />
          <span />
          <div className="event-success-icon">
            <Check className="h-7 w-7" />
          </div>
        </div>

        <p className="event-success-kicker">
          <Sparkles className="h-3.5 w-3.5" />
          {status === "updated"
            ? t(
                "eventForm.updatedKicker",
                lang === "fr" ? "Modifications enregistrées" : "Changes saved",
              )
            : status === "manage"
              ? t(
                  "eventForm.manageKicker",
                  lang === "fr"
                    ? "Votre réservation événement"
                    : "Your event booking",
                )
              : t(
                  "eventForm.successKicker",
                  lang === "fr"
                    ? "Votre moment prend forme"
                    : "Your moment is taking shape",
                )}
          <Sparkles className="h-3.5 w-3.5" />
        </p>

        <h2 className="event-success-title font-playfair">
          {status === "updated"
            ? t(
                "eventForm.updatedTitle",
                lang === "fr"
                  ? "Votre événement est à jour"
                  : "Your event has been updated",
              )
            : status === "manage"
              ? t(
                  "eventForm.manageTitle",
                  lang === "fr"
                    ? "Votre événement est réservé"
                    : "Your event is booked",
                )
              : t(
                  "eventForm.successTitle",
                  lang === "fr"
                    ? "Votre demande est bien enregistrée"
                    : "Your event request is confirmed",
                )}
        </h2>

        <p className="event-success-text">
          {status === "manage"
            ? t(
                "eventForm.manageText",
                lang === "fr"
                  ? "Retrouvez ici les informations de votre événement. Vous pouvez le modifier ou l’annuler à tout moment avec votre référence."
                  : "Here are your event details. You can edit or cancel the request at any time using your reference.",
              )
            : t(
                "eventForm.successText",
                lang === "fr"
                  ? "Notre équipe a reçu votre demande et reviendra vers vous rapidement pour finaliser chaque détail."
                  : "Our team has received your request and will get back to you shortly to finalize every detail.",
              )}
        </p>

        <div className="event-success-grid">
          <div className="event-success-info">
            <span>
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <small>
                {t("eventForm.dateLabel", lang === "fr" ? "Date" : "Date")}
              </small>
              <strong>{formData.date}</strong>
            </div>
          </div>

          <div className="event-success-info">
            <span>
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <small>
                {t("eventForm.timeLabel", lang === "fr" ? "Heure" : "Time")}
              </small>
              <strong>{formData.heure}</strong>
            </div>
          </div>

          <div className="event-success-info">
            <span>
              <UsersRound className="h-5 w-5" />
            </span>
            <div>
              <small>
                {t(
                  "eventForm.guestsLabel",
                  lang === "fr" ? "Invités" : "Guests",
                )}
              </small>
              <strong>{formData.personnes}</strong>
            </div>
          </div>

          <div className="event-success-info">
            <span className="text-lg">{eventType.emoji}</span>
            <div>
              <small>
                {t(
                  "eventForm.eventLabel",
                  lang === "fr" ? "Événement" : "Event",
                )}
              </small>
              <strong>{eventType.title[lang]}</strong>
            </div>
          </div>
        </div>

        <div className="event-reference">
          <TicketCheck className="h-4 w-4" />
          <span>
            {t(
              "eventForm.reference",
              lang === "fr" ? "Référence" : "Reference",
            )}
          </span>
          <strong>#{reference}</strong>
        </div>

        <p className="event-reference-note">
          {t(
            "eventForm.keepReference",
            lang === "fr"
              ? "Gardez cette référence : elle vous permet de modifier ou d'annuler votre demande."
              : "Keep this reference: it lets you edit or cancel your request.",
          )}
        </p>

        <div className="event-success-actions">
          <button
            type="button"
            className="event-primary-action"
            onClick={() => {
              setErrors({});
              setStatus("idle");
            }}
          >
            <Pencil className="h-4 w-4" />
            {t(
              "eventForm.editEvent",
              lang === "fr" ? "Modifier mon événement" : "Edit my event",
            )}
          </button>

          <button
            type="button"
            className="event-secondary-action"
            onClick={startAnotherEvent}
          >
            <RotateCcw className="h-4 w-4" />
            {t(
              "eventForm.anotherEvent",
              lang === "fr"
                ? "Organiser un autre événement"
                : "Plan another event",
            )}
          </button>

          <button
            type="button"
            className="event-danger-action"
            onClick={() => {
              setCancelError(null);
              setCancelOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t(
              "eventForm.cancelEvent",
              lang === "fr" ? "Annuler mon événement" : "Cancel my event",
            )}
          </button>
        </div>

        {cancelOpen &&
          createPortal(
            <div
              className="event-cancel-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-cancel-title"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target && !cancelLoading) {
                  setCancelOpen(false);
                }
              }}
            >
              <div className="event-cancel-card">
                <div className="event-cancel-icon">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <p className="event-cancel-kicker">
                  {t(
                    "eventForm.cancelEyebrow",
                    lang === "fr"
                      ? "Avant de continuer"
                      : "Before you continue",
                  )}
                </p>

                <h3 id="event-cancel-title" className="font-playfair">
                  {t(
                    "eventForm.cancelConfirmTitle",
                    lang === "fr"
                      ? "Annuler cette demande d'événement ?"
                      : "Cancel this event request?",
                  )}
                </h3>

                <p>
                  {t(
                    "eventForm.cancelConfirmText",
                    lang === "fr"
                      ? "Votre demande sera annulée immédiatement. Vous pourrez toujours créer une nouvelle demande plus tard."
                      : "Your request will be cancelled immediately. You can always create a new one later.",
                  )}
                </p>

                <div className="event-cancel-summary">
                  <span>
                    <CalendarDays className="h-4 w-4" />
                    {formData.date}
                  </span>
                  <span>
                    <Clock3 className="h-4 w-4" />
                    {formData.heure}
                  </span>
                  <span>
                    <UsersRound className="h-4 w-4" />
                    {formData.personnes}
                  </span>
                </div>

                {cancelError && (
                  <div className="event-cancel-error">{cancelError}</div>
                )}

                <div className="event-cancel-actions">
                  <button
                    type="button"
                    disabled={cancelLoading}
                    className="event-cancel-keep"
                    onClick={() => setCancelOpen(false)}
                  >
                    {t(
                      "eventForm.keepEvent",
                      lang === "fr" ? "Garder ma demande" : "Keep my request",
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={cancelLoading}
                    className="event-cancel-confirm"
                    onClick={cancelReservation}
                  >
                    {cancelLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {cancelLoading
                      ? t(
                          "eventForm.cancelling",
                          lang === "fr" ? "Annulation..." : "Cancelling...",
                        )
                      : t(
                          "eventForm.confirmCancel",
                          lang === "fr" ? "Oui, annuler" : "Yes, cancel",
                        )}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        <EventSuccessStyles />
      </div>
    );
  }

  // ─────────────── Rendu d'un champ spécifique depuis la config ───────────────

  const renderSpecificField = (field: EventField) => {
    const errKey = `sp_${field.name}`;
    const label = field.label[lang] + (field.required ? " *" : "");
    const placeholder = field.placeholder?.[lang] ?? "";
    const style = errors[errKey] ? inputError : inputBase;

    switch (field.type) {
      case "text":
      case "number":
        return (
          <div key={field.name}>
            <p className="text-sm font-semibold mb-2" style={labelStyle}>
              {label}
            </p>
            <input
              type={field.type}
              min={field.type === "number" ? 0 : undefined}
              placeholder={placeholder}
              value={(specific[field.name] as string) ?? ""}
              onChange={(e) => setSpecificValue(field.name, e.target.value)}
              style={style}
            />
            {errorMsg(errKey)}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name}>
            <p className="text-sm font-semibold mb-2" style={labelStyle}>
              {label}
            </p>
            <textarea
              rows={4}
              placeholder={placeholder}
              value={(specific[field.name] as string) ?? ""}
              onChange={(e) => setSpecificValue(field.name, e.target.value)}
              style={{ ...style, resize: "none" }}
            />
            {errorMsg(errKey)}
          </div>
        );

      case "select":
        return (
          <div key={field.name}>
            <p className="text-sm font-semibold mb-2" style={labelStyle}>
              {label}
            </p>
            <select
              value={(specific[field.name] as string) ?? ""}
              onChange={(e) => setSpecificValue(field.name, e.target.value)}
              style={{
                ...style,
                color: specific[field.name] ? "#333" : "#aaa",
              }}
            >
              <option value="" disabled>
                {lang === "fr" ? "Choisir..." : "Choose..."}
              </option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.label.fr}>
                  {opt.label[lang]}
                </option>
              ))}
            </select>
            {errorMsg(errKey)}
          </div>
        );

      case "radio":
        return (
          <div key={field.name}>
            <p className="text-sm font-semibold mb-2" style={labelStyle}>
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((opt) => {
                const selected = specific[field.name] === opt.label.fr;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSpecificValue(field.name, opt.label.fr)}
                    className="text-sm transition"
                    style={{
                      borderRadius: "9999px",
                      padding: "10px 18px",
                      border: selected
                        ? "1px solid #1f6b2d"
                        : errors[errKey]
                          ? "1px solid #e05c5c"
                          : "1px solid #e0d9cc",
                      background: selected ? "#1f6b2d" : "#fff",
                      color: selected ? "#fff" : "#555",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label[lang]}
                  </button>
                );
              })}
            </div>
            {errorMsg(errKey)}
          </div>
        );

      case "checkbox-group":
        return (
          <div key={field.name}>
            <p className="text-sm font-semibold mb-2" style={labelStyle}>
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((opt) => {
                const current = Array.isArray(specific[field.name])
                  ? (specific[field.name] as string[])
                  : [];
                const selected = current.includes(opt.label.fr);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      toggleSpecificCheckbox(field.name, opt.label.fr)
                    }
                    className="text-sm transition"
                    style={{
                      borderRadius: "9999px",
                      padding: "10px 18px",
                      border: selected
                        ? "1px solid #1f6b2d"
                        : "1px solid #e0d9cc",
                      background: selected ? "#1f6b2d" : "#fff",
                      color: selected ? "#fff" : "#555",
                      cursor: "pointer",
                    }}
                  >
                    {selected ? "✓ " : ""}
                    {opt.label[lang]}
                  </button>
                );
              })}
            </div>
            {errorMsg(errKey)}
          </div>
        );
    }
  };

  // ─────────────── Rendu ───────────────

  return (
    <div className="w-full">
      {/* En-tête du formulaire : retour + titre de l'événement */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            if (editMode && reference) {
              setStatus("manage");
            } else {
              onBack();
            }
          }}
          className="text-sm transition hover:opacity-70"
          style={{
            color: "#9ca89b",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← {lang === "fr" ? "Changer d'événement" : "Change event type"}
        </button>
        <h2 className="mt-3 text-xl font-semibold" style={{ color: "#1f6b2d" }}>
          {eventType.emoji} {eventType.title[lang]}
        </h2>
        <p className="text-sm mt-1" style={{ color: "#9ca89b" }}>
          {eventType.subtitle[lang]}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
        {/* Prénom + Nom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="prenom"
              placeholder={t("eventForm.firstNamePlaceholder")}
              value={formData.prenom}
              onChange={handleChange}
              style={errors.prenom ? inputError : inputBase}
            />
            {errorMsg("prenom")}
          </div>
          <div>
            <input
              type="text"
              name="nom"
              placeholder={t("eventForm.lastNamePlaceholder")}
              value={formData.nom}
              onChange={handleChange}
              style={errors.nom ? inputError : inputBase}
            />
            {errorMsg("nom")}
          </div>
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder={t("eventForm.emailPlaceholder")}
            value={formData.email}
            onChange={handleChange}
            readOnly={editMode}
            style={{
              ...(errors.email ? inputError : inputBase),
              background: editMode ? "#f5f2ea" : "#fff",
              cursor: editMode ? "not-allowed" : "text",
            }}
          />
          {errorMsg("email")}
        </div>

        {/* Téléphone */}
        <div>
          <input
            type="tel"
            name="telephone"
            placeholder={t("eventForm.phonePlaceholder")}
            value={formData.telephone}
            onChange={handleChange}
            style={errors.telephone ? inputError : inputBase}
          />
          {!errors.telephone && (
            <p className="text-xs mt-1 ml-1" style={{ color: "#9ca89b" }}>
              {t("eventForm.phoneHint")}
            </p>
          )}
          {errorMsg("telephone")}
        </div>

        {/* Date + Heure (mêmes contrôles que l'ancien formulaire) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={getMinDate()}
              style={{
                ...(errors.date ? inputError : inputBase),
                color: formData.date ? "#333" : "#aaa",
              }}
            />
            {errorMsg("date")}
          </div>
          <div>
            <input
              type="time"
              name="heure"
              value={formData.heure}
              onChange={handleChange}
              min={formData.date ? getMinTime(formData.date) : "11:30"}
              max={formData.date ? getMaxTime(formData.date) : "02:00"}
              disabled={!formData.date}
              style={{
                ...(errors.heure ? inputError : inputBase),
                color: formData.heure ? "#333" : "#aaa",
                opacity: !formData.date ? 0.5 : 1,
              }}
            />
            {formData.date && !errors.heure && (
              <p className="text-xs mt-1 ml-1" style={{ color: "#9ca89b" }}>
                {t("eventForm.hoursLabel")} {getDayLabel(formData.date)}
              </p>
            )}
            {errorMsg("heure")}
          </div>
        </div>

        {/* Nombre de personnes */}
        <div>
          <input
            type="number"
            name="personnes"
            placeholder={t("eventForm.peoplePlaceholder")}
            value={formData.personnes}
            onChange={handleChange}
            min={1}
            max={42}
            style={errors.personnes ? inputError : inputBase}
          />
          {errorMsg("personnes")}
        </div>

        {/* ── Champs spécifiques à ce type d'événement ── */}
        <div
          className="space-y-4 rounded-2xl p-4"
          style={{ background: "#faf7ef", border: "1px solid #e0d9cc" }}
        >
          {eventType.fields.map(renderSpecificField)}
        </div>

        {/* Demandes spécifiques (500 mots max) */}
        <div>
          <p className="text-sm font-semibold mb-2" style={labelStyle}>
            {t("eventForm.specialRequests")}
          </p>
          <textarea
            name="demandes"
            placeholder={t("eventForm.specialRequestsPlaceholder")}
            value={formData.demandes}
            onChange={handleChange}
            rows={4}
            style={{
              ...(errors.demandes ? inputError : inputBase),
              resize: "none",
            }}
          />
          <div className="flex justify-between mt-1">
            {errorMsg("demandes")}
            <p
              className="text-xs ml-auto"
              style={{
                color:
                  wc > 450 ? (wc > 500 ? "#e05c5c" : "#c47d0e") : "#9ca89b",
              }}
            >
              {wc} / 500 {t("eventForm.words")}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, #c47d0e, #e6b84a)",
            color: "#fff",
            boxShadow: "0 4px 15px rgba(196,125,14,0.3)",
            letterSpacing: "0.05em",
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading"
            ? editMode
              ? t(
                  "eventForm.updating",
                  lang === "fr" ? "Mise à jour..." : "Updating...",
                )
              : t("eventForm.sending")
            : editMode
              ? t(
                  "eventForm.update",
                  lang === "fr"
                    ? "Enregistrer les modifications →"
                    : "Save changes →",
                )
              : t("eventForm.submit")}
        </button>

        {status === "error" && (
          <div
            className="text-center py-3 px-4 rounded-2xl text-sm font-medium"
            style={{
              background: "#e05c5c11",
              color: "#e05c5c",
              border: "1px solid #e05c5c33",
            }}
          >
            {t("eventForm.errorMsg")}
          </div>
        )}
      </form>
    </div>
  );
};

const EventSuccessStyles = () => (
  <style>{`
    .event-success-shell {
      position: relative;
      overflow: hidden;
      padding: 42px 28px 30px;
      border-radius: 30px;
      text-align: center;
      border: 1px solid rgba(31,107,45,.11);
      background:
        radial-gradient(circle at 88% 6%, rgba(197,154,40,.15), transparent 28%),
        radial-gradient(circle at 10% 96%, rgba(31,107,45,.08), transparent 30%),
        linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,251,242,.98));
      box-shadow: 0 24px 60px rgba(31,60,30,.10);
      animation: eventSuccessIn .55s cubic-bezier(.16,1,.3,1) both;
    }

    .event-success-accent {
      position:absolute;
      top:0;
      left:50%;
      width:56%;
      height:3px;
      transform:translateX(-50%);
      background:linear-gradient(90deg,transparent,#c59a28,#1f6b2d,#c59a28,transparent);
    }

    .event-success-spark {
      position:absolute;
      width:17px;
      color:#c59a28;
      opacity:.32;
      animation:eventSpark 3.5s ease-in-out infinite;
    }
    .event-success-spark-one { left:12%; top:24%; }
    .event-success-spark-two { right:12%; top:31%; animation-delay:-1.4s; }

    .event-success-icon-wrap {
      position:relative;
      width:88px;
      height:88px;
      margin:0 auto 10px;
      display:grid;
      place-items:center;
    }
    .event-success-icon-wrap > span {
      position:absolute;
      inset:8px;
      border:1px solid rgba(31,107,45,.13);
      border-radius:28px;
      animation:eventRing 2.8s ease-out infinite;
    }
    .event-success-icon-wrap > span:nth-child(2) { animation-delay:1.4s; }

    .event-success-icon {
      width:64px;
      height:64px;
      display:grid;
      place-items:center;
      border-radius:21px;
      color:#fff;
      background:linear-gradient(135deg,#1f6b2d,#3d914b);
      box-shadow:0 16px 34px rgba(31,107,45,.24);
    }

    .event-success-kicker {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      margin:6px 0 8px;
      color:#c59a28;
      font-size:10px;
      font-weight:800;
      letter-spacing:.17em;
      text-transform:uppercase;
    }

    .event-success-title {
      margin:0;
      color:#164f22;
      font-size:clamp(31px,4vw,46px);
      font-weight:500;
      line-height:1.08;
      letter-spacing:-.03em;
    }

    .event-success-text {
      max-width:590px;
      margin:13px auto 0;
      color:#77736a;
      font-size:13px;
      line-height:1.7;
    }

    .event-success-grid {
      max-width:720px;
      margin:27px auto 0;
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:12px;
    }

    .event-success-info {
      display:flex;
      align-items:center;
      gap:10px;
      min-width:0;
      padding:14px;
      text-align:left;
      border-radius:17px;
      border:1px solid rgba(31,107,45,.09);
      background:rgba(255,255,255,.74);
      box-shadow:0 8px 20px rgba(31,60,30,.045);
    }

    .event-success-info > span {
      flex:none;
      width:36px;
      height:36px;
      display:grid;
      place-items:center;
      border-radius:12px;
      color:#1f6b2d;
      background:rgba(31,107,45,.08);
    }

    .event-success-info small {
      display:block;
      margin-bottom:3px;
      color:#aaa394;
      font-size:8.5px;
      font-weight:800;
      letter-spacing:.13em;
      text-transform:uppercase;
    }

    .event-success-info strong {
      display:block;
      color:#164f22;
      font-size:12px;
      line-height:1.3;
      overflow-wrap:break-word;
      word-break:normal;
    }

    .event-reference {
      width:max-content;
      max-width:100%;
      margin:17px auto 0;
      display:flex;
      align-items:center;
      gap:8px;
      padding:9px 14px;
      border:1px dashed rgba(197,154,40,.52);
      border-radius:13px;
      color:#80550a;
      background:rgba(197,154,40,.07);
    }

    .event-reference span {
      color:#a99a78;
      font-size:8.5px;
      font-weight:800;
      letter-spacing:.12em;
      text-transform:uppercase;
    }

    .event-reference strong { font-size:13px; }

    .event-reference-note {
      max-width:560px;
      margin:12px auto 0;
      color:#8a867e;
      font-size:10.5px;
      line-height:1.5;
    }

    .event-success-actions {
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:9px;
      margin-top:22px;
    }

    .event-primary-action,
    .event-secondary-action,
    .event-danger-action {
      min-height:43px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      padding:10px 16px;
      border-radius:999px;
      font-size:11.5px;
      font-weight:800;
      text-decoration:none;
      cursor:pointer;
      transition:transform .18s ease, box-shadow .18s ease;
    }

    .event-primary-action {
      color:#fff;
      border:1px solid #1f6b2d;
      background:linear-gradient(135deg,#1f6b2d,#164f22);
      box-shadow:0 9px 22px rgba(31,107,45,.18);
    }

    .event-secondary-action {
      color:#164f22;
      border:1px solid rgba(31,107,45,.13);
      background:rgba(31,107,45,.055);
    }

    .event-danger-action {
      color:#a84137;
      border:1px solid rgba(168,65,55,.16);
      background:rgba(168,65,55,.05);
    }

    .event-primary-action:hover,
    .event-secondary-action:hover,
    .event-danger-action:hover {
      transform:translateY(-2px);
    }

    .event-cancel-overlay {
      position:fixed;
      inset:0;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      background:rgba(9,28,14,.55);
      backdrop-filter:blur(9px);
      -webkit-backdrop-filter:blur(9px);
    }

    .event-cancel-card {
      width:min(100%,470px);
      padding:28px 25px 24px;
      text-align:center;
      border-radius:25px;
      border:1px solid rgba(255,255,255,.55);
      background:
        radial-gradient(circle at 82% 2%,rgba(197,154,40,.12),transparent 34%),
        #fffdf8;
      box-shadow:0 32px 85px rgba(7,28,13,.32);
      animation:eventCancelIn .35s cubic-bezier(.16,1,.3,1) both;
    }

    .event-cancel-icon {
      width:56px;
      height:56px;
      margin:0 auto 14px;
      display:grid;
      place-items:center;
      border-radius:18px;
      color:#a84137;
      background:rgba(168,65,55,.08);
    }

    .event-cancel-kicker {
      margin:0 0 7px;
      color:#c59a28;
      font-size:9px;
      font-weight:800;
      letter-spacing:.18em;
      text-transform:uppercase;
    }

    .event-cancel-card h3 {
      margin:0;
      color:#164f22;
      font-size:28px;
      font-weight:500;
    }

    .event-cancel-card > p:not(.event-cancel-kicker) {
      max-width:380px;
      margin:11px auto 0;
      color:#77736a;
      font-size:12.5px;
      line-height:1.65;
    }

    .event-cancel-summary {
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:7px;
      margin-top:18px;
    }

    .event-cancel-summary span {
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:7px 9px;
      border-radius:999px;
      color:#706b61;
      background:#f6f2e8;
      font-size:10px;
      font-weight:700;
    }

    .event-cancel-summary svg { color:#1f6b2d; }

    .event-cancel-error {
      margin-top:14px;
      padding:9px 11px;
      border-radius:11px;
      color:#9c372f;
      background:#fff0ee;
      font-size:11px;
    }

    .event-cancel-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:9px;
      margin-top:20px;
    }

    .event-cancel-actions button {
      min-height:42px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      border-radius:13px;
      font-size:11.5px;
      font-weight:800;
      cursor:pointer;
    }

    .event-cancel-actions button:disabled { opacity:.6; cursor:wait; }

    .event-cancel-keep {
      color:#164f22;
      background:rgba(31,107,45,.055);
      border:1px solid rgba(31,107,45,.12);
    }

    .event-cancel-confirm {
      color:#fff;
      background:#a84137;
      border:1px solid #a84137;
    }

    .event-cancelled-shell {
      max-width:690px;
      margin:0 auto;
      padding-top:48px;
      padding-bottom:40px;
    }

    .event-cancelled-shell .event-success-icon {
      margin:0 auto 16px;
    }

    @keyframes eventSuccessIn {
      from { opacity:0; transform:translateY(15px) scale(.985); }
      to { opacity:1; transform:none; }
    }

    @keyframes eventRing {
      0% { opacity:.5; transform:scale(.82); }
      80%,100% { opacity:0; transform:scale(1.34); }
    }

    @keyframes eventSpark {
      0%,100% { opacity:.18; transform:scale(.9) rotate(0); }
      50% { opacity:.58; transform:scale(1.1) rotate(8deg); }
    }

    @keyframes eventCancelIn {
      from { opacity:0; transform:translateY(12px) scale(.97); }
      to { opacity:1; transform:none; }
    }

    @media (max-width:760px) {
      .event-success-shell { padding:34px 15px 22px; border-radius:23px; }
      .event-success-grid { grid-template-columns:1fr 1fr; gap:9px; }
      .event-success-title { font-size:34px; }
      .event-success-actions { flex-direction:column; }
      .event-primary-action,
      .event-secondary-action,
      .event-danger-action { width:100%; }
      .event-cancel-actions { grid-template-columns:1fr; }
    }

    @media (max-width:520px) {
      .event-success-grid {
        grid-template-columns:1fr;
      }

      .event-success-info {
        padding:13px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .event-success-shell,
      .event-success-icon-wrap > span,
      .event-success-spark,
      .event-cancel-card {
        animation:none !important;
      }
    }
  `}</style>
);

export default EventForm;
