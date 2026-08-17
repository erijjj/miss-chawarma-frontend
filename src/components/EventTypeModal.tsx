// src/components/EventTypeModal.tsx
// Popup affiché quand l'utilisateur clique sur "Organiser un événement privé".
// Affiche les types d'événements en cartes cliquables ; le choix ouvre le formulaire dédié.

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EVENT_TYPES } from "../config/eventFormsConfig";

interface EventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (eventTypeId: string) => void;
}

export default function EventTypeModal({ isOpen, onClose, onSelect }: EventTypeModalProps) {
  const { i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";

  // Bloque le scroll de la page quand le popup est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#f5f1e6] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="mb-6 text-center relative">
          <button
            onClick={onClose}
            aria-label={lang === "fr" ? "Fermer" : "Close"}
            className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:bg-gray-100 transition"
          >
            ✕
          </button>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1f5428]">
            {lang === "fr" ? "Quel événement organisez-vous ?" : "What event are you planning?"}
          </h2>
          <p className="mt-2 text-gray-500">
            {lang === "fr"
              ? "Choisissez un type pour accéder au formulaire adapté"
              : "Pick a type to open the right form"}
          </p>
        </div>

        {/* Cartes des types d'événements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {EVENT_TYPES.map((eventType) => (
            <button
              key={eventType.id}
              onClick={() => onSelect(eventType.id)}
              className="group flex items-center gap-4 rounded-2xl border border-[#e3dcc9] bg-white p-4 text-left transition hover:border-[#2F7A3D] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7A3D]"
            >
              <span className="text-3xl" aria-hidden="true">
                {eventType.emoji}
              </span>
              <span>
                <span className="block font-semibold text-[#1f5428] group-hover:text-[#2F7A3D]">
                  {eventType.title[lang]}
                </span>
                <span className="block text-sm text-gray-500">
                  {eventType.subtitle[lang]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
