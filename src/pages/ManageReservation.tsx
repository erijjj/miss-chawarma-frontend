// src/pages/ManageReservation.tsx — Point d'entrée : le client entre sa
// référence + son email, puis est redirigé vers /book-a-table où le plan
// de salle se pré-remplit avec sa réservation existante, prête à modifier.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const CREAM = "#f7f0e4";

const ManageReservation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function chercher() {
    setErreur(null);
    const ref = parseInt(reference, 10);
    if (!ref || !email.trim()) {
      setErreur(t("manage.champsRequis", "Merci de renseigner la référence et l'e-mail."));
      return;
    }
    setChargement(true);
    navigate(`/book-a-table?ref=${ref}&email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM }}>
      <Header />
      <main className="flex-1 pt-[86px]">
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              color: GREEN,
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(31,107,45,0.12)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("manage.retour", "Retour")}
          </button>

          <h1 className="font-playfair text-3xl md:text-4xl" style={{ color: DARK_GREEN }}>
            {t("manage.titre", "Gérer ma réservation")}
          </h1>

          <div
            className="mt-6 rounded-[28px] p-6"
            style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(31,107,45,0.10)" }}
          >
            <p className="mb-4 text-sm text-neutral-500">
              {t(
                "manage.introTexte",
                "Entrez la référence de votre réservation (indiquée sur la page de confirmation et dans l'e-mail reçu) ainsi que l'e-mail utilisé."
              )}
            </p>
            <input
              className="mb-3 w-full rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: "rgba(31,107,45,0.15)" }}
              placeholder={t("manage.reference", "Référence (ex. 8)")}
              inputMode="numeric"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <input
              className="mb-4 w-full rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: "rgba(31,107,45,0.15)" }}
              placeholder={t("manage.email", "E-mail utilisé pour la réservation")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {erreur && <p className="mb-3 text-sm" style={{ color: "#b42318" }}>{erreur}</p>}
            <button
              type="button"
              onClick={chercher}
              disabled={chargement}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${GREEN}, ${DARK_GREEN})` }}
            >
              {chargement ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("manage.chercher", "Retrouver ma réservation")}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageReservation;
