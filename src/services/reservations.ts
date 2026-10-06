// src/services/reservations.ts
// Adapté au schéma réel de TableReservationIn (schemas.py) : first_name /
// last_name séparés, email OBLIGATOIRE, phone (pas tel), guests (pas
// convives), table_ids en plus des champs déjà existants.

const API = import.meta.env.VITE_API_URL; // ex. https://ton-backend.railway.app

export interface Disponibilite {
  occupied_table_ids: (number | string)[];
  duration_minutes: number;
}

export interface Contact {
  nom: string; // "Prénom Nom" tel que saisi dans le formulaire
  tel: string;
  email: string; // devient obligatoire — voir note plus bas sur le formulaire
  note?: string;
}

export interface DemandeReservation {
  date: string; // "2026-08-14"
  creneau: string; // "20:00"
  tables: (number | string)[];
  convives: number;
  contact: Contact;
  lang: string;
}

export class TableDejaPrise extends Error {
  constructor(public tables: (number | string)[]) {
    super("409");
  }
}
export class ChampsInvalides extends Error {
  constructor(public detail: unknown) {
    super("422");
  }
}

/** "Erij Mazouz" -> { first_name: "Erij", last_name: "Mazouz" }.
 *  Si un seul mot est saisi, il part entièrement en last_name — à ajuster
 *  si le formulaire est un jour scindé en deux champs séparés (préférable). */
function scinderNom(nomComplet: string): {
  first_name: string;
  last_name: string;
} {
  const mots = nomComplet.trim().split(/\s+/);
  if (mots.length === 1) return { first_name: "", last_name: mots[0] };
  return { first_name: mots[0], last_name: mots.slice(1).join(" ") };
}

export async function getDisponibilites(
  date: string,
  creneau: string,
  signal?: AbortSignal,
): Promise<Disponibilite> {
  const r = await fetch(
    `${API}/table-reservations/availability?date=${date}&time=${encodeURIComponent(creneau)}`,
    { signal },
  );
  if (!r.ok) throw new Error(`availability ${r.status}`);
  return r.json();
}

export async function reserver(d: DemandeReservation) {
  const { first_name, last_name } = scinderNom(d.contact.nom);

  const r = await fetch(`${API}/table-reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name,
      last_name,
      email: d.contact.email, // obligatoire : voir note formulaire ci-dessous
      phone: d.contact.tel,
      date: d.date,
      time: d.creneau,
      guests: d.convives,
      note: d.contact.note ?? "",
      language: d.lang,
      table_ids: d.tables.map(String),
    }),
  });

  if (r.status === 409) {
    const body = await r
      .json()
      .catch(() => ({ detail: { table_ids: d.tables } }));
    throw new TableDejaPrise(body?.detail?.table_ids ?? d.tables);
  }
  if (r.status === 422) {
    const body = await r.json().catch(() => ({}));
    throw new ChampsInvalides(body?.detail);
  }
  if (!r.ok) throw new Error(`reservation ${r.status}`);
  return r.json() as Promise<{
    id: number;
    table_ids: string[];
    status: string;
  }>;
}

// ─────────────── Gérer ma réservation (retrouver / modifier / annuler) ───────────────
// Le client s'identifie avec sa référence (id de la réservation) + l'e-mail
// utilisé lors de la réservation — pas de compte, pas de mot de passe.

export interface ReservationTrouvee {
  id: number;
  first_name: string;
  last_name: string;
  phone: string; // ⟵ AJOUT
  date: string;
  time: string;
  guests: number;
  table_ids: string[];
  status: string;
}

export class ReservationIntrouvable extends Error {
  constructor() {
    super("404");
  }
}
export class CreneauIndisponible extends Error {
  constructor() {
    super("409");
  }
}

export async function retrouverReservation(
  reference: number,
  email: string,
): Promise<ReservationTrouvee> {
  const r = await fetch(`${API}/table-reservations/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, email }),
  });
  if (r.status === 404) throw new ReservationIntrouvable();
  if (!r.ok) throw new Error(`lookup ${r.status}`);
  return r.json();
}

export async function modifierReservation(params: {
  reference: number;
  email: string;
  date: string;
  time: string;
  guests: number;
  table_ids?: string[];
  first_name?: string; // ⟵ AJOUT
  last_name?: string; // ⟵ AJOUT
  phone?: string; // ⟵ AJOUT
}): Promise<{ id: number; table_ids: string[]; status: string }> {
  const r = await fetch(`${API}/table-reservations/modify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (r.status === 404) throw new ReservationIntrouvable();
  if (r.status === 409) throw new CreneauIndisponible();
  if (!r.ok) throw new Error(`modify ${r.status}`);
  return r.json();
}

export async function annulerReservation(
  reference: number,
  email: string,
): Promise<{ id: number; table_ids: string[]; status: string }> {
  const r = await fetch(`${API}/table-reservations/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, email }),
  });
  if (r.status === 404) throw new ReservationIntrouvable();
  if (!r.ok) throw new Error(`cancel ${r.status}`);
  return r.json();
}
