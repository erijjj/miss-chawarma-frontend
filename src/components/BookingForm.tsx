import React, { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useTranslation } from "react-i18next";

// En local, VITE_API_URL (dans .env) prend le dessus ; sinon on retombe sur Render.
const API_URL = import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

const BookingForm = () => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState
   < "idle" | "loading" | "success" | "error"
  >("idle");

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const onlyLetters = (val: string) => /^[a-zA-ZÀ-ÿ\s'-]*$/.test(val);

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

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

  const wordCount = (text: string) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prenom.trim()) {
      newErrors.prenom = t("bookingForm.errFirstNameRequired");
    } else if (!onlyLetters(formData.prenom)) {
      newErrors.prenom = t("bookingForm.errLettersOnly");
    }

    if (!formData.nom.trim()) {
      newErrors.nom = t("bookingForm.errLastNameRequired");
    } else if (!onlyLetters(formData.nom)) {
      newErrors.nom = t("bookingForm.errLettersOnly");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("bookingForm.errEmailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("bookingForm.errEmailInvalid");
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = t("bookingForm.errPhoneRequired");
    } else if (!isValidPhoneNumber(formData.telephone)) {
      newErrors.telephone = t("bookingForm.errPhoneInvalid");
    } else if (
      !/^(\+?\d{1,3}[\s\-]?)?(\(?\d{2,4}\)?[\s\-]?){2,5}\d{2,4}$/.test(
        formData.telephone.trim(),
      )
    ) {
      newErrors.telephone = t("bookingForm.errPhoneInvalid2");
    }

    if (!formData.date) {
      newErrors.date = t("bookingForm.errDateRequired");
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (formData.date < today) {
        newErrors.date = t("bookingForm.errDatePast");
      }
    }

    if (!formData.heure) {
      newErrors.heure = t("bookingForm.errTimeRequired");
    } else if (formData.date) {
      const minTime = getMinTime(formData.date);
      const maxTime = getMaxTime(formData.date);
      const h = formData.heure;

      if (maxTime === "02:00") {
        const validAfterMidnight = h >= "00:00" && h <= "02:00";
        const validEvening = h >= minTime;
        if (!validAfterMidnight && !validEvening) {
          newErrors.heure = t("bookingForm.errTimeMin", {
            time: minTime.replace(":", "h"),
          });
        }
      } else {
        if (h < minTime) {
          newErrors.heure = t("bookingForm.errTimeMin", {
            time: minTime.replace(":", "h"),
          });
        }
        if (h > "23:59") {
          newErrors.heure = t("bookingForm.errCloseMidnight");
        }
      }
    } else if (formData.date) {
      const minTime = getMinTime(formData.date);
      const maxTime = getMaxTime(formData.date);
      if (formData.heure < minTime) {
        newErrors.heure = t("bookingForm.errTimeMin", {
          time: minTime.replace(":", "h"),
        });
      }
      if (maxTime === "00:00" && formData.heure > "23:59") {
        newErrors.heure = t("bookingForm.errCloseMidnight");
      }
      if (maxTime === "02:00" && formData.heure > "02:00") {
        newErrors.heure = t("bookingForm.errClose2am");
      }
    }

    if (!formData.personnes) {
      newErrors.personnes = t("bookingForm.errPeopleRequired");
    } else {
      const n = parseInt(formData.personnes);
      if (isNaN(n) || n < 1 || n > 42) {
        newErrors.personnes = t("bookingForm.errPeopleRange");
      }
    }

    if (wordCount(formData.demandes) > 500) {
      newErrors.demandes = t("bookingForm.errMaxWords", {
        count: wordCount(formData.demandes),
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────
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

    if (name === "date") {
      setFormData((prev) => ({ ...prev, date: value, heure: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/reservations/table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.prenom,
          last_name: formData.nom,
          email: formData.email,
          phone: formData.telephone,
          date: formData.date,
          time: formData.heure,
          guests: parseInt(formData.personnes, 10),
          note: formData.demandes || "",
          language: lang,
        }),
      });

      if (res.ok) {
        setStatus("success");

        // Copie envoyée par email (best-effort — n'affecte pas le statut affiché)
        fetch("https://formspree.io/f/meebvqlr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            Prénom: formData.prenom,
            Nom: formData.nom,
            Email: formData.email,
            Téléphone: formData.telephone,
            Date: formData.date,
            Heure: formData.heure,
            "Nombre de personnes": formData.personnes,
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
        setErrors({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
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

  const wc = wordCount(formData.demandes);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
      {/* Prénom + Nom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="prenom"
            placeholder={t("bookingForm.firstNamePlaceholder")}
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
            placeholder={t("bookingForm.lastNamePlaceholder")}
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
          placeholder={t("bookingForm.emailPlaceholder")}
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
          placeholder={t("bookingForm.phonePlaceholder")}
          value={formData.telephone}
          onChange={handleChange}
          style={errors.telephone ? inputError : inputBase}
        />
        {errorMsg("telephone")}
        {!errors.telephone && (
          <p className="text-xs mt-1 ml-1" style={{ color: "#9ca89b" }}>
            {t("bookingForm.phoneHint")}
          </p>
        )}
      </div>

      {/* Date + Heure */}
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
              cursor: !formData.date ? "not-allowed" : "auto",
            }}
          />
          {formData.date && !errors.heure && (
            <p className="text-xs mt-1 ml-1" style={{ color: "#9ca89b" }}>
              {t("bookingForm.hoursLabel")} {getDayLabel(formData.date)}
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
          placeholder={t("bookingForm.peoplePlaceholder")}
          value={formData.personnes}
          onChange={handleChange}
          min={1}
          max={42}
          style={errors.personnes ? inputError : inputBase}
        />
        {errorMsg("personnes")}
      </div>

      {/* Demandes spécifiques */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: "#1f6b2d" }}>
          {t("bookingForm.specialRequests")}
        </p>
        <textarea
          name="demandes"
          placeholder={t("bookingForm.specialRequestsPlaceholder")}
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
            {wc} / 500 {t("bookingForm.words")}
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, #c8a92d, #2d8a3e)",
          color: "#fff8d8",
          boxShadow: "0 4px 15px rgba(31,107,45,0.3)",
          letterSpacing: "0.05em",
          cursor: status === "loading" ? "not-allowed" : "pointer",
        }}
      >
        {status === "loading" ? t("bookingForm.sending") : t("bookingForm.confirm")}
      </button>

      {/* Messages retour */}
      {status === "success" && (
        <div
          className="text-center py-3 px-4 rounded-2xl text-sm font-medium"
          style={{
            background: "#1f6b2d11",
            color: "#1f6b2d",
            border: "1px solid #1f6b2d33",
          }}
        >
          {t("bookingForm.successMsg")}
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
          {t("bookingForm.errorMsg")}
        </div>
      )}
    </form>
  );
};

export default BookingForm;