// src/components/EventForm.tsx
// Formulaire dédié par type d'événement — Miss Chawarma
// Reprend toutes les validations de l'ancien formulaire (téléphone, dates,
// horaires 11h30–02h00/00h00, 42 personnes max, 500 mots max) + envoi Formspree.
// Affiché INLINE dans la page (pas en popup) pour garder le header visible (switch FR/EN).

import React, { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";
import { getEventType, EventField } from "../config/eventFormsConfig";

// En local, VITE_API_URL (dans .env) prend le dessus ; sinon on retombe sur Render.
const API_URL = import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

interface EventFormProps {
  eventTypeId: string; // "anniversaire", "seminaire", ...
  onBack: () => void; // retour au choix du type
}

type SpecificValues = Record<string, string | string[]>;

const EventForm = ({ eventTypeId, onBack }: EventFormProps) => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
  const eventType = getEventType(eventTypeId);

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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!eventType) return null;

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
    lang === "fr" ? "Ce champ est requis" : "This field is required"
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim())
      newErrors.prenom = t("eventForm.errFirstNameRequired");
    else if (!onlyLetters(formData.prenom))
      newErrors.prenom = t("eventForm.errLettersOnly");

    if (!formData.nom.trim()) newErrors.nom = t("eventForm.errLastNameRequired");
    else if (!onlyLetters(formData.nom))
      newErrors.nom = t("eventForm.errLettersOnly");

    if (!formData.email.trim()) newErrors.email = t("eventForm.errEmailRequired");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if ((name === "prenom" || name === "nom") && value !== "" && !onlyLetters(value))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");

    // Champs spécifiques : labels et valeurs toujours en FRANÇAIS
    const specificPayload: Record<string, string> = {};
    eventType.fields.forEach((field) => {
      const v = specific[field.name];
      if (!v || (Array.isArray(v) && v.length === 0)) return;
      specificPayload[field.label.fr] = Array.isArray(v) ? v.join(", ") : String(v);
    });
    const detailsText = Object.entries(specificPayload)
      .map(([label, value]) => `${label} : ${value}`)
      .join(" ; ");

    try {
      const res = await fetch(`${API_URL}/api/reservations/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType.title.fr,
          first_name: formData.prenom,
          last_name: formData.nom,
          email: formData.email,
          phone: formData.telephone,
          date: formData.date,
          time: formData.heure,
          guests: parseInt(formData.personnes, 10),
          details: detailsText,
          note: formData.demandes || "",
          language: lang,
        }),
      });

      if (res.ok) {
        setStatus("success");

        // Copie envoyée par email (best-effort — n'affecte pas le statut affiché)
        fetch("https://formspree.io/f/xdaryola", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            "Type d'événement": eventType.title.fr,
            Prénom: formData.prenom,
            Nom: formData.nom,
            Email: formData.email,
            Téléphone: formData.telephone,
            Date: formData.date,
            Heure: formData.heure,
            "Nombre de personnes": formData.personnes,
            ...specificPayload,
            "Demandes spécifiques": formData.demandes || "Aucune",
          }),
        }).catch(() => {});

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
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
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
                    onClick={() => toggleSpecificCheckbox(field.name, opt.label.fr)}
                    className="text-sm transition"
                    style={{
                      borderRadius: "9999px",
                      padding: "10px 18px",
                      border: selected ? "1px solid #1f6b2d" : "1px solid #e0d9cc",
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
          onClick={onBack}
          className="text-sm transition hover:opacity-70"
          style={{ color: "#9ca89b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
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
            style={errors.email ? inputError : inputBase}
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
                color: wc > 450 ? (wc > 500 ? "#e05c5c" : "#c47d0e") : "#9ca89b",
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
          {status === "loading" ? t("eventForm.sending") : t("eventForm.submit")}
        </button>

        {status === "success" && (
          <div
            className="text-center py-3 px-4 rounded-2xl text-sm font-medium"
            style={{
              background: "#1f6b2d11",
              color: "#1f6b2d",
              border: "1px solid #1f6b2d33",
            }}
          >
            {t("eventForm.successMsg")}
          </div>
        )}
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

export default EventForm;
