// src/config/eventFormsConfig.ts
// Configuration des formulaires par type d'événement — Miss Chawarma
// Adapté à la réalité du restaurant : espace intérieur + terrasse, ~42 places,
// tables et chaises (pas de format debout), cuisine halal.

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "checkbox-group"
  | "radio";

export interface BilingualText {
  fr: string;
  en: string;
}

export interface FieldOption {
  value: string;
  label: BilingualText;
}

export interface EventField {
  name: string;
  type: FieldType;
  label: BilingualText;
  placeholder?: BilingualText;
  required?: boolean;
  options?: FieldOption[]; // pour select / radio / checkbox-group
}

export interface EventTypeConfig {
  id: string;
  emoji: string;
  title: BilingualText;
  subtitle: BilingualText;
  fields: EventField[];
}

// Champ réutilisé : espace souhaité (intérieur / terrasse)
const espaceField: EventField = {
  name: "espace",
  type: "radio",
  label: { fr: "Espace souhaité", en: "Preferred area" },
  options: [
    { value: "interieur", label: { fr: "Intérieur", en: "Indoor" } },
    { value: "terrasse", label: { fr: "Terrasse", en: "Terrace" } },
    { value: "indifferent", label: { fr: "Indifférent", en: "No preference" } },
  ],
};

export const EVENT_TYPES: EventTypeConfig[] = [
  {
    id: "anniversaire",
    emoji: "🎂",
    title: { fr: "Anniversaire", en: "Birthday" },
    subtitle: {
      fr: "Fêtez ça autour d'un festin libanais",
      en: "Celebrate with a Lebanese feast",
    },
    fields: [
      espaceField,
      {
        name: "gateau",
        type: "radio",
        label: {
          fr: "Apporterez-vous un gâteau ?",
          en: "Will you bring a cake?",
        },
        required: true,
        options: [
          { value: "oui", label: { fr: "Oui, nous l'apportons", en: "Yes, we'll bring it" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
      {
        name: "decoration",
        type: "radio",
        label: {
          fr: "Souhaitez-vous décorer la table ? (ballons, etc.)",
          en: "Would you like to decorate the table? (balloons, etc.)",
        },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
      {
        name: "allergies",
        type: "text",
        label: { fr: "Allergies ou régimes particuliers", en: "Allergies or dietary needs" },
        placeholder: { fr: "Ex : sans gluten, végétarien...", en: "E.g. gluten-free, vegetarian..." },
      },
    ],
  },
  {
    id: "seminaire",
    emoji: "💼",
    title: { fr: "Séminaire / Team building", en: "Seminar / Team building" },
    subtitle: {
      fr: "Réunissez votre équipe dans un cadre chaleureux",
      en: "Bring your team together in a warm setting",
    },
    fields: [
      {
        name: "entreprise",
        type: "text",
        label: { fr: "Nom de l'entreprise", en: "Company name" },
        required: true,
      },
      {
        name: "format",
        type: "radio",
        label: { fr: "Format souhaité", en: "Preferred format" },
        required: true,
        options: [
          { value: "dejeuner", label: { fr: "Déjeuner", en: "Lunch" } },
          { value: "diner", label: { fr: "Dîner", en: "Dinner" } },
        ],
      },
      espaceField,
      {
        name: "privatisation",
        type: "radio",
        label: {
          fr: "Souhaitez-vous réserver tout le restaurant ?",
          en: "Would you like to book the whole restaurant?",
        },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non, un espace réservé suffit", en: "No, a reserved area is enough" } },
          { value: "a-discuter", label: { fr: "À discuter", en: "To discuss" } },
        ],
      },
      {
        name: "facturation",
        type: "radio",
        label: { fr: "Facture au nom de l'entreprise ?", en: "Invoice in the company's name?" },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
    ],
  },
  {
    id: "repas-affaires",
    emoji: "🤝",
    title: { fr: "Repas d'affaires", en: "Business meal" },
    subtitle: {
      fr: "Un cadre convivial pour vos rendez-vous professionnels",
      en: "A friendly setting for your business meetings",
    },
    fields: [
      {
        name: "entreprise",
        type: "text",
        label: { fr: "Nom de l'entreprise", en: "Company name" },
        required: true,
      },
      {
        name: "table",
        type: "radio",
        label: {
          fr: "Table au calme souhaitée ?",
          en: "Quiet table preferred?",
        },
        options: [
          { value: "oui", label: { fr: "Oui, si possible", en: "Yes, if possible" } },
          { value: "indifferent", label: { fr: "Indifférent", en: "No preference" } },
        ],
      },
      {
        name: "facturation",
        type: "radio",
        label: { fr: "Facture au nom de l'entreprise ?", en: "Invoice in the company's name?" },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
      {
        name: "contraintes",
        type: "text",
        label: { fr: "Contraintes horaires", en: "Time constraints" },
        placeholder: { fr: "Ex : terminer avant 14h30", en: "E.g. must finish by 2:30pm" },
      },
    ],
  },
  {
    id: "baby-shower",
    emoji: "🍼",
    title: { fr: "Baby shower", en: "Baby shower" },
    subtitle: {
      fr: "Un moment doux à partager avant l'arrivée de bébé",
      en: "A sweet moment to share before baby arrives",
    },
    fields: [
      espaceField,
      {
        name: "gateau",
        type: "radio",
        label: {
          fr: "Apporterez-vous un gâteau ?",
          en: "Will you bring a cake?",
        },
        required: true,
        options: [
          { value: "oui", label: { fr: "Oui, nous l'apportons", en: "Yes, we'll bring it" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
      {
        name: "decoration",
        type: "radio",
        label: {
          fr: "Souhaitez-vous décorer la table ?",
          en: "Would you like to decorate the table?",
        },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
      {
        name: "allergies",
        type: "text",
        label: { fr: "Allergies ou régimes particuliers", en: "Allergies or dietary needs" },
        placeholder: { fr: "Ex : sans gluten, femme enceinte...", en: "E.g. gluten-free, pregnancy-safe..." },
      },
    ],
  },
  {
    id: "soiree-privee",
    emoji: "🎉",
    title: { fr: "Soirée privée", en: "Private party" },
    subtitle: {
      fr: "Fiançailles, retrouvailles, célébrations...",
      en: "Engagements, reunions, celebrations...",
    },
    fields: [
      {
        name: "occasion",
        type: "text",
        label: { fr: "Occasion", en: "Occasion" },
        placeholder: { fr: "Ex : fiançailles, retrouvailles, réussite...", en: "E.g. engagement, reunion, graduation..." },
        required: true,
      },
      espaceField,
      {
        name: "privatisation",
        type: "radio",
        label: {
          fr: "Souhaitez-vous réserver tout le restaurant ?",
          en: "Would you like to book the whole restaurant?",
        },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non, une grande table suffit", en: "No, a large table is enough" } },
          { value: "a-discuter", label: { fr: "À discuter", en: "To discuss" } },
        ],
      },
      {
        name: "decoration",
        type: "radio",
        label: {
          fr: "Souhaitez-vous décorer la table ?",
          en: "Would you like to decorate the table?",
        },
        options: [
          { value: "oui", label: { fr: "Oui", en: "Yes" } },
          { value: "non", label: { fr: "Non", en: "No" } },
        ],
      },
    ],
  },
  {
    id: "autre",
    emoji: "✨",
    title: { fr: "Autre événement", en: "Other event" },
    subtitle: {
      fr: "Dites-nous tout, on s'adapte",
      en: "Tell us everything, we'll adapt",
    },
    fields: [
      {
        name: "description",
        type: "textarea",
        label: { fr: "Décrivez votre événement", en: "Describe your event" },
        placeholder: {
          fr: "Type d'événement, nombre d'invités, besoins particuliers...",
          en: "Type of event, number of guests, special needs...",
        },
        required: true,
      },
      espaceField,
    ],
  },
];

export const getEventType = (id: string): EventTypeConfig | undefined =>
  EVENT_TYPES.find((e) => e.id === id);
