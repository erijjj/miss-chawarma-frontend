import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getDisponibilites, reserver as reserverAPI, TableDejaPrise, ChampsInvalides } from "../services/reservations";
import { useTranslation } from "react-i18next";
import { Users, Clock3, CalendarDays, Check, Loader2, X, LayoutGrid, Sparkles, MapPin } from "lucide-react";

/* ============================================================
   Miss Chawarma — Plan de salle interactif
   Géométrie calée sur les photos : comptoir snack à gauche en
   entrant, bar terrazzo le long du mur en pierre à droite,
   coin Insta (mur de fleurs) au fond, terrasse sur le trottoir.
   ============================================================ */

const GREEN = "#1f6b2d";
const DARK_GREEN = "#164f22";
const GOLD = "#c59a28";
const CREAM = "#f7f0e4";

/* --- Config restaurant -------------------------------------------------- */
const USE_API = true;     // l'API réelle est branchée — ne plus repasser à false
const SIMULATION = false; // true = fausses tables occupées pour la démo, sans backend
// (l'URL du backend est lue directement dans services/reservations.ts)

// Service continu, 7j/7 : 11h30 – 00h00 du lundi au mercredi,
// 11h30 – 02h00 du jeudi au dimanche. Aucune coupure l'après-midi.
const FERMETURE: Record<number, string> = {
  0: "02:00", 1: "00:00", 2: "00:00", 3: "00:00",
  4: "02:00", 5: "02:00", 6: "02:00",
};
const OUVERTURE = "11:30";
const DERNIERE_ARRIVEE_AVANT_FERMETURE = 60; // minutes
const PAS = 30;
const MAX_CONVIVES = 12;
const PLACES_PAR_TABLE = 2;

type TableId = number | string;
type Etat = "libre" | "choisie" | "occupee";
type Chaises = "g" | "d" | "2";

interface TableDef {
  id: TableId;
  x: number;
  y: number;
  chaises?: Chaises;
  places?: number;
  insta?: boolean;
  bar?: boolean;
}

const SALLE: TableDef[] = [
  { id: 21, x: 250, y: 88, chaises: "2", places: 4 },
  { id: 20, x: 250, y: 138, chaises: "2", places: 4 },

  { id: 19, x: 118, y: 192, chaises: "d", insta: true },
  { id: 18, x: 118, y: 242, chaises: "d", insta: true },

  { id: 17, x: 118, y: 305, chaises: "d" },
  { id: 16, x: 118, y: 355, chaises: "d" },
  { id: 15, x: 118, y: 405, chaises: "d" },
  { id: 14, x: 118, y: 455, chaises: "d" },

  { id: 13, x: 288, y: 300, chaises: "2" },
  { id: 12, x: 360, y: 300, chaises: "g" },
  { id: 11, x: 288, y: 350, chaises: "2" },
  { id: 10, x: 360, y: 350, chaises: "g" },
  { id: 8, x: 288, y: 400, chaises: "2" },
  { id: 9, x: 360, y: 400, chaises: "g" },

  { id: 7, x: 368, y: 455, chaises: "g", bar: true },
  { id: 6, x: 368, y: 493, chaises: "g", bar: true },
  { id: 5, x: 368, y: 531, chaises: "g", bar: true },
  { id: 4, x: 368, y: 569, chaises: "g", bar: true },
  { id: 3, x: 368, y: 607, chaises: "g", bar: true },
  { id: 2, x: 368, y: 645, chaises: "g", bar: true },
  { id: 1, x: 368, y: 683, chaises: "g", bar: true },
];

const TERRASSE: TableDef[] = [
  { id: "T1", x: 62, y: 95 },
  { id: "T2", x: 125, y: 95 },
  { id: "T3", x: 188, y: 95 },
  { id: "T4", x: 251, y: 95 },
  { id: "T5", x: 314, y: 95 },
  { id: "T6", x: 377, y: 95 },
];

const TOUTES = [...SALLE, ...TERRASSE];
const IDS = TOUTES.map((t) => t.id);

/** Le backend stocke et renvoie les identifiants de table en texte
 *  ("17"), alors que la géométrie du plan utilise des nombres pour la
 *  salle (17) et du texte pour la terrasse ("T1"). Sans cette
 *  conversion, `Set.has()` échoue silencieusement : 17 !== "17". */
function idDepuisAPI(brut: string | number): TableId {
  const trouve = IDS.find((id) => String(id) === String(brut));
  return trouve ?? brut;
}
const placesDe = (id: TableId) =>
  TOUTES.find((t) => t.id === id)?.places ?? PLACES_PAR_TABLE;

/** Tables indissociables : réserver l'une réserve l'autre automatiquement. */
const PAIRES_FORCEES: [TableId, TableId][] = [
  [13, 12],
  [11, 10],
  [8, 9],
];
const partenaireDe = (id: TableId): TableId | undefined => {
  for (const [a, b] of PAIRES_FORCEES) {
    if (id === a) return b;
    if (id === b) return a;
  }
  return undefined;
};

/** Coin insta : 18 et 19 restent libres séparément, mais réunis ils
 *  offrent 5 places (pas 2+2=4) — bonus, pas contrainte de couplage. */
const INSTA_A: TableId = 19;
const INSTA_B: TableId = 18;
const INSTA_PLACES_COMBINE = 5;

function placesTotal(ids: TableId[]): number {
  const set = new Set(ids);
  const comptes = new Set<TableId>();
  let total = 0;
  for (const id of ids) {
    if (comptes.has(id)) continue;
    if ((id === INSTA_A || id === INSTA_B) && set.has(INSTA_A) && set.has(INSTA_B)) {
      total += INSTA_PLACES_COMBINE;
      comptes.add(INSTA_A);
      comptes.add(INSTA_B);
      continue;
    }
    total += placesDe(id);
    comptes.add(id);
  }
  return total;
}

const COUVERTS_SALLE = placesTotal(SALLE.map((t) => t.id));
const COUVERTS_TERRASSE = placesTotal(TERRASSE.map((t) => t.id));

/** Une unité = un groupe de tables qui se réservent toujours ensemble
 *  (une seule table pour les cas simples, une paire forcée sinon). Les
 *  chaînes ci-dessous décrivent quelles unités voisines le personnel
 *  peut rapprocher pour un grand groupe. */
interface Unite { ids: TableId[]; places: number }
const U = (ids: TableId[], places?: number): Unite => ({
  ids, places: places ?? ids.reduce<number>((n, id) => n + placesDe(id), 0),
});

const U21 = U([21]);
const U20 = U([20]);
const U_INSTA = U([19, 18], INSTA_PLACES_COMBINE);
const U17 = U([17]); const U16 = U([16]); const U15 = U([15]); const U14 = U([14]);
const U_13_12 = U([13, 12]); // paire forcée
const U_11_10 = U([11, 10]); // paire forcée
const U_8_9 = U([8, 9]);     // paire forcée
const U7 = U([7]); const U6 = U([6]); const U5 = U([5]); const U4 = U([4]);
const U3 = U([3]); const U2 = U([2]); const U1 = U([1]);
const UT1 = U(["T1"]); const UT2 = U(["T2"]); const UT3 = U(["T3"]);
const UT4 = U(["T4"]); const UT5 = U(["T5"]); const UT6 = U(["T6"]);

const CHAINES: Unite[][] = [
  [U21, U20],
  [U_INSTA],
  [U17, U16, U15, U14],
  [U_13_12, U_11_10, U_8_9], // les trois paires s'enchaînent verticalement
  [U7, U6, U5, U4, U3, U2, U1],
  [UT1, UT2, UT3, UT4, UT5, UT6],
];



/* --- Créneaux ----------------------------------------------------------- */
const enMinutes = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return a * 60 + b;
};
const enHeure = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function creneauxDuJour(iso: string): string[] {
  const jour = new Date(`${iso}T12:00:00`).getDay();
  let fin = enMinutes(FERMETURE[jour]);
  if (fin < enMinutes(OUVERTURE)) fin += 24 * 60; // ferme après minuit
  const debut = enMinutes(OUVERTURE);
  const derniere = fin - DERNIERE_ARRIVEE_AVANT_FERMETURE;

  const out: string[] = [];
  for (let m = debut; m <= derniere; m += PAS) out.push(enHeure(m));
  return out;
}

/* --- Disponibilités simulées (remplacées par l'API) --------------------- */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function occupeesSimulees(iso: string, creneau: string): Set<TableId> {
  const jour = new Date(`${iso}T12:00:00`).getDay();
  const weekend = jour === 5 || jour === 6 || jour === 0;
  const soir = enMinutes(creneau) >= enMinutes("19:00");
  const taux = 16 + (weekend ? 20 : 0) + (soir ? 16 : 0);
  const occ = new Set<TableId>();
  IDS.forEach((id) => { if (hash(iso + creneau + id) % 100 < taux) occ.add(id); });
  return occ;
}

/* --- Recherche d'un bloc de tables voisines libres ---------------------- */
function chercherBloc(
  nb: number,
  occupees: Set<TableId>,
  depart: TableId | null = null
): TableId[] | null {
  const uniteLibre = (u: Unite) => u.ids.every((id) => !occupees.has(id));

  let meilleur: TableId[] | null = null;
  let meilleurScore = Infinity;

  for (const chaine of CHAINES) {
    for (let i = 0; i < chaine.length; i++) {
      const bloc: Unite[] = [];
      let places = 0;

      for (let j = i; j < chaine.length; j++) {
        const u = chaine[j];
        if (!uniteLibre(u)) break;
        bloc.push(u);
        places += u.places;
        if (places < nb) continue;

        const idsBloc = bloc.flatMap((x) => x.ids);
        if (depart !== null && !idsBloc.includes(depart)) break;

        const score = (places - nb) * 10 + idsBloc.length;
        if (score < meilleurScore) {
          meilleurScore = score;
          meilleur = idsBloc;
        }
        break;
      }
    }
  }
  return meilleur;
}

const toISO = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

/* ======================================================================== */
const PlanDeSalle: React.FC = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || "fr";

  const jours = useMemo(() => {
    const out: Date[] = [];
    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  const [date, setDate] = useState(toISO(jours[0]));
  const [creneau, setCreneau] = useState("20:00");
  const [convives, setConvives] = useState(2);
  const [selection, setSelection] = useState<TableId[]>([]);
  const [occupees, setOccupees] = useState<Set<TableId>>(new Set());
  const [chargement, setChargement] = useState(false);
  const [etape, setEtape] = useState<"plan" | "contact" | "confirme">("plan");
  const [envoi, setEnvoi] = useState(false);
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [contact, setContact] = useState({ nom: "", tel: "", email: "", note: "" });
  const [planOuvert, setPlanOuvert] = useState(false);
  const [personnalise, setPersonnalise] = useState(false); // false = suggestion auto encore active
  const [selectionAvant, setSelectionAvant] = useState<TableId[]>([]);

  const placesSelection = placesTotal(selection);
  const listeCreneaux = useMemo(() => creneauxDuJour(date), [date]);
  const derniereArrivee = listeCreneaux[listeCreneaux.length - 1];

  const dateLongue = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, {
      weekday: "long", day: "numeric", month: "long",
    });

  /* --- disponibilités --- */
  const charger = useCallback(
    async (signal?: AbortSignal) => {
      if (!USE_API) {
        setOccupees(SIMULATION ? occupeesSimulees(date, creneau) : new Set<TableId>());
        return;
      }
      setChargement(true);
      try {
        const d = await getDisponibilites(date, creneau, signal);
        setOccupees(new Set<TableId>(d.occupied_table_ids.map(idDepuisAPI)));
        setMessage((m) => (m === "reseau" ? null : m));
      } catch (e: any) {
        if (e?.name !== "AbortError") setMessage("reseau");
      } finally {
        setChargement(false);
      }
    },
    [date, creneau]
  );

  useEffect(() => {
    const ac = new AbortController();
    charger(ac.signal);
    const timer = USE_API ? window.setInterval(() => charger(), 20000) : undefined;
    return () => { ac.abort(); if (timer) clearInterval(timer); };
  }, [charger]);

  /* --- le créneau doit exister dans le service choisi --- */
  useEffect(() => {
    if (!listeCreneaux.includes(creneau) && listeCreneaux.length) {
      setCreneau(listeCreneaux.includes("20:00") ? "20:00" : listeCreneaux[0]);
    }
  }, [listeCreneaux]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- proposition automatique --- */
  // Suggestion automatique — on propose une table par défaut, mais dès que
  // le client touche le plan lui-même (choisirTable), on ne le contredit plus :
  // il reste libre de choisir n'importe quelle table, y compris une seule
  // pour tout le groupe, ou plusieurs tables qui ne se touchent pas.
  useEffect(() => {
    if (etape === "confirme" || personnalise) return;
    if (convives > MAX_CONVIVES) { setSelection([]); return; }
    const bloc = chercherBloc(convives, occupees);
    setSelection(bloc ?? []);
    setMessage(bloc ? null : "complet");
  }, [occupees, convives, personnalise]); // eslint-disable-line react-hooks/exhaustive-deps

  const etat = (id: TableId): Etat =>
    occupees.has(id) ? "occupee" : selection.includes(id) ? "choisie" : "libre";

  function ouvrirPlan() {
    setSelectionAvant(selection);
    setPlanOuvert(true);
  }
  function annulerPlan() {
    setSelection(selectionAvant);
    if (selectionAvant.length === 0) setPersonnalise(false);
    setPlanOuvert(false);
  }

  useEffect(() => {
    if (!planOuvert) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") annulerPlan(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = avant;
      window.removeEventListener("keydown", onKey);
    };
  }, [planOuvert]); // eslint-disable-line react-hooks/exhaustive-deps

  const couvertsLibres = IDS.filter((id) => !occupees.has(id))
    .reduce<number>((n, id) => n + placesDe(id), 0);

  function choisirTable(id: TableId) {
    if (occupees.has(id) || etape === "confirme" || convives > MAX_CONVIVES) return;

    const partenaire = partenaireDe(id);
    if (partenaire !== undefined && occupees.has(partenaire)) {
      setMessage("paireIndisponible");
      return;
    }
    const cible = partenaire !== undefined ? [id, partenaire] : [id];
    const dejaTout = cible.every((t) => selection.includes(t));

    // On peut toujours désélectionner. Mais on ne peut pas AJOUTER une
    // table si la sélection actuelle couvre déjà le nombre de convives —
    // il faut d'abord libérer une table avant d'en choisir une autre.
    if (!dejaTout && placesTotal(selection) >= convives) {
      setMessage("dejaSuffisant");
      return;
    }

    setPersonnalise(true);
    setMessage(null);
    setSelection((prev) =>
      dejaTout
        ? prev.filter((x) => !cible.includes(x))
        : [...prev.filter((x) => !cible.includes(x)), ...cible]
    );
  }

  /** Complète la sélection pour atteindre le nombre de convives, en
   *  respectant les paires forcées et sans toucher aux tables déjà retenues. */
  function completerSelection() {
    const manque = convives - placesTotal(selection);
    if (manque <= 0) return;

    let meilleureCible: TableId[] | null = null;
    let meilleurEcart = Infinity;

    for (const id of IDS) {
      if (occupees.has(id) || selection.includes(id)) continue;
      const partenaire = partenaireDe(id);
      if (partenaire !== undefined && (occupees.has(partenaire) || selection.includes(partenaire))) continue;
      const cible = partenaire !== undefined ? [id, partenaire] : [id];
      const capacite = placesTotal(cible);
      const ecart = Math.abs(capacite - manque);
      if (ecart < meilleurEcart) { meilleurEcart = ecart; meilleureCible = cible; }
    }

    if (meilleureCible) {
      setSelection((prev) => [...prev, ...(meilleureCible as TableId[])]);
      setMessage(null);
    }
  }

  async function confirmer() {
    if (!contact.nom.trim() || !contact.tel.trim()) { setMessage("champs"); return; }
    if (!contact.email.trim()) { setMessage("emailRequis"); return; }

    if (!USE_API) {
      setOccupees((prev) => new Set([...prev, ...selection]));
      setReference("DEMO");
      setEtape("confirme");
      return;
    }

    setEnvoi(true);
    try {
      const rep = await reserverAPI({
        date, creneau, tables: selection, convives, contact, lang: locale,
      });
      setReference(String(rep.id));
      setEtape("confirme");
      setMessage(null);
    } catch (e) {
      if (e instanceof TableDejaPrise) {
        setOccupees((prev) => new Set([...prev, ...e.tables.map((t) => idDepuisAPI(String(t)))]));
        setSelection([]);
        setEtape("plan");
        setMessage("pris");
      } else if (e instanceof ChampsInvalides) {
        setMessage("champs");
      } else {
        setMessage("reseau");
      }
    } finally {
      setEnvoi(false);
    }
  }

  function recommencer() {
    setEtape("plan");
    setPersonnalise(false);
    setContact({ nom: "", tel: "", email: "", note: "" });
    setSelection(chercherBloc(convives, occupees) ?? []);
  }

  /* ---------------------------------------------------------------- */
  if (etape === "confirme") {
    return (
      <div className="plan-root text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #3f934d)` }}
        >
          <Check size={28} />
        </div>

        <h3 className="font-playfair text-3xl md:text-4xl" style={{ color: DARK_GREEN }}>
          {t("plan.merci", "Table réservée")}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-500">
          {t("plan.merciTexte", "Nous vous attendons. Un message de confirmation vous parvient sous peu.")}
        </p>

        <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3 text-left">
          <dt className="plan-dt">{t("plan.date", "Date")}</dt>
          <dd className="plan-dd">{dateLongue(date)}</dd>
          <dt className="plan-dt">{t("plan.heure", "Heure")}</dt>
          <dd className="plan-dd">{creneau}</dd>
          <dt className="plan-dt">{t("plan.convives", "Convives")}</dt>
          <dd className="plan-dd">{convives}</dd>
          <dt className="plan-dt">
            {selection.length > 1 ? t("plan.tables", "Tables") : t("plan.table", "Table")}
          </dt>
          <dd className="plan-dd">{selection.join(" + ")}</dd>
          {reference && reference !== "DEMO" && (
            <>
              <dt className="plan-dt">{t("plan.reference", "Référence")}</dt>
              <dd className="plan-dd">{reference}</dd>
            </>
          )}
        </dl>

        <button
          type="button"
          onClick={recommencer}
          className="mt-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
          style={{ color: DARK_GREEN, background: "rgba(31,107,45,0.08)", border: "1px solid rgba(31,107,45,0.16)" }}
        >
          {t("plan.autre", "Réserver une autre table")}
        </button>
        <StyleBlock />
      </div>
    );
  }

  return (
    <div className="plan-root">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* ---------------- Réglages ---------------- */}
        <div className="plan-panel">
          <div className="plan-field">
            <span className="plan-label">
              <CalendarDays size={14} className="mr-1.5 inline" style={{ color: GREEN }} />
              {t("plan.jour", "Jour")}
            </span>
            <div className="plan-days">
              {jours.map((d) => {
                const iso = toISO(d);
                return (
                  <button
                    key={iso}
                    type="button"
                    className="plan-day"
                    data-on={date === iso ? 1 : 0}
                    onClick={() => setDate(iso)}
                  >
                    <span>{d.toLocaleDateString(locale, { weekday: "short" }).replace(".", "")}</span>
                    <b>{d.getDate()}</b>
                    <span>{d.toLocaleDateString(locale, { month: "short" }).replace(".", "")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="plan-field">
            <span className="plan-label">
              <Clock3 size={14} className="mr-1.5 inline" style={{ color: GOLD }} />
              {t("plan.arrivee", "Heure d'arrivée")}
            </span>
            <div className="plan-chips plan-chips-scroll">
              {listeCreneaux.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="plan-chip"
                  data-on={creneau === c ? 1 : 0}
                  onClick={() => setCreneau(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="plan-aide" style={{ marginTop: 10 }}>
              {t("plan.continu", "Service continu · dernière arrivée à {{h}}", { h: derniereArrivee })}
            </p>
          </div>

          <div className="plan-field">
            <span className="plan-label">
              <Users size={14} className="mr-1.5 inline" style={{ color: GREEN }} />
              {t("plan.convives", "Convives")}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="plan-step"
                onClick={() => setConvives((n) => Math.max(1, n - 1))}
                disabled={convives <= 1}
                aria-label={t("plan.moins", "Retirer un convive")}
              >
                –
              </button>
              <output className="font-playfair text-3xl" style={{ color: DARK_GREEN }}>
                {convives}
              </output>
              <button
                type="button"
                className="plan-step"
                onClick={() => setConvives((n) => Math.min(20, n + 1))}
                disabled={convives >= 20}
                aria-label={t("plan.plus", "Ajouter un convive")}
              >
                +
              </button>
              <small className="text-xs leading-tight text-neutral-400">
                {convives > MAX_CONVIVES
                  ? t("plan.privatisationCourt", "au-delà de 12, c'est une privatisation")
                  : selection.length
                    ? t("plan.selectionResume", "{{t}} table(s) · {{p}} couverts", {
                        t: selection.length, p: placesSelection })
                    : t("plan.aucuneTable", "aucune table retenue")}
              </small>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[rgba(31,107,45,0.10)] pt-4">
            <span className="plan-label mb-0">
              {chargement ? (
                <Loader2 size={14} className="mr-1.5 inline animate-spin" />
              ) : (
                <i className="plan-dot" />
              )}
              {t("plan.libres", "Couverts libres à {{h}}", { h: creneau })}
            </span>
            <b className="font-playfair text-3xl" style={{ color: DARK_GREEN }}>
              {couvertsLibres}
            </b>
          </div>
        </div>

        {/* ---------------- Carte sélection ---------------- */}
        <div className="plan-panel plan-choix">
          {convives > MAX_CONVIVES ? (
            <div className="plan-alert" style={{ marginTop: 0 }}>
              {t("plan.privatisation",
                "À partir de 13 personnes nous privatisons une partie de la salle. Passez par « Organiser un événement privé » — anniversaire, séminaire, repas d'affaires, baby shower ou soirée privée, jusqu'à 42 convives.")}
            </div>
          ) : (
            <>
              <span className="plan-label">{t("plan.votreTable", "Votre table")}</span>

              {selection.length ? (
                <div className="plan-choix-tables">
                  {selection.map((id) => (
                    <span key={String(id)} className="plan-jeton">{id}</span>
                  ))}
                  <span className="plan-choix-txt">
                    {selection.length > 1
                      ? t("plan.rapprochees", "rapprochées pour {{n}} convives", { n: convives })
                      : t("plan.pour", "pour {{n}} convives", { n: convives })}
                  </span>
                </div>
              ) : (
                <p className="plan-choix-vide">
                  {t("plan.aucune", "Aucune table retenue pour l'instant.")}
                </p>
              )}

              <button type="button" className="plan-cta plan-cta-large" onClick={ouvrirPlan}>
                <LayoutGrid size={16} />
                {selection.length
                  ? t("plan.changerPlan", "Changer de table sur le plan")
                  : t("plan.ouvrirPlan", "Choisir ma table sur le plan")}
              </button>

              {message === "complet" && (
                <div className="plan-alert">
                  {t("plan.msgComplet", "Pas assez de places voisines à {{h}} pour {{n}} convives. Essayez un autre créneau ou la terrasse.", { h: creneau, n: convives })}
                </div>
              )}
              {message === "pris" && (
                <div className="plan-alert">
                  {t("plan.msgPris", "Quelqu'un vient de prendre cette table. Nous avons rafraîchi le plan.")}
                </div>
              )}
              {message === "paireIndisponible" && (
                <div className="plan-alert">
                  {t("plan.msgPaire", "Cette table est indissociable de sa voisine, déjà réservée. Choisissez-en une autre.")}
                </div>
              )}
              {message === "champs" && (
                <div className="plan-alert">
                  {t("plan.msgChamps", "Il nous faut au moins un nom et un numéro.")}
                </div>
              )}
              {message === "emailRequis" && (
                <div className="plan-alert">
                  {t("plan.msgEmail", "Un e-mail valide est nécessaire pour confirmer la réservation.")}
                </div>
              )}
              {message === "reseau" && (
                <div className="plan-alert">
                  {t("plan.msgReseau", "Connexion perdue avec le restaurant. Réessayez dans un instant ou appelez-nous.")}
                </div>
              )}

              {selection.length > 0 && (
                <div className="plan-contact">
                  <span className="plan-label">{t("plan.coordonnees", "Vos coordonnées")}</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="plan-input"
                      placeholder={t("plan.nom", "Nom et prénom")}
                      value={contact.nom}
                      onChange={(e) => setContact({ ...contact, nom: e.target.value })}
                    />
                    <input
                      className="plan-input"
                      inputMode="tel"
                      placeholder={t("plan.tel", "Téléphone")}
                      value={contact.tel}
                      onChange={(e) => setContact({ ...contact, tel: e.target.value })}
                    />
                  </div>
                  <input
                    className="plan-input mt-3"
                    inputMode="email"
                    placeholder={t("plan.email", "E-mail")}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                  <input
                    className="plan-input mt-3"
                    placeholder={t("plan.note", "Allergie, poussette, anniversaire…")}
                    value={contact.note}
                    onChange={(e) => setContact({ ...contact, note: e.target.value })}
                  />
                  <button type="button" className="plan-cta plan-cta-large mt-4" onClick={confirmer} disabled={envoi}>
                    {envoi ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {t("plan.confirmer", "Confirmer la réservation")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------------- Modale plan ---------------- */}
      {planOuvert && createPortal(
        <div className="plan-modal-fond" role="dialog" aria-modal="true"
          aria-label={t("plan.a11ySalle", "Plan de la salle, 21 tables")}
          onClick={(e) => { if (e.target === e.currentTarget) annulerPlan(); }}>
          <div className="plan-modal">
            <div className="plan-modal-ambient" aria-hidden="true">
              <span className="plan-particle plan-particle-1" />
              <span className="plan-particle plan-particle-2" />
              <span className="plan-particle plan-particle-3" />
              <span className="plan-particle plan-particle-4" />
            </div>
            <header className="plan-modal-tete">
              <div>
                <p className="plan-label" style={{ marginBottom: 4 }}>
                  {dateLongue(date)} · {creneau} · {convives}{" "}
                  {convives > 1 ? t("plan.convivesMin", "convives") : t("plan.convive", "convive")}
                </p>
                <div className="plan-modal-title-row">
                  <span className="plan-modal-title-icon"><Sparkles size={16} /></span>
                  <h3 className="font-playfair" style={{ fontSize: 28, color: DARK_GREEN, margin: 0 }}>
                    {t("plan.titreModale", "Choisissez votre table")}
                  </h3>
                </div>
              </div>
              <button type="button" className="plan-fermer" onClick={annulerPlan}
                aria-label={t("plan.fermer", "Fermer le plan")}>
                <X size={18} />
              </button>
            </header>

            <div className="plan-modal-corps">
              <div className="plan-scene">
                <div className="plan-stage-shell">
                  <div className="plan-stage-label">
                    <MapPin size={13} />
                    {t("plan.vousEtesIci", "Vous êtes ici")}
                  </div>
                  <PlanSalle etat={etat} onPick={choisirTable} className="plan-svg-salle" />
                </div>
                <div className="plan-scene-cote">
                  <div className="plan-terrasse-shell">
                    <PlanTerrasse etat={etat} onPick={choisirTable} className="plan-svg-terrasse" />
                  </div>
                  <div className="plan-selection-preview">
                    <span className="plan-selection-kicker">{t("plan.votreTable", "Votre table")}</span>
                    <div className="plan-selection-main">
                      <span className="plan-selection-number">
                        {selection.length ? selection.join(" + ") : "—"}
                      </span>
                      <span className="plan-selection-copy">
                        {selection.length
                          ? t("plan.selectionPremium", "{{p}} places pour {{n}} convives", { p: placesSelection, n: convives })
                          : t("plan.selectionPremiumVide", "Touchez une table libre pour la sélectionner")}
                      </span>
                    </div>
                  </div>
                  <div className="plan-legend">
                    <span><i style={{ background: "#f2efe4" }} />{t("plan.libre", "libre")}</span>
                    <span><i style={{ background: GOLD }} />{t("plan.votre", "votre table")}</span>
                    <span><i style={{ background: "#d9d3c4" }} />{t("plan.prise", "déjà réservée")}</span>
                  </div>
                  <p className="plan-aide">
                    {t("plan.capacite", "{{s}} couverts en salle · {{t}} en terrasse", {
                      s: COUVERTS_SALLE, t: COUVERTS_TERRASSE })}
                  </p>
                  <p className="plan-aide">
                    {t("plan.aideLibre", "Touchez une table libre pour la retenir, où que ce soit dans la salle — sans dépasser {{n}} convives.", { n: convives })}
                  </p>
                  {personnalise && placesSelection > 0 && placesSelection < convives && (
                    <div className="plan-alert plan-alert-action">
                      <span>
                        {t("plan.manquePlaces", "{{p}} places retenues sur {{n}} nécessaires.", { p: placesSelection, n: convives })}
                      </span>
                      <button type="button" className="plan-ghost plan-ghost-petit" onClick={completerSelection}>
                        {t("plan.completer", "Ajouter une table")}
                      </button>
                    </div>
                  )}
                  {message === "paireIndisponible" && (
                    <div className="plan-alert">
                      {t("plan.msgPaire", "Cette table est indissociable de sa voisine, déjà réservée. Choisissez-en une autre.")}
                    </div>
                  )}
                  {message === "dejaSuffisant" && (
                    <div className="plan-alert">
                      {t("plan.msgSuffisant", "Vous avez déjà assez de places pour {{n}} convives. Désélectionnez une table avant d'en choisir une autre.", { n: convives })}
                    </div>
                  )}
                  {personnalise && placesSelection > convives && (
                    <p className="plan-aide" style={{ color: GOLD }}>
                      {t("plan.placesEnPlus", "{{p}} places retenues pour {{n}} convives — un peu large, mais tout à vous.", { p: placesSelection, n: convives })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <footer className="plan-modal-pied">
              <p>
                {selection.length ? (
                  <>
                    <span className="plan-bar-tables">
                      {selection.length > 1 ? t("plan.tables", "Tables") : t("plan.table", "Table")}{" "}
                      {selection.join(" + ")}
                    </span>
                    <br />
                    {couvertsLibres} {t("plan.couvertsLibresCourt", "couverts libres à ce créneau")}
                  </>
                ) : (
                  t("plan.choisir", "Choisissez une table sur le plan")
                )}
              </p>
              <div className="flex gap-2">
                <button type="button" className="plan-ghost" onClick={annulerPlan}>
                  {t("plan.annuler", "Annuler")}
                </button>
                <button type="button" className="plan-cta" disabled={!selection.length}
                  onClick={() => setPlanOuvert(false)}>
                  {t("plan.valider", "Valider cette table")}
                </button>
              </div>
            </footer>
          </div>
        </div>,
        document.body
      )}
      <StyleBlock />
    </div>
  );
};

export default PlanDeSalle;

/* ======================================================================== */
/*  Dessin du plan                                                          */
/* ======================================================================== */
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

const Defs = () => (
  <defs>
    <pattern id="mcTerrazzo" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill="#f2efe4" />
      <circle cx="4" cy="5" r="1.5" fill="#8a9a78" opacity=".5" />
      <circle cx="13" cy="3" r="1" fill={GOLD} opacity=".55" />
      <circle cx="9" cy="12" r="1.7" fill="#9a968a" opacity=".45" />
      <circle cx="16" cy="14" r="1" fill="#8a9a78" opacity=".4" />
      <circle cx="2" cy="15" r=".9" fill={GOLD} opacity=".4" />
    </pattern>
    <pattern id="mcTerrazzoOr" width="18" height="18" patternUnits="userSpaceOnUse">
      <rect width="18" height="18" fill={GOLD} />
      <circle cx="4" cy="5" r="1.5" fill="#f0dfae" opacity=".65" />
      <circle cx="13" cy="3" r="1" fill="#8a6a16" opacity=".5" />
      <circle cx="9" cy="12" r="1.7" fill="#e4c374" opacity=".55" />
      <circle cx="16" cy="14" r="1" fill="#8a6a16" opacity=".45" />
    </pattern>
    <pattern id="mcPrise" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#d9d3c4" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="#9c9483" strokeWidth="1.3" />
    </pattern>
    <pattern id="mcSol" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="#fbf7ee" />
      <path d="M0 0 H26 M0 0 V26" stroke="#e8e0cf" strokeWidth="1" />
    </pattern>
    <pattern id="mcPierre" width="24" height="14" patternUnits="userSpaceOnUse">
      <rect width="24" height="14" fill="#c4bba9" />
      <path d="M0 7 H24 M12 0 V7 M0 14 H24 M6 7 V14" stroke="#afa694" strokeWidth="1.1" />
    </pattern>
    <linearGradient id="mcVague" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e4c374" />
      <stop offset="100%" stopColor={GOLD} />
    </linearGradient>
  </defs>
);

interface TableProps {
  t: TableDef;
  etat: Etat;
  onPick: (id: TableId) => void;
  label: string;
  w?: number;
  h?: number;
}

const Table: React.FC<TableProps> = ({ t, etat, onPick, label, w = 38, h = 28 }) => {
  const fill =
    etat === "occupee" ? "url(#mcPrise)"
    : etat === "choisie" ? "url(#mcTerrazzoOr)"
    : "url(#mcTerrazzo)";
  const gauche = t.chaises === "g" || t.chaises === "2";
  const droite = t.chaises === "d" || t.chaises === "2";

  const Chaise = ({ cx }: { cx: number }) => (
    <g opacity={etat === "occupee" ? 0.4 : 0.95}>
      <rect x={cx - 3} y={t.y - 8} width="6" height="16" rx="2.5"
        fill="#c9a46a" stroke="#22201b" strokeWidth=".8" />
      <line x1={cx} y1={t.y - 5} x2={cx} y2={t.y + 5} stroke="#5f7f6a" strokeWidth="1.6" />
    </g>
  );

  return (
    <g
      className="plan-table"
      data-etat={etat}
      style={{ "--table-delay": `${(Number(String(t.id).replace(/\D/g, "")) || 1) * 18}ms` } as React.CSSProperties}
      role="button"
      tabIndex={etat === "occupee" ? -1 : 0}
      aria-label={label}
      aria-pressed={etat === "choisie"}
      onClick={() => onPick(t.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(t.id); }
      }}
    >
      <title>{label}</title>
      {/* Zone de clic fixe : elle ne bouge jamais avec l’animation.
          Elle empêche le curseur de sortir/rentrer sans cesse de la table,
          ce qui provoquait le tremblement au survol. */}
      <rect
        className="plan-table-hitbox"
        x={t.x - w / 2 - 12}
        y={t.y - h / 2 - 10}
        width={w + 24}
        height={h + 20}
        rx="12"
        fill="transparent"
        pointerEvents="all"
      />
      {gauche && <Chaise cx={t.x - w / 2 - 7} />}
      {droite && <Chaise cx={t.x + w / 2 + 7} />}
      <g className="plan-plateau">
        <rect x={t.x - w / 2} y={t.y - h / 2} width={w} height={h} rx="6"
          fill={fill} stroke="#22201b" strokeWidth="1.4" />
        {etat === "choisie" && (
          <rect className="plan-sceau" x={t.x - w / 2 - 4} y={t.y - h / 2 - 4}
            width={w + 8} height={h + 8} rx="9" fill="none" stroke={GOLD} strokeWidth="1.3" />
        )}
        <text x={t.x} y={t.y + 4.5} textAnchor="middle" fontFamily={MONO} fontSize="13"
          fill={etat === "occupee" ? "#8b8477" : "#22201b"} style={{ pointerEvents: "none" }}>
          {t.id}
        </text>
      </g>
    </g>
  );
};

const VAGUE =
  "M215 55 C 268 118, 162 168, 215 231 C 268 294, 162 344, 215 407 " +
  "C 268 470, 162 520, 215 583 C 268 646, 168 672, 215 706";

interface PlanProps {
  etat: (id: TableId) => Etat;
  onPick: (id: TableId) => void;
  className?: string;
}

const PlanSalle: React.FC<PlanProps> = ({ etat, onPick, className }) => {
  const { t } = useTranslation();
  const label = (id: TableId, e: Etat) =>
    e === "occupee" ? t("plan.a11yPrise", "Table {{id}}, déjà réservée", { id })
    : e === "choisie" ? t("plan.a11yChoisie", "Table {{id}}, retenue pour vous", { id })
    : partenaireDe(id) !== undefined
    ? t("plan.a11yLibrePaire", "Table {{id}}, libre, indissociable de la table {{p}}", { id, p: partenaireDe(id) })
    : t("plan.a11yLibre", "Table {{id}}, libre, {{p}} couverts", { id, p: placesDe(id) });

  return (
    <svg viewBox="0 0 460 790" className={className} preserveAspectRatio="xMidYMid meet"
      role="group" aria-label={t("plan.a11ySalle", "Plan de la salle, 21 tables")}>
      <Defs />

      <rect x="40" y="40" width="380" height="680" rx="10" fill="url(#mcSol)" />
      <path d="M40 50 a10 10 0 0 1 10 -10 H410 a10 10 0 0 1 10 10 V720 H330 M300 720 H40 Z"
        fill="none" stroke="#22201b" strokeWidth="2.2" />

      {/* signature : la vague lumineuse du plafond */}
      <path d={VAGUE} fill="none" stroke="url(#mcVague)" strokeWidth="7" strokeLinecap="round" opacity=".28" />
      <path d={VAGUE} fill="none" stroke="#e4c374" strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
      {[130, 260, 390, 520, 640].map((y, i) => (
        <circle key={y} cx={215 + (i % 2 ? -26 : 26)} cy={y} r="6.5"
          fill="#fffdf7" stroke="#d8d0bd" strokeWidth="1" />
      ))}

      {/* mur en pierre, banquette, néon cèdre */}
      <rect x="400" y="262" width="19" height="456" fill="url(#mcPierre)" stroke="#22201b" strokeWidth="1.2" />
      <path d="M404 300 a6 8 0 0 1 12 0 M404 350 a6 8 0 0 1 12 0 M404 400 a6 8 0 0 1 12 0"
        fill="none" stroke="#fffdf7" strokeWidth="2" opacity=".8" />
      <path d="M409 470 l-5 9 h3 l-4 8 h4 l-4 8 h12 l-4 -8 h4 l-4 -8 h3 z" fill="#3fe27e" opacity=".9" />
      <rect x="386" y="270" width="13" height="150" rx="6" fill="#9aa894" stroke="#22201b" strokeWidth="1.1" />

      {/* comptoir snack */}
      <rect x="44" y="492" width="90" height="212" rx="8" fill="#b7bdb6" stroke="#22201b" strokeWidth="1.6" />
      <rect x="44" y="492" width="90" height="58" rx="8" fill="#9ea69c" stroke="#22201b" strokeWidth="1.2" />
      <circle cx="66" cy="521" r="9" fill="#c08a4a" stroke="#22201b" strokeWidth="1.2" />
      <circle cx="94" cy="521" r="9" fill="#c08a4a" stroke="#22201b" strokeWidth="1.2" />
      <text x="89" y="630" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="23"
        letterSpacing="4" fill="#4a4437" transform="rotate(-90 89 630)">SNACK</text>
      <text x="112" y="634" textAnchor="middle" fontFamily={MONO} fontSize="8.5"
        letterSpacing="1.4" fill="#8b8477" transform="rotate(-90 112 634)">
        {t("plan.vitrine", "BROCHES · VITRINE · CAISSE")}
      </text>

      {/* coin Insta */}
      <rect x="42" y="160" width="16" height="120" rx="4" fill="#4c6b45" stroke="#22201b" strokeWidth="1.2" />
      {Array.from({ length: 13 }).map((_, i) => (
        <circle key={i} cx={46 + (i % 3) * 5} cy={168 + i * 8.6} r="3.4"
          fill={["#e8d9c0", "#d6607a", GOLD, "#8a9a78"][i % 4]} />
      ))}
      <text x="76" y="220" textAnchor="middle" fontFamily="Playfair Display, serif"
        fontSize="15" letterSpacing="2" fill="#4a4437" transform="rotate(-90 76 220)">
        {t("plan.coinInsta", "COIN INSTA")}
      </text>
      <text x="92" y="220" textAnchor="middle" fontFamily={MONO} fontSize="8.5"
        letterSpacing="1.2" fill="#8b8477" transform="rotate(-90 92 220)">
        {t("plan.murFleurs", "MUR DE FLEURS · NÉON")}
      </text>
      <rect x="60" y="160" width="76" height="11" rx="5" fill="#9aa894" stroke="#22201b" strokeWidth="1" />
      <rect x="60" y="269" width="76" height="11" rx="5" fill="#9aa894" stroke="#22201b" strokeWidth="1" />

      {/* fond de salle */}
      <rect x="300" y="42" width="82" height="12" rx="4" fill="#4c6b45" stroke="#22201b" strokeWidth="1.2" />
      <text x="341" y="70" textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="1.2" fill="#8b8477">
        {t("plan.cuisine", "CUISINE · WC")}
      </text>

      {SALLE.map((tb) => (
        <Table key={String(tb.id)} t={tb} etat={etat(tb.id)} onPick={onPick}
          label={label(tb.id, etat(tb.id))} w={(tb.places ?? PLACES_PAR_TABLE) >= 4 ? 50 : 38} />
      ))}

      {/* devanture + entrée */}
      <path d="M40 720 H300" stroke="#22201b" strokeWidth="5" />
      <path d="M40 714 H300" stroke="#b9d4d8" strokeWidth="3" opacity=".8" />
      <text x="170" y="742" textAnchor="middle" fontFamily={MONO} fontSize="9" letterSpacing="1.6" fill="#8b8477">
        {t("plan.vitrineRue", "VITRINE SUR RUE")}
      </text>
      <path d="M300 720 H330" stroke="#22201b" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M315 760 V730 M308 740 l7 -10 7 10" fill="none" stroke="#22201b" strokeWidth="1.8" />
      <text x="315" y="778" textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="1.6" fill="#6e6857">
        {t("plan.entree", "ENTRÉE")}
      </text>

      <path d="M40 30 H420 M40 25 v10 M420 25 v10" stroke="#c3bcab" strokeWidth="1" />
      <text x="230" y="20" textAnchor="middle" fontFamily={MONO} fontSize="10" letterSpacing="1.5" fill="#8b8477">
        {t("plan.legendeSalle", "SALLE · 21 TABLES")}
      </text>
    </svg>
  );
};

const PlanTerrasse: React.FC<PlanProps> = ({ etat, onPick, className }) => {
  const { t } = useTranslation();
  const label = (id: TableId, e: Etat) =>
    e === "occupee" ? t("plan.a11yPrise", "Table {{id}}, déjà réservée", { id })
    : e === "choisie" ? t("plan.a11yChoisie", "Table {{id}}, retenue pour vous", { id })
    : partenaireDe(id) !== undefined
    ? t("plan.a11yLibrePaire", "Table {{id}}, libre, indissociable de la table {{p}}", { id, p: partenaireDe(id) })
    : t("plan.a11yLibre", "Table {{id}}, libre, {{p}} couverts", { id, p: placesDe(id) });

  return (
    <svg viewBox="0 0 460 190" className={className} preserveAspectRatio="xMidYMid meet"
      role="group" aria-label={t("plan.a11yTerrasse", "Plan de la terrasse, 6 tables")}>
      <Defs />
      <rect x="40" y="16" width="380" height="26" rx="6" fill={DARK_GREEN} />
      <text x="230" y="35" textAnchor="middle" fontFamily="Playfair Display, serif"
        fontSize="16" fontStyle="italic" fill="#e4c374">
        Miss Chawarma
      </text>
      <path d="M40 44 H420" stroke="#22201b" strokeWidth="2" />

      {TERRASSE.map((tb) => (
        <Table key={String(tb.id)} t={tb} etat={etat(tb.id)} onPick={onPick}
          label={label(tb.id, etat(tb.id))} w={42} h={30} />
      ))}

      <path d="M40 158 H420" stroke="#22201b" strokeWidth="1.2" strokeDasharray="8 5" />
      <text x="40" y="178" fontFamily={MONO} fontSize="9" letterSpacing="1.3" fill="#8b8477">
        {t("plan.legendeTerrasse", "TERRASSE · 6 TABLES")}
      </text>
      <text x="420" y="178" textAnchor="end" fontFamily={MONO} fontSize="9" letterSpacing="1.3" fill="#8b8477">
        {t("plan.trottoir", "TROTTOIR")}
      </text>
    </svg>
  );
};

/* ======================================================================== */
const StyleBlock = () => (
  <style>{`
    .plan-root {
      --green:${GREEN}; --dark:${DARK_GREEN}; --gold:${GOLD}; --cream:${CREAM};
      max-width:100%; overflow-x:hidden; /* filet de sécurité anti-débordement horizontal */
    }
    /* jamais de règle svg globale ici : elle écraserait les icônes lucide */
    .plan-root .lucide { width:1em; height:1em; flex:none; }
    .plan-root * { min-width:0; } /* les enfants flex/grid ne forcent plus leur largeur de contenu */

    .plan-panel {
      background: rgba(255,255,255,0.78);
      border: 1px solid rgba(31,107,45,0.10);
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 14px 34px rgba(31,60,30,0.07);
    }
    .plan-field + .plan-field { margin-top: 20px; }
    .plan-label {
      display:block; margin-bottom:10px;
      font-size:11px; font-weight:700; letter-spacing:.18em; text-transform:uppercase;
      color:#9b9384;
    }
    .plan-dot {
      display:inline-block; width:7px; height:7px; border-radius:50%;
      background:#3fe27e; margin-right:7px; vertical-align:1px;
      box-shadow:0 0 8px rgba(63,226,126,.7);
    }

    .plan-days { display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; }
    .plan-days::-webkit-scrollbar { height:4px; }
    .plan-days::-webkit-scrollbar-thumb { background:rgba(31,107,45,.2); border-radius:4px; }
    .plan-day {
      flex:0 0 auto; width:54px; padding:8px 0; text-align:center; cursor:pointer;
      border-radius:16px; border:1px solid rgba(31,107,45,0.12);
      background:rgba(255,255,255,.7); color:var(--dark); line-height:1.3;
      transition:.2s;
    }
    .plan-day:hover { transform:translateY(-2px); border-color:var(--green); }
    .plan-day b { display:block; font-size:17px; font-weight:800; }
    .plan-day span { font-size:9px; letter-spacing:.08em; text-transform:uppercase; color:#a8a294; }
    .plan-day[data-on="1"] {
      background:linear-gradient(135deg, ${GREEN}, ${DARK_GREEN}); border-color:transparent; color:#fff;
      box-shadow:0 10px 22px rgba(31,107,45,.24);
    }
    .plan-day[data-on="1"] span { color:rgba(255,255,255,.7); }

    .plan-seg {
      display:flex; gap:4px; padding:4px; border-radius:999px;
      background:rgba(31,107,45,.06); border:1px solid rgba(31,107,45,0.10);
    }
    .plan-seg button {
      flex:1; padding:9px; border:0; border-radius:999px; cursor:pointer;
      background:transparent; font-size:13px; font-weight:700; color:var(--dark); transition:.2s;
    }
    .plan-seg button[data-on="1"] { background:#fff; box-shadow:0 4px 12px rgba(31,60,30,.10); }

    .plan-chips { display:flex; flex-wrap:wrap; gap:6px; }
    .plan-chips-scroll { padding:2px 4px 2px 2px; }
    .plan-chip {
      padding:7px 12px; border-radius:999px; cursor:pointer; font-size:12.5px; font-weight:600;
      border:1px solid rgba(31,107,45,0.12); background:rgba(255,255,255,.7); color:var(--dark);
      transition:.18s;
    }
    .plan-chip:hover { border-color:var(--gold); transform:translateY(-1px); }
    .plan-chip[data-on="1"] {
      background:var(--gold); border-color:var(--gold); color:#fff;
      box-shadow:0 8px 18px rgba(197,154,40,.28);
    }

    .plan-step {
      width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:18px; line-height:1;
      border:1px solid rgba(31,107,45,0.14); background:rgba(255,255,255,.8); color:var(--dark);
      transition:.18s;
    }
    .plan-step:hover:not(:disabled) { background:#fff; transform:translateY(-1px); }
    .plan-step:disabled { opacity:.35; cursor:not-allowed; }

    /* ---- carte de sélection ---- */
    .plan-choix { display:flex; flex-direction:column; }
    .plan-choix-vide { margin:0 0 16px; font-size:14px; color:#a8a294; }
    .plan-choix-tables { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:16px; }
    .plan-jeton {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:44px; height:44px; padding:0 12px; border-radius:14px;
      font-family:"Playfair Display", serif; font-size:20px; color:#fff;
      background:linear-gradient(135deg, ${GOLD}, #a87f1f);
      box-shadow:0 8px 18px rgba(197,154,40,.26);
    }
    .plan-choix-txt { font-size:13.5px; color:#8b8477; }
    .plan-cta-large { width:100%; flex-wrap:wrap; }
    @media (max-width:380px) { .plan-cta-large { font-size:13px; padding:12px 16px; } }
    .plan-contact { margin-top:22px; padding-top:20px; border-top:1px solid rgba(31,107,45,0.10); }

    /* ---- modale ---- */
    .plan-modal-fond {
      position:fixed; inset:0; z-index:120; display:flex; align-items:center; justify-content:center;
      padding:16px; background:rgba(22,79,34,.42); backdrop-filter:blur(4px);
      animation:planFond .2s ease-out;
    }
    @keyframes planFond { from { opacity:0 } to { opacity:1 } }
    .plan-modal {
      display:flex; flex-direction:column; width:100%; max-width:980px; max-height:94vh;
      border-radius:28px; overflow:hidden; background:#fdfbf6;
      box-shadow:0 40px 90px rgba(12,40,18,.34);
      animation:planModal .26s cubic-bezier(.16,1,.3,1);
    }
    @keyframes planModal { from { opacity:0; transform:translateY(18px) scale(.98) } to { opacity:1; transform:none } }
    .plan-modal-tete {
      display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
      padding:20px 24px; border-bottom:1px solid rgba(31,107,45,0.10); background:#fff;
    }
    .plan-fermer {
      flex:none; width:40px; height:40px; border-radius:50%; cursor:pointer;
      display:grid; place-items:center; color:${DARK_GREEN};
      background:rgba(31,107,45,.07); border:1px solid rgba(31,107,45,.12);
    }
    .plan-fermer:hover { background:rgba(31,107,45,.13); }
    .plan-modal-corps {
      flex:1; min-height:0; overflow:auto; padding:20px 24px;
      background:linear-gradient(160deg, #fdfbf6, #f7f0e4);
    }
    .plan-modal-pied {
      display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;
      padding:16px 24px; border-top:1px solid rgba(31,107,45,0.10); background:#fff;
    }
    .plan-modal-pied p { margin:0; font-size:13px; color:#8b8477; line-height:1.5; }

    .plan-scene { display:flex; flex-direction:column; align-items:center; gap:20px; }
    .plan-svg-salle { width:100%; max-width:360px; height:auto; display:block; }
    .plan-svg-terrasse { width:100%; max-width:420px; height:auto; display:block; }
    .plan-scene-cote { display:flex; flex-direction:column; gap:12px; width:100%; max-width:420px; }
    @media (min-width:820px) {
      .plan-scene { flex-direction:row; align-items:flex-start; justify-content:center; }
      .plan-svg-salle { width:auto; height:min(62vh, 560px); max-width:none; }
      .plan-scene-cote { max-width:360px; }
    }
    .plan-aide { margin:0; font-size:13px; line-height:1.6; color:#8b8477; }

    .plan-legend {
      display:flex; flex-wrap:wrap; gap:14px; padding-top:12px;
      border-top:1px solid rgba(31,107,45,0.08);
      font-size:11px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:#8b8477;
    }
    .plan-legend i {
      display:inline-block; width:16px; height:12px; margin-right:6px; vertical-align:-1px;
      border:1px solid #22201b; border-radius:3px;
    }

    .plan-table { cursor:pointer; }
    .plan-table[data-etat="occupee"] { cursor:not-allowed; }
    .plan-table-hitbox { pointer-events:all; }
    .plan-plateau { transition:filter .18s ease; }
    .plan-table[data-etat="libre"]:hover .plan-plateau {
      filter:drop-shadow(0 5px 6px rgba(197,154,40,.24));
    }
    .plan-table[data-etat="choisie"]:hover .plan-plateau,
    .plan-table[data-etat="occupee"]:hover .plan-plateau { transform:none; }
    .plan-table:focus { outline:none; }
    .plan-table:focus-visible .plan-plateau rect:first-of-type { stroke:${GOLD}; stroke-width:3; }
    @keyframes planSceau { from { opacity:0; transform:scale(.85);} to { opacity:1; transform:scale(1);} }
    .plan-sceau { animation:planSceau .22s ease-out; transform-origin:center; transform-box:fill-box; }

    .plan-bar {
      display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between;
      margin-top:16px; padding:16px 20px; border-radius:24px;
      background:linear-gradient(145deg, rgba(255,255,255,.94), rgba(248,242,229,.96));
      border:1px solid rgba(197,154,40,0.28);
      box-shadow:0 16px 38px rgba(31,60,30,0.08);
    }
    .plan-bar p { margin:0; font-size:13.5px; line-height:1.5; color:#6f6a5e; }
    .plan-bar-tables { font-family:"Playfair Display", serif; font-size:21px; color:${DARK_GREEN}; }

    .plan-cta {
      border:0; border-radius:999px; padding:13px 22px; cursor:pointer;
      font-size:14px; font-weight:800; color:#fff; text-align:center;
      background:linear-gradient(135deg, ${GREEN}, ${DARK_GREEN});
      box-shadow:0 14px 28px rgba(31,107,45,0.22); transition:.2s;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      flex-wrap:wrap; white-space:normal; line-height:1.3;
    }
    .plan-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 18px 34px rgba(31,107,45,0.30); }
    .plan-cta:disabled { background:#cfcbc0; box-shadow:none; cursor:not-allowed; }
    .plan-ghost {
      border-radius:999px; padding:12px 22px; cursor:pointer; font-size:13.5px; font-weight:700;
      color:${DARK_GREEN}; background:rgba(31,107,45,0.07); border:1px solid rgba(31,107,45,0.14);
    }

    .plan-input {
      width:100%; padding:13px 16px; border-radius:16px; font-size:14px; color:${DARK_GREEN};
      background:rgba(255,255,255,.85); border:1px solid rgba(31,107,45,0.12);
    }
    .plan-input::placeholder { color:#b4ada0; }
    .plan-input:focus { outline:2px solid rgba(197,154,40,.55); outline-offset:-1px; }

    .plan-alert {
      margin-top:14px; padding:14px 18px; border-radius:18px; font-size:13.5px; line-height:1.6;
      color:#7b4d08; background:rgba(197,154,40,0.10); border:1px solid rgba(197,154,40,0.22);
    }
    .plan-alert-action {
      display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px;
    }
    .plan-ghost-petit {
      padding:8px 14px; font-size:12.5px; color:#7b4d08;
      background:rgba(197,154,40,0.16); border-color:rgba(197,154,40,0.3);
    }
    .plan-ghost-petit:hover { background:rgba(197,154,40,0.24); }

    .plan-dt { font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#a8a294; align-self:center; }
    .plan-dd { margin:0; font-size:15px; font-weight:700; color:${DARK_GREEN}; }


    .plan-modal { position:relative; isolation:isolate; }
    .plan-modal::before {
      content:""; position:absolute; inset:0; pointer-events:none; z-index:-1;
      background:
        radial-gradient(circle at 82% 18%, rgba(197,154,40,.12), transparent 28%),
        radial-gradient(circle at 14% 78%, rgba(31,107,45,.10), transparent 32%);
    }
    .plan-modal-ambient { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:3; }
    .plan-particle {
      position:absolute; width:5px; height:5px; border-radius:50%;
      background:rgba(197,154,40,.55); box-shadow:0 0 12px rgba(197,154,40,.45);
      animation:planParticle 8s ease-in-out infinite;
    }
    .plan-particle-1 { left:9%; top:32%; animation-delay:-1s; }
    .plan-particle-2 { left:58%; top:18%; width:3px; height:3px; animation-delay:-3s; }
    .plan-particle-3 { right:12%; top:58%; animation-delay:-5s; }
    .plan-particle-4 { left:42%; bottom:10%; width:4px; height:4px; animation-delay:-7s; }
    @keyframes planParticle {
      0%,100% { opacity:.1; transform:translate3d(0,8px,0) scale(.8); }
      50% { opacity:.75; transform:translate3d(8px,-16px,0) scale(1.15); }
    }
    .plan-modal-title-row { display:flex; align-items:center; gap:10px; }
    .plan-modal-title-icon {
      display:grid; place-items:center; width:34px; height:34px; border-radius:12px;
      color:#fff8d8; background:linear-gradient(135deg, ${GOLD}, #a87f1f);
      box-shadow:0 8px 20px rgba(197,154,40,.24);
      animation:planTitleSpark 3.2s ease-in-out infinite;
    }
    @keyframes planTitleSpark { 0%,100%{transform:rotate(-4deg) scale(1)} 50%{transform:rotate(4deg) scale(1.08)} }
    .plan-stage-shell,
    .plan-terrasse-shell {
      position:relative; border-radius:24px; padding:12px;
      background:
        linear-gradient(rgba(255,255,255,.7), rgba(255,255,255,.7)),
        repeating-linear-gradient(0deg, transparent 0 23px, rgba(31,107,45,.035) 24px),
        repeating-linear-gradient(90deg, transparent 0 23px, rgba(31,107,45,.035) 24px);
      border:1px solid rgba(31,107,45,.10);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 18px 40px rgba(31,60,30,.08);
    }
    .plan-stage-shell::after {
      content:""; position:absolute; inset:0; border-radius:24px; pointer-events:none;
      background:linear-gradient(115deg, transparent 35%, rgba(255,255,255,.34) 48%, transparent 61%);
      transform:translateX(-140%); animation:planSceneShine 8s ease-in-out infinite;
    }
    @keyframes planSceneShine { 0%,60%{transform:translateX(-140%)} 85%,100%{transform:translateX(140%)} }
    .plan-stage-label {
      position:absolute; left:18px; bottom:18px; z-index:2; display:inline-flex; align-items:center; gap:6px;
      padding:7px 10px; border-radius:999px; color:#fff8d8; background:rgba(22,79,34,.88);
      font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
      box-shadow:0 8px 18px rgba(22,79,34,.22); backdrop-filter:blur(8px);
    }
    .plan-selection-preview {
      border:1px solid rgba(197,154,40,.20); border-radius:20px; padding:16px;
      background:linear-gradient(145deg, rgba(255,255,255,.92), rgba(247,240,228,.92));
      box-shadow:0 14px 30px rgba(31,60,30,.07);
    }
    .plan-selection-kicker {
      display:block; font-size:10px; font-weight:800; letter-spacing:.2em; text-transform:uppercase; color:${GOLD};
    }
    .plan-selection-main { display:flex; align-items:center; gap:14px; margin-top:8px; }
    .plan-selection-number {
      display:grid; place-items:center; min-width:54px; height:54px; padding:0 12px; border-radius:17px;
      color:#fff; background:linear-gradient(135deg, ${GOLD}, #a87f1f);
      font-family:"Playfair Display",serif; font-size:22px;
      box-shadow:0 10px 24px rgba(197,154,40,.28);
      animation:planSelectionBreath 2.6s ease-in-out infinite;
    }
    .plan-selection-copy { font-size:13px; line-height:1.5; color:#756f63; }
    @keyframes planSelectionBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

    .plan-table {
      opacity:0; transform-origin:center; transform-box:fill-box;
      animation:planTableEnter .48s cubic-bezier(.16,1,.3,1) var(--table-delay,0ms) forwards;
    }
    @keyframes planTableEnter {
      from { opacity:0; transform:translateY(8px) scale(.84); }
      to { opacity:1; transform:translateY(0) scale(1); }
    }
    .plan-table .plan-plateau,
    .plan-table line {
      transition:filter .22s ease, opacity .22s ease;
    }

    /* La géométrie de la table reste fixe. Le hover utilise uniquement
       lumière/ombre : aucun déplacement sous le curseur, donc aucun jitter. */
    .plan-table[data-etat="libre"]:hover .plan-plateau {
      filter:brightness(1.045) drop-shadow(0 7px 7px rgba(197,154,40,.30));
    }

    .plan-table[data-etat="choisie"] .plan-plateau {
      filter:drop-shadow(0 0 7px rgba(197,154,40,.52));
    }

    /* Le petit pop se joue sur le sceau seulement, pas sur la table entière. */
    .plan-table[data-etat="choisie"] .plan-sceau {
      animation:
        planSelectedRingIn .32s cubic-bezier(.16,1,.3,1) both,
        planSceauOrbit 5s linear .32s infinite;
    }

    @keyframes planSelectedRingIn {
      0% { opacity:0; transform:scale(.82); }
      70% { opacity:1; transform:scale(1.06); }
      100% { opacity:1; transform:scale(1); }
    }
    .plan-table[data-etat="occupee"] { opacity:.52; filter:grayscale(.12); }
    .plan-sceau {
      stroke-dasharray:8 5;
      transform-origin:center;
      transform-box:fill-box;
    }
    @keyframes planSceauOrbit { to { stroke-dashoffset:-65; } }
    .plan-legend {
      border:1px solid rgba(31,107,45,.09); border-radius:16px; padding:12px 14px;
      background:rgba(255,255,255,.62); box-shadow:0 10px 24px rgba(31,60,30,.05);
    }
    .plan-legend i { box-shadow:0 3px 9px rgba(31,60,30,.12); }
    .plan-cta { position:relative; overflow:hidden; }
    .plan-cta::after {
      content:""; position:absolute; top:-40%; bottom:-40%; left:-35%; width:24%;
      transform:skewX(-20deg); background:linear-gradient(90deg, transparent, rgba(255,255,255,.30), transparent);
      animation:planButtonShine 4.8s ease-in-out infinite;
    }
    @keyframes planButtonShine { 0%,58%{left:-35%} 82%,100%{left:125%} }

    @media (prefers-reduced-motion: reduce) {
      .plan-plateau, .plan-day, .plan-chip, .plan-cta, .plan-step { transition:none !important; }
      .plan-table:hover .plan-plateau, .plan-day:hover, .plan-chip:hover, .plan-cta:hover { transform:none !important; }
      .plan-sceau,
      .plan-modal-ambient,
      .plan-modal-title-icon,
      .plan-stage-shell::after,
      .plan-selection-number,
      .plan-table,
      .plan-table[data-etat="choisie"] .plan-plateau,
      .plan-cta::after { animation:none !important; }
      .plan-table { opacity:1 !important; transform:none !important; }
    }
  `}</style>
);
