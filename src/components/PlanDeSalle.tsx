import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import {
  getDisponibilites,
  reserver as reserverAPI,
  TableDejaPrise,
  ChampsInvalides,
} from "../services/reservations";
import { useTranslation } from "react-i18next";
import {
  Users,
  Clock3,
  CalendarDays,
  Check,
  Loader2,
  X,
  LayoutGrid,
  Sparkles,
  MapPin,
  Info,
  CalendarCheck2,
  UserRound,
  Armchair,
  TicketCheck,
  RotateCcw,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  retrouverReservation,
  modifierReservation,
  annulerReservation,
  ReservationIntrouvable,
} from "../services/reservations";
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
const USE_API = true; // l'API réelle est branchée — ne plus repasser à false
const SIMULATION = false; // true = fausses tables occupées pour la démo, sans backend
// (l'URL du backend est lue directement dans services/reservations.ts)

// Service continu, 7j/7 : 11h30 – 00h00 du lundi au mercredi,
// 11h30 – 02h00 du jeudi au dimanche. Aucune coupure l'après-midi.
const FERMETURE: Record<number, string> = {
  0: "02:00",
  1: "00:00",
  2: "00:00",
  3: "00:00",
  4: "02:00",
  5: "02:00",
  6: "02:00",
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
  [19, 18],
];
const partenaireDe = (id: TableId): TableId | undefined => {
  for (const [a, b] of PAIRES_FORCEES) {
    if (id === a) return b;
    if (id === b) return a;
  }
  return undefined;
};
/** Certaines tables ne se réservent qu'à partir d'un nombre minimum de
 *  convives (pour ne pas gâcher une table de groupe sur un couple) et
 *  jusqu'à un maximum (au-delà, il faut la compléter avec une voisine). */
interface ContrainteConvives {
  min: number;
  max: number;
}
const CONTRAINTES_UNITES: { ids: TableId[]; range: ContrainteConvives }[] = [
  { ids: [19, 18], range: { min: 3, max: 5 } }, // coin insta
  { ids: [13, 12], range: { min: 3, max: 4 } },
  { ids: [11, 10], range: { min: 3, max: 4 } },
  { ids: [8, 9], range: { min: 3, max: 4 } },
  { ids: [20], range: { min: 3, max: 4 } },
  { ids: [21], range: { min: 3, max: 4 } },
];
const contrainteDe = (id: TableId): ContrainteConvives | undefined =>
  CONTRAINTES_UNITES.find((c) => c.ids.includes(id))?.range;
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
    if (
      (id === INSTA_A || id === INSTA_B) &&
      set.has(INSTA_A) &&
      set.has(INSTA_B)
    ) {
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
interface Unite {
  ids: TableId[];
  places: number;
}
const U = (ids: TableId[], places?: number): Unite => ({
  ids,
  places: places ?? ids.reduce<number>((n, id) => n + placesDe(id), 0),
});

const U21 = U([21]);
const U20 = U([20]);
const U_INSTA = U([19, 18], INSTA_PLACES_COMBINE);
const U17 = U([17]);
const U16 = U([16]);
const U15 = U([15]);
const U14 = U([14]);
const U_13_12 = U([13, 12]); // paire forcée
const U_11_10 = U([11, 10]); // paire forcée
const U_8_9 = U([8, 9]); // paire forcée
const U7 = U([7]);
const U6 = U([6]);
const U5 = U([5]);
const U4 = U([4]);
const U3 = U([3]);
const U2 = U([2]);
const U1 = U([1]);
const UT1 = U(["T1"]);
const UT2 = U(["T2"]);
const UT3 = U(["T3"]);
const UT4 = U(["T4"]);
const UT5 = U(["T5"]);
const UT6 = U(["T6"]);

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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function occupeesSimulees(iso: string, creneau: string): Set<TableId> {
  const jour = new Date(`${iso}T12:00:00`).getDay();
  const weekend = jour === 5 || jour === 6 || jour === 0;
  const soir = enMinutes(creneau) >= enMinutes("19:00");
  const taux = 16 + (weekend ? 20 : 0) + (soir ? 16 : 0);
  const occ = new Set<TableId>();
  IDS.forEach((id) => {
    if (hash(iso + creneau + id) % 100 < taux) occ.add(id);
  });
  return occ;
}

/* --- Recherche d'un bloc de tables voisines libres ---------------------- */
function chercherBloc(
  nb: number,
  occupees: Set<TableId>,
  depart: TableId | null = null,
): TableId[] | null {
  const uniteLibre = (u: Unite) => {
    if (!u.ids.every((id) => !occupees.has(id))) return false;
    const contrainte = u.ids.map(contrainteDe).find(Boolean);
    if (contrainte && (nb < contrainte.min || nb > contrainte.max))
      return false;
    return true;
  };
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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  const [contact, setContact] = useState({
    nom: "",
    tel: "",
    email: "",
    note: "",
  });
  const [planOuvert, setPlanOuvert] = useState(false);
  const [personnalise, setPersonnalise] = useState(false); // false = suggestion auto encore active
  const [selectionAvant, setSelectionAvant] = useState<TableId[]>([]);
  const [searchParams] = useSearchParams();
  const refModif = searchParams.get("ref");
  const emailModif = searchParams.get("email");
  const [modeEdition, setModeEdition] = useState(false);
  const [referenceEdition, setReferenceEdition] = useState<number | null>(null);
  const [mesTables, setMesTables] = useState<TableId[]>([]);
  const [annulationOuverte, setAnnulationOuverte] = useState(false);
  const [annulationEnCours, setAnnulationEnCours] = useState(false);
  const [annulationFaite, setAnnulationFaite] = useState(false);
  const [annulationErreur, setAnnulationErreur] = useState<string | null>(null);
  const placesSelection = placesTotal(selection);
  const listeCreneaux = useMemo(() => creneauxDuJour(date), [date]);
  const derniereArrivee = listeCreneaux[listeCreneaux.length - 1];

  const dateLongue = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const formatHeure = (heure: string) => {
    const [h, m] = heure.split(":").map(Number);
    const d = new Date(2000, 0, 1, h, m);
    return new Intl.DateTimeFormat(
      locale.startsWith("en") ? "en-US" : "fr-FR",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: locale.startsWith("en"),
      },
    ).format(d);
  };

  /* --- disponibilités --- */
  const charger = useCallback(
    async (signal?: AbortSignal) => {
      if (!USE_API) {
        setOccupees(
          SIMULATION ? occupeesSimulees(date, creneau) : new Set<TableId>(),
        );
        return;
      }
      setChargement(true);
      try {
        const d = await getDisponibilites(date, creneau, signal);
        const occ = new Set<TableId>(d.occupied_table_ids.map(idDepuisAPI));
        mesTables.forEach((id) => occ.delete(id)); // ⟵ AJOUT
        setOccupees(occ);
        setMessage((m) => (m === "reseau" ? null : m));
      } catch (e: any) {
        if (e?.name !== "AbortError") setMessage("reseau");
      } finally {
        setChargement(false);
      }
    },
    [date, creneau, mesTables], // ⟵ ajoute mesTables aux dépendances
  );

  useEffect(() => {
    const ac = new AbortController();
    charger(ac.signal);
    const timer = USE_API
      ? window.setInterval(() => charger(), 20000)
      : undefined;
    return () => {
      ac.abort();
      if (timer) clearInterval(timer);
    };
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
    if (convives > MAX_CONVIVES) {
      setSelection([]);
      return;
    }
    const bloc = chercherBloc(convives, occupees);
    setSelection(bloc ?? []);
    setMessage(bloc ? null : "complet");
  }, [occupees, convives, personnalise]); // eslint-disable-line react-hooks/exhaustive-deps

  const etat = (id: TableId): Etat =>
    occupees.has(id) ? "occupee" : selection.includes(id) ? "choisie" : "libre";
  function choisirTable(id: TableId) {
    if (occupees.has(id) || etape === "confirme" || convives > MAX_CONVIVES)
      return;

    const partenaire = partenaireDe(id);
    if (partenaire !== undefined && occupees.has(partenaire)) {
      setMessage("paireIndisponible");
      setToast(
        t(
          "plan.msgPaire",
          "Cette table est indissociable de sa voisine, déjà réservée. Choisissez-en une autre.",
        ),
      );
      return;
    }

    const cible = partenaire !== undefined ? [id, partenaire] : [id];
    const dejaTout = cible.every((t) => selection.includes(t));

    // On peut toujours désélectionner, même une table contrainte.
    if (!dejaTout && placesTotal(selection) >= convives) {
      setMessage("dejaSuffisant");
      setToast(
        t(
          "plan.msgSuffisantPopup",
          "Table déjà complète pour {{n}} convives. Désélectionnez une table avant d'en choisir une autre.",
          { n: convives },
        ),
      );
      return;
    }

    // La contrainte se base sur ce qu'il reste à placer avant d'ajouter
    // cette table — pas sur le total de la réservation — pour éviter
    // qu'une table de groupe (insta, 8-13, 20, 21) ne serve juste à
    // compléter 1 ou 2 places restantes.
    if (!dejaTout) {
      const contrainte = contrainteDe(id);
      if (contrainte) {
        const manque = convives - placesTotal(selection);
        if (manque < contrainte.min || manque > contrainte.max) {
          setMessage("contrainteConvives");
          setToast(
            t(
              "plan.msgContrainteInfo",
              "Certaines tables (coin insta, tables 8-13, 20, 21) ne se réservent qu'à partir de 3 convives.",
            ),
          );
          return;
        }
      }
    }

    setPersonnalise(true);
    setMessage(null);
    setSelection((prev) =>
      dejaTout
        ? prev.filter((x) => !cible.includes(x))
        : [...prev.filter((x) => !cible.includes(x)), ...cible],
    );
  }
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") annulerPlan();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = avant;
      window.removeEventListener("keydown", onKey);
    };
  }, [planOuvert]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!refModif || !emailModif) return;
    (async () => {
      try {
        const r = await retrouverReservation(Number(refModif), emailModif);
        setDate(r.date);
        setCreneau(r.time);
        setConvives(r.guests);
        setSelection(r.table_ids.map(idDepuisAPI));
        const tablesActuelles = r.table_ids.map(idDepuisAPI);
        setSelection(tablesActuelles);
        setMesTables(tablesActuelles); // ⟵ AJOUT
        setPersonnalise(true);
        setContact((c) => ({
          ...c,
          nom: `${r.first_name} ${r.last_name}`.trim(),
          tel: r.phone,
          email: emailModif,
        }));
        setModeEdition(true);
        setReferenceEdition(r.id);
        setEtape("plan"); // ⟵ AJOUT — sinon l'écran "confirme" reste affiché
      } catch (e) {
        if (e instanceof ReservationIntrouvable) {
          setMessage("introuvable");
        }
      }
    })();
  }, [refModif, emailModif]); // eslint-disable-line react-hooks/exhaustive-deps
  const couvertsLibres = IDS.filter((id) => !occupees.has(id)).reduce<number>(
    (n, id) => n + placesDe(id),
    0,
  );

  /** Complète la sélection pour atteindre le nombre de convives, en
   *  respectant les paires forcées et sans toucher aux tables déjà retenues. */
  function completerSelection() {
    const manque = convives - placesTotal(selection);
    if (manque <= 0) return;

    let meilleureCible: TableId[] | null = null;
    let meilleurEcart = Infinity;

    for (const id of IDS) {
      if (occupees.has(id) || selection.includes(id)) continue;
      const contrainte = contrainteDe(id);
      if (contrainte && (manque < contrainte.min || manque > contrainte.max))
        continue; // ⟵ manque au lieu de convives
      const partenaire = partenaireDe(id);
      if (
        partenaire !== undefined &&
        (occupees.has(partenaire) || selection.includes(partenaire))
      )
        continue;
      const cible = partenaire !== undefined ? [id, partenaire] : [id];
      const capacite = placesTotal(cible);
      const ecart = Math.abs(capacite - manque);
      if (ecart < meilleurEcart) {
        meilleurEcart = ecart;
        meilleureCible = cible;
      }
    }

    if (meilleureCible) {
      setSelection((prev) => [...prev, ...(meilleureCible as TableId[])]);
      setMessage(null);
    }
  }

  async function confirmer() {
    if (!contact.nom.trim() || !contact.tel.trim()) {
      setMessage("champs");
      return;
    }
    if (!contact.email.trim()) {
      setMessage("emailRequis");
      return;
    }

    if (!USE_API) {
      setOccupees((prev) => new Set([...prev, ...selection]));
      setReference("DEMO");
      setEtape("confirme");
      return;
    }

    setEnvoi(true);
    try {
      if (modeEdition && referenceEdition) {
        const [prenom, ...resteNom] = contact.nom.trim().split(" ");
        const rep = await modifierReservation({
          reference: referenceEdition,
          email: contact.email,
          date,
          time: creneau,
          guests: convives,
          table_ids: selection.map(String),
          first_name: prenom,
          last_name: resteNom.join(" "),
          phone: contact.tel,
        });
        setReference(String(rep.id));
      } else {
        const rep = await reserverAPI({
          date,
          creneau,
          tables: selection,
          convives,
          contact,
          lang: locale,
        });
        setReference(String(rep.id));
      }
      setEtape("confirme");
      setMessage(null);
    } catch (e) {
      if (e instanceof TableDejaPrise) {
        setOccupees(
          (prev) =>
            new Set([...prev, ...e.tables.map((t) => idDepuisAPI(String(t)))]),
        );
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
    setAnnulationOuverte(false);
    setAnnulationFaite(false);
    setAnnulationErreur(null);
  }

  async function confirmerAnnulation() {
    if (!reference || reference === "DEMO" || !contact.email.trim()) return;

    setAnnulationEnCours(true);
    setAnnulationErreur(null);

    try {
      // Le service utilise la même identification client que la modification :
      // référence de réservation + email.
      await annulerReservation(Number(reference), contact.email.trim());

      setAnnulationFaite(true);
      setAnnulationOuverte(false);
      setOccupees((prev) => {
        const next = new Set(prev);
        selection.forEach((id) => next.delete(id));
        return next;
      });
    } catch (error) {
      console.error("[reservation cancellation]", error);
      setAnnulationErreur(
        t(
          "plan.cancelError",
          "Impossible d'annuler la réservation pour le moment. Veuillez réessayer.",
        ),
      );
    } finally {
      setAnnulationEnCours(false);
    }
  }

  /* ---------------------------------------------------------------- */
  if (etape === "confirme") {
    const infos = [
      {
        icon: <CalendarCheck2 size={19} />,
        label: t("plan.date", "Date"),
        value: dateLongue(date),
      },
      {
        icon: <Clock3 size={19} />,
        label: t("plan.heure", "Heure"),
        value: formatHeure(creneau),
      },
      {
        icon: <UserRound size={19} />,
        label: t("plan.convives", "Convives"),
        value: String(convives),
      },
      {
        icon: <Armchair size={19} />,
        label:
          selection.length > 1
            ? t("plan.tables", "Tables")
            : t("plan.table", "Table"),
        value: selection.join(" + "),
      },
    ];

    if (annulationFaite) {
      return (
        <div
          className="plan-root success-stage"
          role="status"
          aria-live="polite"
        >
          <div className="success-card cancelled-card">
            <div className="success-line cancelled-line" />

            <div className="cancelled-icon-wrap">
              <div className="cancelled-icon">
                <Check size={28} />
              </div>
            </div>

            <p className="success-kicker cancelled-kicker">
              {t("plan.cancelledKicker", "Réservation libérée")}
            </p>

            <h3 className="success-title font-playfair">
              {t("plan.cancelledTitle", "Votre réservation est annulée")}
            </h3>

            <p className="success-copy">
              {t(
                "plan.cancelledText",
                "La table est de nouveau disponible. Nous espérons vous accueillir une prochaine fois chez Miss Chawarma.",
              )}
            </p>

            {reference && reference !== "DEMO" && (
              <div className="success-ticket cancelled-ticket">
                <TicketCheck size={18} />
                <small>{t("plan.reference", "Référence")}</small>
                <strong>#{reference}</strong>
              </div>
            )}

            <div className="cancelled-actions">
              <button
                type="button"
                onClick={recommencer}
                className="success-primary"
              >
                <CalendarDays size={16} />
                {t("plan.bookAgain", "Faire une nouvelle réservation")}
              </button>

              <Link to="/" className="success-secondary">
                {t("plan.backHome", "Retour à l'accueil")}
              </Link>
            </div>
          </div>

          <StyleBlock />
        </div>
      );
    }

    return (
      <div className="plan-root success-stage" role="status" aria-live="polite">
        <div className="success-card">
          <div className="success-line" />
          <Sparkles className="success-spark success-spark-one" size={18} />
          <Sparkles className="success-spark success-spark-two" size={15} />

          <div className="success-check-wrap">
            <span />
            <span />
            <div className="success-check">
              <Check size={30} />
            </div>
          </div>

          <p className="success-kicker">
            <Sparkles size={12} />
            {t("plan.confirmationKicker", "C'est réservé")}
            <Sparkles size={12} />
          </p>

          <h3 className="success-title font-playfair">
            {t("plan.merci", "Table réservée")}
          </h3>

          <p className="success-copy">
            {modeEdition
              ? t(
                  "plan.merciTexteModif",
                  "Votre réservation a bien été modifiée. Un e-mail récapitulatif vient d'être envoyé à {{email}}.",
                  { email: contact.email },
                )
              : t(
                  "plan.merciTexteAuto",
                  "Votre table est confirmée. Un e-mail de confirmation vient d'être envoyé à {{email}}.",
                  { email: contact.email },
                )}
          </p>

          <div className="success-grid">
            {infos.map((info, index) => (
              <div
                className="success-info"
                key={info.label}
                style={{ animationDelay: `${0.62 + index * 0.08}s` }}
              >
                <span className="success-info-icon">{info.icon}</span>
                <div>
                  <small>{info.label}</small>
                  <strong>{info.value}</strong>
                </div>
              </div>
            ))}
          </div>

          {reference && reference !== "DEMO" && (
            <div className="success-ticket">
              <TicketCheck size={18} />
              <small>{t("plan.reference", "Référence")}</small>
              <strong>#{reference}</strong>
            </div>
          )}

          <div className="success-reassurance">
            <ShieldCheck size={16} />
            <span>
              {t(
                "plan.keepReference",
                "Gardez votre référence : elle vous permet de modifier ou d'annuler votre réservation.",
              )}
            </span>
          </div>

          <div className="success-actions">
            {reference && reference !== "DEMO" && (
              <Link
                to={`/book-a-table?ref=${reference}&email=${encodeURIComponent(
                  contact.email,
                )}`}
                className="success-primary"
              >
                <Pencil size={16} />
                {t("plan.modifierReservation", "Modifier ma réservation")}
              </Link>
            )}

            <button
              type="button"
              onClick={recommencer}
              className="success-secondary"
            >
              <RotateCcw size={16} />
              {t("plan.autre", "Réserver une autre table")}
            </button>

            {reference && reference !== "DEMO" && (
              <button
                type="button"
                onClick={() => {
                  setAnnulationErreur(null);
                  setAnnulationOuverte(true);
                }}
                className="success-danger"
              >
                <Trash2 size={16} />
                {t("plan.cancelReservation", "Annuler la réservation")}
              </button>
            )}
          </div>

          <div className="success-location">
            <MapPin size={14} />
            <span>128 Rue Oberkampf · Paris 11e</span>
          </div>

          {annulationOuverte &&
            createPortal(
              <div
                className="cancel-confirm-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-reservation-title"
                onMouseDown={(event) => {
                  if (
                    event.currentTarget === event.target &&
                    !annulationEnCours
                  ) {
                    setAnnulationOuverte(false);
                  }
                }}
              >
                <div className="cancel-confirm-card">
                  <div className="cancel-warning-icon">
                    <AlertTriangle size={25} />
                  </div>

                  <p className="cancel-confirm-eyebrow">
                    {t("plan.cancelEyebrow", "Avant de continuer")}
                  </p>

                  <h4 id="cancel-reservation-title" className="font-playfair">
                    {t(
                      "plan.cancelConfirmTitle",
                      "Annuler cette réservation ?",
                    )}
                  </h4>

                  <p>
                    {t(
                      "plan.cancelConfirmText",
                      "La table {{table}} sera immédiatement libérée et pourra être réservée par un autre client.",
                      { table: selection.join(" + ") },
                    )}
                  </p>

                  <div className="cancel-summary">
                    <span>
                      <CalendarDays size={15} />
                      {dateLongue(date)}
                    </span>
                    <span>
                      <Clock3 size={15} />
                      {formatHeure(creneau)}
                    </span>
                    <span>
                      <UserRound size={15} />
                      {t("plan.guestCount", "{{count}} convive(s)", {
                        count: convives,
                      })}
                    </span>
                  </div>

                  {annulationErreur && (
                    <div className="cancel-error">{annulationErreur}</div>
                  )}

                  <div className="cancel-confirm-actions">
                    <button
                      type="button"
                      disabled={annulationEnCours}
                      onClick={() => setAnnulationOuverte(false)}
                      className="cancel-keep"
                    >
                      {t("plan.keepReservation", "Garder ma réservation")}
                    </button>

                    <button
                      type="button"
                      disabled={annulationEnCours}
                      onClick={confirmerAnnulation}
                      className="cancel-confirm-button"
                    >
                      {annulationEnCours ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {annulationEnCours
                        ? t("plan.cancelling", "Annulation...")
                        : t("plan.confirmCancellation", "Oui, annuler")}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>

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
              <CalendarDays
                size={14}
                className="mr-1.5 inline"
                style={{ color: GREEN }}
              />
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
                    <span>
                      {d
                        .toLocaleDateString(locale, { weekday: "short" })
                        .replace(".", "")}
                    </span>
                    <b>{d.getDate()}</b>
                    <span>
                      {d
                        .toLocaleDateString(locale, { month: "short" })
                        .replace(".", "")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="plan-field">
            <span className="plan-label">
              <Clock3
                size={14}
                className="mr-1.5 inline"
                style={{ color: GOLD }}
              />
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
                  {formatHeure(c)}
                </button>
              ))}
            </div>
            <p className="plan-aide" style={{ marginTop: 10 }}>
              {t(
                "plan.continu",
                "Service continu · dernière réservation à {{h}}",
                { h: formatHeure(derniereArrivee) },
              )}
            </p>
          </div>

          <div className="plan-field">
            <span className="plan-label">
              <Users
                size={14}
                className="mr-1.5 inline"
                style={{ color: GREEN }}
              />
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
              <output
                className="font-playfair text-3xl"
                style={{ color: DARK_GREEN }}
              >
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
                  ? t(
                      "plan.privatisationCourt",
                      "au-delà de 12, c'est une privatisation",
                    )
                  : selection.length
                    ? t(
                        "plan.selectionResume",
                        "{{t}} table(s) · {{p}} couverts",
                        {
                          t: selection.length,
                          p: placesSelection,
                        },
                      )
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
              {t("plan.libres", "Couverts libres à {{h}}", {
                h: formatHeure(creneau),
              })}
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
              {t(
                "plan.privatisation",
                "À partir de 13 personnes nous privatisons une partie de la salle. Passez par « Organiser un événement privé » — anniversaire, séminaire, repas d'affaires, baby shower ou soirée privée, jusqu'à 42 convives.",
              )}
            </div>
          ) : (
            <>
              <span className="plan-label">
                {t("plan.votreTable", "Votre table")}
              </span>

              {selection.length ? (
                <div className="plan-choix-tables">
                  {selection.map((id) => (
                    <span key={String(id)} className="plan-jeton">
                      {id}
                    </span>
                  ))}
                  <span className="plan-choix-txt">
                    {selection.length > 1
                      ? t(
                          "plan.rapprochees",
                          "rapprochées pour {{n}} convives",
                          { n: convives },
                        )
                      : t("plan.pour", "pour {{n}} convives", { n: convives })}
                  </span>
                </div>
              ) : (
                <p className="plan-choix-vide">
                  {t("plan.aucune", "Aucune table retenue pour l'instant.")}
                </p>
              )}

              <button
                type="button"
                className="plan-cta plan-cta-large"
                onClick={ouvrirPlan}
              >
                <LayoutGrid size={16} />
                {selection.length
                  ? t("plan.changerPlan", "Changer de table sur le plan")
                  : t("plan.ouvrirPlan", "Choisir ma table sur le plan")}
              </button>

              {message === "complet" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgComplet",
                    "Pas assez de places voisines à {{h}} pour {{n}} convives. Essayez un autre créneau ou la terrasse.",
                    { h: creneau, n: convives },
                  )}
                </div>
              )}
              {message === "pris" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgPris",
                    "Quelqu'un vient de prendre cette table. Nous avons rafraîchi le plan.",
                  )}
                </div>
              )}
              {message === "paireIndisponible" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgPaire",
                    "Cette table est indissociable de sa voisine, déjà réservée. Choisissez-en une autre.",
                  )}
                </div>
              )}
              {message === "champs" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgChamps",
                    "Il nous faut au moins un nom et un numéro.",
                  )}
                </div>
              )}
              {message === "emailRequis" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgEmail",
                    "Un e-mail valide est nécessaire pour confirmer la réservation.",
                  )}
                </div>
              )}
              {message === "reseau" && (
                <div className="plan-alert">
                  {t(
                    "plan.msgReseau",
                    "Connexion perdue avec le restaurant. Réessayez dans un instant ou appelez-nous.",
                  )}
                </div>
              )}

              {selection.length > 0 && (
                <div className="plan-contact">
                  <span className="plan-label">
                    {t("plan.coordonnees", "Vos coordonnées")}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="plan-input"
                      placeholder={t("plan.nom", "Nom et prénom")}
                      value={contact.nom}
                      onChange={(e) =>
                        setContact({ ...contact, nom: e.target.value })
                      }
                    />

                    <input
                      className="plan-input"
                      inputMode="tel"
                      placeholder={t("plan.tel", "Téléphone")}
                      value={contact.tel}
                      onChange={(e) =>
                        setContact({ ...contact, tel: e.target.value })
                      }
                    />
                  </div>
                  <input
                    className="plan-input mt-3"
                    inputMode="email"
                    placeholder={t("plan.email", "E-mail")}
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                  />
                  <input
                    className="plan-input mt-3"
                    placeholder={t(
                      "plan.note",
                      "Allergie, poussette, anniversaire…",
                    )}
                    value={contact.note}
                    onChange={(e) =>
                      setContact({ ...contact, note: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="plan-cta plan-cta-large mt-4"
                    onClick={confirmer}
                    disabled={envoi}
                  >
                    {envoi ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {modeEdition
                      ? t(
                          "plan.enregistrerModif",
                          "Enregistrer les modifications",
                        )
                      : t("plan.confirmer", "Confirmer la réservation")}{" "}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------------- Modale plan ---------------- */}
      {planOuvert &&
        createPortal(
          <div
            className="plan-modal-fond"
            role="dialog"
            aria-modal="true"
            aria-label={t("plan.a11ySalle", "Plan de la salle, 21 tables")}
            onClick={(e) => {
              if (e.target === e.currentTarget) annulerPlan();
            }}
          >
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
                    {dateLongue(date)} · {formatHeure(creneau)} · {convives}{" "}
                    {convives > 1
                      ? t("plan.convivesMin", "convives")
                      : t("plan.convive", "convive")}
                  </p>
                  <div className="plan-modal-title-row">
                    <span className="plan-modal-title-icon">
                      <Sparkles size={16} />
                    </span>
                    <h3
                      className="font-playfair"
                      style={{ fontSize: 28, color: DARK_GREEN, margin: 0 }}
                    >
                      {t("plan.titreModale", "Choisissez votre table")}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="plan-fermer"
                  onClick={annulerPlan}
                  aria-label={t("plan.fermer", "Fermer le plan")}
                >
                  <X size={18} />
                </button>
              </header>
              {toast && (
                <div className="plan-toast" role="status">
                  <Info size={16} />
                  <span>{toast}</span>
                </div>
              )}
              <div className="plan-modal-corps">
                <div className="plan-scene">
                  <div className="plan-stage-shell">
                    <div className="plan-stage-label">
                      <MapPin size={13} />
                      {t("plan.vousEtesIci", "Vous êtes ici")}
                    </div>
                    <PlanSalle
                      etat={etat}
                      onPick={choisirTable}
                      className="plan-svg-salle"
                    />
                  </div>
                  <div className="plan-scene-cote">
                    <div className="plan-terrasse-shell">
                      <PlanTerrasse
                        etat={etat}
                        onPick={choisirTable}
                        className="plan-svg-terrasse"
                      />
                    </div>
                    <div className="plan-selection-preview">
                      <span className="plan-selection-kicker">
                        {t("plan.votreTable", "Votre table")}
                      </span>
                      <div className="plan-selection-main">
                        <span className="plan-selection-number">
                          {selection.length ? selection.join(" + ") : "—"}
                        </span>
                        <span className="plan-selection-copy">
                          {selection.length
                            ? t(
                                "plan.selectionPremium",
                                "{{p}} places pour {{n}} convives",
                                { p: placesSelection, n: convives },
                              )
                            : t(
                                "plan.selectionPremiumVide",
                                "Touchez une table libre pour la sélectionner",
                              )}
                        </span>
                      </div>
                    </div>
                    <div className="plan-legend">
                      <span>
                        <i style={{ background: "#f2efe4" }} />
                        {t("plan.libre", "libre")}
                      </span>
                      <span>
                        <i style={{ background: GOLD }} />
                        {t("plan.votre", "votre table")}
                      </span>
                      <span>
                        <i style={{ background: "#d9d3c4" }} />
                        {t("plan.prise", "déjà réservée")}
                      </span>
                    </div>
                    <p className="plan-aide">
                      {t(
                        "plan.capacite",
                        "{{s}} couverts en salle · {{t}} en terrasse",
                        {
                          s: COUVERTS_SALLE,
                          t: COUVERTS_TERRASSE,
                        },
                      )}
                    </p>
                    <p className="plan-aide">
                      {t(
                        "plan.aideLibre",
                        "Touchez une table libre pour la retenir, où que ce soit dans la salle — sans dépasser {{n}} convives.",
                        { n: convives },
                      )}
                    </p>
                    {personnalise &&
                      placesSelection > 0 &&
                      placesSelection < convives && (
                        <div className="plan-alert plan-alert-action">
                          <span>
                            {t(
                              "plan.manquePlaces",
                              "{{p}} places retenues sur {{n}} nécessaires.",
                              { p: placesSelection, n: convives },
                            )}
                          </span>
                          <button
                            type="button"
                            className="plan-ghost plan-ghost-petit"
                            onClick={completerSelection}
                          >
                            {t("plan.completer", "Ajouter une table")}
                          </button>
                        </div>
                      )}
                    {message === "paireIndisponible" && (
                      <div className="plan-alert">
                        {t(
                          "plan.msgPaire",
                          "Cette table est indissociable de sa voisine, déjà réservée. Choisissez-en une autre.",
                        )}
                      </div>
                    )}
                    {message === "dejaSuffisant" && (
                      <div className="plan-alert">
                        {t(
                          "plan.msgSuffisant",
                          "Vous avez déjà assez de places pour {{n}} convives. Désélectionnez une table avant d'en choisir une autre.",
                          { n: convives },
                        )}
                      </div>
                    )}

                    {personnalise && placesSelection > convives && (
                      <p className="plan-aide" style={{ color: GOLD }}>
                        {t(
                          "plan.placesEnPlus",
                          "{{p}} places retenues pour {{n}} convives — un peu large, mais tout à vous.",
                          { p: placesSelection, n: convives },
                        )}
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
                        {selection.length > 1
                          ? t("plan.tables", "Tables")
                          : t("plan.table", "Table")}{" "}
                        {selection.join(" + ")}
                      </span>
                      <br />
                      {couvertsLibres}{" "}
                      {t(
                        "plan.couvertsLibresCourt",
                        "couverts libres à ce créneau",
                      )}
                    </>
                  ) : (
                    t("plan.choisir", "Choisissez une table sur le plan")
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="plan-ghost"
                    onClick={annulerPlan}
                  >
                    {t("plan.annuler", "Annuler")}
                  </button>
                  <button
                    type="button"
                    className="plan-cta"
                    disabled={!selection.length}
                    onClick={() => setPlanOuvert(false)}
                  >
                    {t("plan.valider", "Valider cette table")}
                  </button>
                </div>
              </footer>
            </div>
          </div>,
          document.body,
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
    <pattern
      id="mcTerrazzo"
      width="18"
      height="18"
      patternUnits="userSpaceOnUse"
    >
      <rect width="18" height="18" fill="#f2efe4" />
      <circle cx="4" cy="5" r="1.5" fill="#8a9a78" opacity=".5" />
      <circle cx="13" cy="3" r="1" fill={GOLD} opacity=".55" />
      <circle cx="9" cy="12" r="1.7" fill="#9a968a" opacity=".45" />
      <circle cx="16" cy="14" r="1" fill="#8a9a78" opacity=".4" />
      <circle cx="2" cy="15" r=".9" fill={GOLD} opacity=".4" />
    </pattern>
    <pattern
      id="mcTerrazzoOr"
      width="18"
      height="18"
      patternUnits="userSpaceOnUse"
    >
      <rect width="18" height="18" fill={GOLD} />
      <circle cx="4" cy="5" r="1.5" fill="#f0dfae" opacity=".65" />
      <circle cx="13" cy="3" r="1" fill="#8a6a16" opacity=".5" />
      <circle cx="9" cy="12" r="1.7" fill="#e4c374" opacity=".55" />
      <circle cx="16" cy="14" r="1" fill="#8a6a16" opacity=".45" />
    </pattern>
    <pattern
      id="mcPrise"
      width="6"
      height="6"
      patternTransform="rotate(45)"
      patternUnits="userSpaceOnUse"
    >
      <rect width="6" height="6" fill="#d9d3c4" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="#9c9483" strokeWidth="1.3" />
    </pattern>
    <pattern id="mcSol" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="#fbf7ee" />
      <path d="M0 0 H26 M0 0 V26" stroke="#e8e0cf" strokeWidth="1" />
    </pattern>
    <pattern id="mcPierre" width="24" height="14" patternUnits="userSpaceOnUse">
      <rect width="24" height="14" fill="#c4bba9" />
      <path
        d="M0 7 H24 M12 0 V7 M0 14 H24 M6 7 V14"
        stroke="#afa694"
        strokeWidth="1.1"
      />
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

const Table: React.FC<TableProps> = ({
  t,
  etat,
  onPick,
  label,
  w = 38,
  h = 28,
}) => {
  const fill =
    etat === "occupee"
      ? "url(#mcPrise)"
      : etat === "choisie"
        ? "url(#mcTerrazzoOr)"
        : "url(#mcTerrazzo)";
  const gauche = t.chaises === "g" || t.chaises === "2";
  const droite = t.chaises === "d" || t.chaises === "2";

  const Chaise = ({ cx }: { cx: number }) => (
    <g opacity={etat === "occupee" ? 0.4 : 0.95}>
      <rect
        x={cx - 3}
        y={t.y - 8}
        width="6"
        height="16"
        rx="2.5"
        fill="#c9a46a"
        stroke="#22201b"
        strokeWidth=".8"
      />
      <line
        x1={cx}
        y1={t.y - 5}
        x2={cx}
        y2={t.y + 5}
        stroke="#5f7f6a"
        strokeWidth="1.6"
      />
    </g>
  );

  return (
    <g
      className="plan-table"
      data-etat={etat}
      style={
        {
          "--table-delay": `${(Number(String(t.id).replace(/\D/g, "")) || 1) * 18}ms`,
        } as React.CSSProperties
      }
      role="button"
      tabIndex={etat === "occupee" ? -1 : 0}
      aria-label={label}
      aria-pressed={etat === "choisie"}
      onClick={() => onPick(t.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(t.id);
        }
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
        <rect
          x={t.x - w / 2}
          y={t.y - h / 2}
          width={w}
          height={h}
          rx="6"
          fill={fill}
          stroke="#22201b"
          strokeWidth="1.4"
        />
        {etat === "choisie" && (
          <rect
            className="plan-sceau"
            x={t.x - w / 2 - 4}
            y={t.y - h / 2 - 4}
            width={w + 8}
            height={h + 8}
            rx="9"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.3"
          />
        )}
        <text
          x={t.x}
          y={t.y + 4.5}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="13"
          fill={etat === "occupee" ? "#8b8477" : "#22201b"}
          style={{ pointerEvents: "none" }}
        >
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
    e === "occupee"
      ? t("plan.a11yPrise", "Table {{id}}, déjà réservée", { id })
      : e === "choisie"
        ? t("plan.a11yChoisie", "Table {{id}}, retenue pour vous", { id })
        : partenaireDe(id) !== undefined
          ? t(
              "plan.a11yLibrePaire",
              "Table {{id}}, libre, indissociable de la table {{p}}",
              { id, p: partenaireDe(id) },
            )
          : t("plan.a11yLibre", "Table {{id}}, libre, {{p}} couverts", {
              id,
              p: placesDe(id),
            });

  return (
    <svg
      viewBox="0 0 460 790"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label={t("plan.a11ySalle", "Plan de la salle, 21 tables")}
    >
      <Defs />

      <rect x="40" y="40" width="380" height="680" rx="10" fill="url(#mcSol)" />
      <path
        d="M40 50 a10 10 0 0 1 10 -10 H410 a10 10 0 0 1 10 10 V720 H330 M300 720 H40 Z"
        fill="none"
        stroke="#22201b"
        strokeWidth="2.2"
      />

      {/* signature : la vague lumineuse du plafond */}
      <path
        d={VAGUE}
        fill="none"
        stroke="url(#mcVague)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity=".28"
      />
      <path
        d={VAGUE}
        fill="none"
        stroke="#e4c374"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".85"
      />
      {[130, 260, 390, 520, 640].map((y, i) => (
        <circle
          key={y}
          cx={215 + (i % 2 ? -26 : 26)}
          cy={y}
          r="6.5"
          fill="#fffdf7"
          stroke="#d8d0bd"
          strokeWidth="1"
        />
      ))}

      {/* mur en pierre, banquette, néon cèdre */}
      <rect
        x="400"
        y="262"
        width="19"
        height="456"
        fill="url(#mcPierre)"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      <path
        d="M404 300 a6 8 0 0 1 12 0 M404 350 a6 8 0 0 1 12 0 M404 400 a6 8 0 0 1 12 0"
        fill="none"
        stroke="#fffdf7"
        strokeWidth="2"
        opacity=".8"
      />
      <path
        d="M409 470 l-5 9 h3 l-4 8 h4 l-4 8 h12 l-4 -8 h4 l-4 -8 h3 z"
        fill="#3fe27e"
        opacity=".9"
      />
      <rect
        x="386"
        y="270"
        width="13"
        height="150"
        rx="6"
        fill="#9aa894"
        stroke="#22201b"
        strokeWidth="1.1"
      />

      {/* comptoir snack */}
      <rect
        x="44"
        y="492"
        width="90"
        height="212"
        rx="8"
        fill="#b7bdb6"
        stroke="#22201b"
        strokeWidth="1.6"
      />
      <rect
        x="44"
        y="492"
        width="90"
        height="58"
        rx="8"
        fill="#9ea69c"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      <circle
        cx="66"
        cy="521"
        r="9"
        fill="#c08a4a"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      <circle
        cx="94"
        cy="521"
        r="9"
        fill="#c08a4a"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      <text
        x="89"
        y="630"
        textAnchor="middle"
        fontFamily="Playfair Display, serif"
        fontSize="23"
        letterSpacing="4"
        fill="#4a4437"
        transform="rotate(-90 89 630)"
      >
        SNACK
      </text>
      <text
        x="112"
        y="634"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="8.5"
        letterSpacing="1.4"
        fill="#8b8477"
        transform="rotate(-90 112 634)"
      >
        {t("plan.vitrine", "BROCHES · VITRINE · CAISSE")}
      </text>

      {/* coin Insta */}
      <rect
        x="42"
        y="160"
        width="16"
        height="120"
        rx="4"
        fill="#4c6b45"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      {Array.from({ length: 13 }).map((_, i) => (
        <circle
          key={i}
          cx={46 + (i % 3) * 5}
          cy={168 + i * 8.6}
          r="3.4"
          fill={["#e8d9c0", "#d6607a", GOLD, "#8a9a78"][i % 4]}
        />
      ))}
      <text
        x="76"
        y="220"
        textAnchor="middle"
        fontFamily="Playfair Display, serif"
        fontSize="15"
        letterSpacing="2"
        fill="#4a4437"
        transform="rotate(-90 76 220)"
      >
        {t("plan.coinInsta", "COIN INSTA")}
      </text>
      <text
        x="92"
        y="220"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="8.5"
        letterSpacing="1.2"
        fill="#8b8477"
        transform="rotate(-90 92 220)"
      >
        {t("plan.murFleurs", "MUR DE FLEURS · NÉON")}
      </text>
      <rect
        x="60"
        y="160"
        width="76"
        height="11"
        rx="5"
        fill="#9aa894"
        stroke="#22201b"
        strokeWidth="1"
      />
      <rect
        x="60"
        y="269"
        width="76"
        height="11"
        rx="5"
        fill="#9aa894"
        stroke="#22201b"
        strokeWidth="1"
      />

      {/* fond de salle */}
      <rect
        x="300"
        y="42"
        width="82"
        height="12"
        rx="4"
        fill="#4c6b45"
        stroke="#22201b"
        strokeWidth="1.2"
      />
      <text
        x="341"
        y="70"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="8.5"
        letterSpacing="1.2"
        fill="#8b8477"
      >
        {t("plan.cuisine", "CUISINE · WC")}
      </text>

      {SALLE.map((tb) => (
        <Table
          key={String(tb.id)}
          t={tb}
          etat={etat(tb.id)}
          onPick={onPick}
          label={label(tb.id, etat(tb.id))}
          w={(tb.places ?? PLACES_PAR_TABLE) >= 4 ? 50 : 38}
        />
      ))}

      {/* devanture + entrée */}
      <path d="M40 720 H300" stroke="#22201b" strokeWidth="5" />
      <path d="M40 714 H300" stroke="#b9d4d8" strokeWidth="3" opacity=".8" />
      <text
        x="170"
        y="742"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="1.6"
        fill="#8b8477"
      >
        {t("plan.vitrineRue", "VITRINE SUR RUE")}
      </text>
      <path
        d="M300 720 H330"
        stroke="#22201b"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <path
        d="M315 760 V730 M308 740 l7 -10 7 10"
        fill="none"
        stroke="#22201b"
        strokeWidth="1.8"
      />
      <text
        x="315"
        y="778"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        letterSpacing="1.6"
        fill="#6e6857"
      >
        {t("plan.entree", "ENTRÉE")}
      </text>

      <path
        d="M40 30 H420 M40 25 v10 M420 25 v10"
        stroke="#c3bcab"
        strokeWidth="1"
      />
      <text
        x="230"
        y="20"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        letterSpacing="1.5"
        fill="#8b8477"
      >
        {t("plan.legendeSalle", "SALLE · 21 TABLES")}
      </text>
    </svg>
  );
};

const PlanTerrasse: React.FC<PlanProps> = ({ etat, onPick, className }) => {
  const { t } = useTranslation();
  const label = (id: TableId, e: Etat) =>
    e === "occupee"
      ? t("plan.a11yPrise", "Table {{id}}, déjà réservée", { id })
      : e === "choisie"
        ? t("plan.a11yChoisie", "Table {{id}}, retenue pour vous", { id })
        : partenaireDe(id) !== undefined
          ? t(
              "plan.a11yLibrePaire",
              "Table {{id}}, libre, indissociable de la table {{p}}",
              { id, p: partenaireDe(id) },
            )
          : t("plan.a11yLibre", "Table {{id}}, libre, {{p}} couverts", {
              id,
              p: placesDe(id),
            });

  return (
    <svg
      viewBox="0 0 460 190"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label={t("plan.a11yTerrasse", "Plan de la terrasse, 6 tables")}
    >
      <Defs />
      <rect x="40" y="16" width="380" height="26" rx="6" fill={DARK_GREEN} />
      <text
        x="230"
        y="35"
        textAnchor="middle"
        fontFamily="Playfair Display, serif"
        fontSize="16"
        fontStyle="italic"
        fill="#e4c374"
      >
        Miss Chawarma
      </text>
      <path d="M40 44 H420" stroke="#22201b" strokeWidth="2" />

      {TERRASSE.map((tb) => (
        <Table
          key={String(tb.id)}
          t={tb}
          etat={etat(tb.id)}
          onPick={onPick}
          label={label(tb.id, etat(tb.id))}
          w={42}
          h={30}
        />
      ))}

      <path
        d="M40 158 H420"
        stroke="#22201b"
        strokeWidth="1.2"
        strokeDasharray="8 5"
      />
      <text
        x="40"
        y="178"
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="1.3"
        fill="#8b8477"
      >
        {t("plan.legendeTerrasse", "TERRASSE · 6 TABLES")}
      </text>
      <text
        x="420"
        y="178"
        textAnchor="end"
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="1.3"
        fill="#8b8477"
      >
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

    .plan-days {
      display:flex;
      gap:6px;
      overflow-x:auto;
      padding:2px 2px 6px;
    }
    .plan-days::-webkit-scrollbar { height:4px; }
    .plan-days::-webkit-scrollbar-thumb {
      background:rgba(31,107,45,.2);
      border-radius:4px;
    }

    .plan-day {
      flex:0 0 54px;
      min-width:54px;
      height:82px;
      padding:10px 6px;
      border:1px solid rgba(31,107,45,.16);
      border-radius:18px;
      background:rgba(255,255,255,.82);
      color:var(--dark);
      box-sizing:border-box;
      cursor:pointer;
      transition:transform .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease;
    }

    .plan-day:hover {
      transform:translateY(-2px);
      border-color:var(--green);
    }

    .plan-day:focus {
      outline:none;
    }

    .plan-day:focus-visible {
      outline:none;
      box-shadow:inset 0 0 0 2px var(--green);
    }

    .plan-day b {
      display:block;
      margin:3px 0;
      font-size:17px;
      font-weight:800;
      color:inherit;
    }

    .plan-day span {
      display:block;
      font-size:9px;
      letter-spacing:.08em;
      text-transform:uppercase;
      color:#a8a294;
    }

    .plan-day[data-on="1"] {
      background:var(--dark);
      color:#fff;
      border-color:var(--dark);
      box-shadow:none;
    }

    .plan-day[data-on="1"] span {
      color:rgba(255,255,255,.72);
    }

    .plan-seg {
      display:flex; gap:4px; padding:4px; border-radius:999px;
      background:rgba(31,107,45,.06); border:1px solid rgba(31,107,45,0.10);
    }
    .plan-seg button {
      flex:1; padding:9px; border:0; border-radius:999px; cursor:pointer;
      background:transparent; font-size:13px; font-weight:700; color:var(--dark); transition:.2s;
    }
    .plan-seg button[data-on="1"] { background:#fff; box-shadow:0 4px 12px rgba(31,60,30,.10); }

    .plan-chips {
      display:grid;
      grid-template-columns:repeat(4, minmax(0, 1fr));
      gap:7px;
    }
    .plan-chips-scroll { padding:2px 4px 2px 2px; }
    .plan-chip {
      width:100%; min-width:0; padding:8px 5px; border-radius:999px; cursor:pointer;
      font-size:12px; font-weight:600; white-space:nowrap; text-align:center;
      border:1px solid rgba(31,107,45,0.12); background:rgba(255,255,255,.7); color:var(--dark);
      transition:.18s;
    }
    @media (min-width:640px) {
      .plan-chips { grid-template-columns:repeat(6, minmax(0, 1fr)); }
      .plan-chip { padding:8px 8px; font-size:12.5px; }
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
      .plan-toast {
  position:absolute; left:50%; top:78px; transform:translateX(-50%);
  display:flex; align-items:center; gap:8px;
  padding:12px 18px; border-radius:14px; max-width:min(86%, 460px);
  background:rgba(22,79,34,.94); color:#fff8d8;
  font-size:13.5px; font-weight:600; line-height:1.4;
  box-shadow:0 14px 30px rgba(22,79,34,.28);
  z-index:20; pointer-events:none;
  animation: planToastIn .22s ease-out, planToastOut .22s ease-in 3s forwards;
}
.plan-toast svg { flex:none; color:${GOLD}; }
@keyframes planToastIn { from{opacity:0; transform:translate(-50%,-8px)} to{opacity:1; transform:translate(-50%,0)} }
@keyframes planToastOut { from{opacity:1} to{opacity:0} }
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


    /* ============================================================
       Confirmation de réservation — ticket premium
    ============================================================ */
    .success-stage {
      display:flex;
      justify-content:center;
      padding:10px 0 2px;
      text-align:center;
    }

    .success-card {
      position:relative;
      width:min(100%, 940px);
      overflow:hidden;
      padding:44px 34px 26px;
      border:1px solid rgba(31,107,45,.12);
      border-radius:32px;
      background:
        radial-gradient(circle at 88% 5%, rgba(197,154,40,.14), transparent 28%),
        radial-gradient(circle at 9% 95%, rgba(31,107,45,.09), transparent 30%),
        linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,252,244,.98));
      box-shadow:
        0 28px 70px rgba(31,60,30,.13),
        inset 0 1px 0 rgba(255,255,255,.95);
      animation:successCardEnter .62s cubic-bezier(.16,1,.3,1) both;
    }

    .success-card::before,
    .success-card::after {
      content:"";
      position:absolute;
      width:230px;
      height:230px;
      border:1px solid rgba(197,154,40,.12);
      border-radius:50%;
      pointer-events:none;
    }
    .success-card::before { right:-135px; top:-145px; }
    .success-card::after { left:-165px; bottom:-165px; }

    .success-line {
      position:absolute;
      left:50%;
      top:0;
      width:58%;
      height:3px;
      transform:translateX(-50%);
      border-radius:0 0 999px 999px;
      background:linear-gradient(90deg, transparent, ${GOLD}, ${GREEN}, ${GOLD}, transparent);
    }

    .success-spark {
      position:absolute;
      color:${GOLD};
      opacity:.34;
      animation:successSpark 3.4s ease-in-out infinite;
    }
    .success-spark-one { left:15%; top:23%; }
    .success-spark-two { right:14%; top:31%; animation-delay:-1.4s; }

    .success-check-wrap {
      position:relative;
      width:92px;
      height:92px;
      margin:0 auto 12px;
      display:grid;
      place-items:center;
    }
    .success-check-wrap > span {
      position:absolute;
      inset:8px;
      border:1px solid rgba(31,107,45,.13);
      border-radius:28px;
      animation:successRing 2.8s ease-out infinite;
    }
    .success-check-wrap > span:nth-child(2) { animation-delay:1.4s; }
    .success-check {
      position:relative;
      z-index:2;
      display:grid;
      place-items:center;
      width:66px;
      height:66px;
      border-radius:22px;
      color:#fff;
      background:linear-gradient(135deg, ${GREEN}, #3f934d);
      box-shadow:0 18px 36px rgba(31,107,45,.25);
      animation:successCheckPop .55s .2s cubic-bezier(.16,1,.3,1) both;
    }

    .success-kicker {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      margin:2px 0 8px;
      color:${GOLD};
      font-size:11px;
      font-weight:800;
      letter-spacing:.19em;
      text-transform:uppercase;
      animation:successFadeUp .5s .34s both;
    }

    .success-title {
      margin:0;
      color:${DARK_GREEN};
      font-size:clamp(36px, 5vw, 56px);
      font-weight:500;
      line-height:1.05;
      letter-spacing:-.035em;
      animation:successFadeUp .55s .4s both;
    }

    .success-copy {
      max-width:600px;
      margin:14px auto 0;
      color:#77736a;
      font-size:14px;
      line-height:1.75;
      animation:successFadeUp .55s .48s both;
    }

    .success-grid {
      display:grid;
      grid-template-columns:repeat(4, minmax(0,1fr));
      gap:12px;
      margin:30px auto 0;
      max-width:820px;
    }

    .success-info {
      display:flex;
      align-items:center;
      gap:12px;
      min-width:0;
      padding:17px 16px;
      text-align:left;
      border:1px solid rgba(31,107,45,.10);
      border-radius:19px;
      background:rgba(255,255,255,.72);
      box-shadow:0 10px 25px rgba(31,60,30,.055);
      opacity:0;
      animation:successInfoIn .5s cubic-bezier(.16,1,.3,1) forwards;
    }

    .success-info-icon {
      flex:none;
      display:grid;
      place-items:center;
      width:39px;
      height:39px;
      border-radius:13px;
      color:${GREEN};
      background:rgba(31,107,45,.08);
    }

    .success-info small {
      display:block;
      margin-bottom:4px;
      color:#aaa394;
      font-size:9px;
      font-weight:800;
      letter-spacing:.14em;
      text-transform:uppercase;
    }

    .success-info strong {
      display:block;
      overflow-wrap:anywhere;
      color:${DARK_GREEN};
      font-size:14px;
      line-height:1.3;
    }

    .success-ticket {
      width:max-content;
      max-width:100%;
      margin:18px auto 0;
      display:flex;
      align-items:center;
      gap:9px;
      padding:10px 15px;
      color:#81570b;
      border:1px dashed rgba(197,154,40,.50);
      border-radius:14px;
      background:rgba(197,154,40,.07);
      animation:successFadeUp .5s .88s both;
    }
    .success-ticket small {
      font-size:9px;
      font-weight:800;
      letter-spacing:.13em;
      text-transform:uppercase;
      color:#a99a78;
    }
    .success-ticket strong { color:#81570b; font-size:14px; }

    .success-reassurance {
      max-width:620px;
      margin:18px auto 0;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      color:#72776f;
      font-size:11.5px;
      line-height:1.5;
    }
    .success-reassurance svg { color:${GREEN}; flex:none; }

    .success-actions {
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:10px;
      margin-top:24px;
    }

    .success-primary,
    .success-secondary,
    .success-danger {
      min-height:45px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      padding:11px 18px;
      border-radius:999px;
      font-size:12.5px;
      font-weight:800;
      text-decoration:none;
      cursor:pointer;
      transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
    }

    .success-primary {
      border:1px solid ${GREEN};
      color:#fff;
      background:linear-gradient(135deg, ${GREEN}, ${DARK_GREEN});
      box-shadow:0 10px 24px rgba(31,107,45,.20);
    }
    .success-secondary {
      border:1px solid rgba(31,107,45,.14);
      color:${DARK_GREEN};
      background:rgba(31,107,45,.06);
    }
    .success-danger {
      border:1px solid rgba(181,65,55,.18);
      color:#a84137;
      background:rgba(181,65,55,.055);
    }
    .success-primary:hover,
    .success-secondary:hover,
    .success-danger:hover { transform:translateY(-2px); }

    .success-location {
      display:flex;
      justify-content:center;
      align-items:center;
      gap:6px;
      margin-top:22px;
      color:#999287;
      font-size:10.5px;
    }
    .success-location svg { color:${GOLD}; }

    /* Confirmation d'annulation */
    .cancel-confirm-overlay {
      position:fixed;
      inset:0;
      z-index:9999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      background:rgba(10,27,14,.54);
      backdrop-filter:blur(9px);
      -webkit-backdrop-filter:blur(9px);
      animation:cancelOverlayIn .22s ease-out both;
    }

    .cancel-confirm-card {
      width:min(100%, 480px);
      padding:30px 28px 26px;
      border:1px solid rgba(255,255,255,.55);
      border-radius:27px;
      text-align:center;
      background:
        radial-gradient(circle at 82% 2%, rgba(197,154,40,.12), transparent 35%),
        #fffdf8;
      box-shadow:0 34px 90px rgba(7,28,13,.33);
      animation:cancelCardIn .38s cubic-bezier(.16,1,.3,1) both;
    }

    .cancel-warning-icon {
      width:58px;
      height:58px;
      margin:0 auto 15px;
      display:grid;
      place-items:center;
      border-radius:19px;
      color:#a84137;
      background:rgba(181,65,55,.08);
      border:1px solid rgba(181,65,55,.12);
    }

    .cancel-confirm-eyebrow {
      margin:0 0 7px;
      color:${GOLD};
      font-size:10px;
      font-weight:800;
      letter-spacing:.18em;
      text-transform:uppercase;
    }

    .cancel-confirm-card h4 {
      margin:0;
      color:${DARK_GREEN};
      font-size:30px;
      font-weight:500;
    }

    .cancel-confirm-card > p:not(.cancel-confirm-eyebrow) {
      max-width:390px;
      margin:12px auto 0;
      color:#77736a;
      font-size:13px;
      line-height:1.65;
    }

    .cancel-summary {
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:8px;
      margin:20px 0 0;
    }
    .cancel-summary span {
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:8px 10px;
      border-radius:999px;
      color:#706b61;
      background:#f6f2e8;
      font-size:10.5px;
      font-weight:700;
    }
    .cancel-summary svg { color:${GREEN}; }

    .cancel-error {
      margin-top:15px;
      padding:10px 12px;
      border-radius:12px;
      color:#9c372f;
      background:#fff0ee;
      font-size:11.5px;
    }

    .cancel-confirm-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
      margin-top:22px;
    }
    .cancel-confirm-actions button {
      min-height:44px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:7px;
      padding:10px 14px;
      border-radius:14px;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
    }
    .cancel-confirm-actions button:disabled { opacity:.58; cursor:wait; }
    .cancel-keep {
      color:${DARK_GREEN};
      background:rgba(31,107,45,.06);
      border:1px solid rgba(31,107,45,.13);
    }
    .cancel-confirm-button {
      color:#fff;
      background:#a84137;
      border:1px solid #a84137;
      box-shadow:0 10px 22px rgba(168,65,55,.18);
    }

    /* État après annulation */
    .cancelled-card {
      max-width:720px;
      padding-top:52px;
      padding-bottom:42px;
    }
    .cancelled-line {
      background:linear-gradient(90deg, transparent, #a84137, ${GOLD}, transparent);
    }
    .cancelled-icon-wrap { margin-bottom:18px; }
    .cancelled-icon {
      width:66px;
      height:66px;
      margin:auto;
      display:grid;
      place-items:center;
      border-radius:22px;
      color:#fff;
      background:linear-gradient(135deg, ${GREEN}, #3f934d);
      box-shadow:0 16px 35px rgba(31,107,45,.22);
      animation:successCheckPop .55s .1s cubic-bezier(.16,1,.3,1) both;
    }
    .cancelled-kicker { color:#9b7b31; }
    .cancelled-ticket { margin-top:22px; }
    .cancelled-actions {
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:10px;
      margin-top:25px;
    }

    @keyframes successCardEnter {
      from { opacity:0; transform:translateY(18px) scale(.985); }
      to { opacity:1; transform:none; }
    }
    @keyframes successCheckPop {
      from { opacity:0; transform:scale(.6) rotate(-7deg); }
      to { opacity:1; transform:scale(1) rotate(0); }
    }
    @keyframes successRing {
      0% { opacity:.55; transform:scale(.82); }
      80%,100% { opacity:0; transform:scale(1.35); }
    }
    @keyframes successFadeUp {
      from { opacity:0; transform:translateY(8px); }
      to { opacity:1; transform:none; }
    }
    @keyframes successInfoIn {
      from { opacity:0; transform:translateY(10px); }
      to { opacity:1; transform:none; }
    }
    @keyframes successSpark {
      0%,100% { opacity:.18; transform:scale(.9) rotate(0); }
      50% { opacity:.62; transform:scale(1.1) rotate(8deg); }
    }
    @keyframes cancelOverlayIn { from { opacity:0 } to { opacity:1 } }
    @keyframes cancelCardIn {
      from { opacity:0; transform:translateY(14px) scale(.97); }
      to { opacity:1; transform:none; }
    }

    @media (max-width:760px) {
      .success-card { padding:36px 16px 22px; border-radius:24px; }
      .success-grid { grid-template-columns:1fr 1fr; gap:9px; margin-top:24px; }
      .success-info { padding:13px 12px; gap:9px; border-radius:15px; }
      .success-info-icon { width:34px; height:34px; border-radius:11px; }
      .success-title { font-size:38px; }
      .success-copy { font-size:13px; }
      .success-actions { flex-direction:column; }
      .success-primary,.success-secondary,.success-danger { width:100%; }
      .cancel-confirm-actions { grid-template-columns:1fr; }
      .cancel-confirm-card { padding:26px 18px 20px; border-radius:22px; }
    }

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
      .plan-cta::after,
      .success-card,
      .success-check,
      .success-check-wrap > span,
      .success-kicker,
      .success-title,
      .success-copy,
      .success-info,
      .success-ticket,
      .success-spark,
      .cancel-confirm-overlay,
      .cancel-confirm-card,
      .cancelled-icon { animation:none !important; }
      .plan-table { opacity:1 !important; transform:none !important; }
      .success-info { opacity:1 !important; }
    }
  `}</style>
);
