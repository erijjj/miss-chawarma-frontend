import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Salad,
  Sandwich,
  UtensilsCrossed,
  CakeSlice,
  CupSoda,
  Download,
  FileText,
  ArrowUp,
} from "lucide-react";
//import { MENU_SECTIONS_EN } from "../data/menuDataEn";
import DishCustomizationModal from "./DishCustomizationModal";
import { useQuery } from "@tanstack/react-query";
import type { CustomizationRules } from "./DishCustomizationModal";
// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuSectionData {
  title: string;
  subtitle: string;
  items: MenuItem[];
}
interface CardProps {
  item: MenuItem;
  onClick: () => void;
  index?: number;
  dishesByCategory: Record<string, MenuItem[]>; // NOUVEAU
  dishesById: Record<number, MenuItem>; // NOUVEAU
}

// ─── Données menu (français — source) ─────────────────────────────────────────
/*const MENU_SECTIONS: MenuSectionData[] = [
  {
    title: "Mezzé chauds",
    subtitle: "Spécialités chaudes",
    items: [
      {
        name: "Hallou'me",
        price: "8,90€",
        short: "Fromage de chèvre, thym, tomates et huile d'olive.",
        image: "/images/halloume.jpeg",
        composition: [
          "Fromage halloumi",
          "Thym frais",
          "Tomates cerises",
          "Huile d'olive extra vierge",
        ],
        allergens: ["Lait"],
      },
      {
        name: "Hommous avec Chawarma",
        price: "8,90€",
        short:
          "Purée de pois chiche, viande hachée, pignons de pin, paprika et coriandre.",
        image: "/images/houmous chawarma.jpeg",
        composition: [
          "Pois chiche",
          "Tahina",
          "Viande hachée",
          "Pignons de pin",
          "Paprika",
          "Coriandre",
          "Huile d'olive",
          "Citron",
        ],
        allergens: ["Sésame", "Fruits à coque"],
      },
      {
        name: "Batata harra",
        price: "8,90€",
        short: "Pommes de terre sautées à l'ail et coriandre.",
        image: "/images/batatahara.jpeg",
        composition: [
          "Pommes de terre",
          "Ail",
          "Coriandre fraîche",
          "Piment rouge",
          "Huile d'olive",
        ],
        allergens: [],
      },
      {
        name: "Makanek fait maison",
        price: "8,90€",
        short: "Saucisse de bœuf et mélasse de grenade.",
        image: "/images/makanek (2).jpeg",
        composition: [
          "Viande de bœuf",
          "Épices orientales",
          "Mélasse de grenade",
          "Pin grillés",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Soujouk fait maison",
        price: "8,90€",
        short: "Saucisse de bœuf épicée.",
        image: "/images/makanek.jpeg",
        composition: ["Viande de bœuf", "Paprika", "Cumin", "Ail", "Piment"],
        allergens: ["Gluten"],
      },
      {
        name: "Sawda poulet",
        price: "8,90€",
        short:
          "Foie de volaille sauté à l'ail, coriandre, mélasse de grenade et citron.",
        image: "/images/sawda.jpg",
        composition: [
          "Foie de volaille",
          "Ail",
          "Coriandre fraîche",
          "Mélasse de grenade",
          "Citron",
        ],
        allergens: [],
      },
    ],
  },
  {
    title: "Mezzé froids",
    subtitle: "Fraîcheur libanaise",
    items: [
      {
        name: "Hommous",
        price: "7,50€",
        short: "Purée de pois chiche, tahina, citron et huile d'olive.",
        image: "/images/hoummous.jpeg",
        composition: [
          "Pois chiche",
          "Tahina (crème de sésame)",
          "Citron",
          "Ail",
          "Huile d'olive",
        ],
        allergens: ["Sésame"],
      },
      {
        name: "Baba Ghanouj / Mouttabbal",
        price: "7,50€",
        short: "Aubergine à la crème de sésame, citron et huile d'olive.",
        image: "/images/mttabel.jpeg",
        composition: [
          "Aubergine grillée",
          "Tahina",
          "Citron",
          "Ail",
          "Huile d'olive",
          "Persil",
        ],
        allergens: ["Sésame"],
      },
      {
        name: "Labné à la libanaise",
        price: "7,50€",
        short: "Fromage blanc, thym, menthe et huile d'olive.",
        image: "/images/labnealalibanaise.jpeg",
        composition: [
          "Fromage blanc égoutté",
          "Zaatar (thym libanais)",
          "Menthe fraîche",
          "Huile d'olive",
        ],
        allergens: ["Lait"],
      },
      {
        name: "Moussaka",
        price: "7,50€",
        short: "Aubergine grillée, pois chiche et sauce tomate.",
        image: "/images/moussaka.jpeg",
        composition: [
          "Aubergine",
          "Pois chiche",
          "Tomates",
          "Ail",
          "Oignons",
          "Huile d'olive",
        ],
        allergens: [],
      },
      {
        name: "Mojadara",
        price: "7,50€",
        short: "Lentilles et riz aux oignons caramélisés.",
        image: "/images/Moujadara.jpg",
        composition: [
          "Lentilles vertes",
          "Riz",
          "Oignons caramélisés",
          "Cumin",
          "Huile d'olive",
        ],
        allergens: [],
      },
      {
        name: "Loubia b Zeyt",
        price: "7,50€",
        short: "Haricots verts mijotés à la tomate, oignons et huile d'olive.",
        image: "/images/loubye.jpeg",
        composition: [
          "Haricots verts",
          "Tomates",
          "Oignons",
          "Huile d'olive",
          "Ail",
        ],
        allergens: [],
      },
      {
        name: "Warak Enab",
        price: "7,50€",
        short: "Feuilles de vigne farcies au riz, tomates et persil.",
        image: "/images/warak enab.jpeg",
        composition: ["Feuilles de vigne", "Riz", "Tomates", "Persil"],
        allergens: [],
      },
    ],
  },
  {
    title: "Mezzé à partager",
    subtitle: "Chaud, froid et beignets variés",
    items: [
      {
        name: "Mezzé 2 personnes",
        price: "45€",
        short: "7 mezzés chauds, froids et beignets variés.",
        image: "/images/mezzePartage.jpeg",
        composition: [
          "7 mezzés au choix : chauds, froids et beignets assortis",
        ],
        allergens: ["Gluten", "Sésame", "Lait (selon choix)"],
      },
      {
        name: "Mezzé 3 personnes",
        price: "63€",
        short: "10 mezzés chauds, froids et beignets variés.",
        image: "/images/mezzePartage.jpeg",
        composition: [
          "10 mezzés au choix : chauds, froids et beignets assortis",
        ],
        allergens: ["Gluten", "Sésame", "Lait (selon choix)"],
      },
      {
        name: "Mezzé 4 personnes",
        price: "80€",
        short: "12 mezzés chauds, froids et beignets variés.",
        image: "/images/mezzePartage.jpeg",
        composition: [
          "12 mezzés au choix : chauds, froids et beignets assortis",
        ],
        allergens: ["Gluten", "Sésame", "Lait (selon choix)"],
      },
      {
        name: "Mezzé 5 personnes",
        price: "95€",
        short: "14 mezzés chauds, froids et beignets variés.",
        image: "/images/mezzePartage.jpeg",
        composition: ["14 mezzés chauds, froids et beignets variés"],
        allergens: ["Gluten", "Sésame", "Lait (selon choix)"],
      },
      {
        name: "Mezzé 6 personnes",
        price: "106€",
        short: "16 mezzés chauds, froids et beignets variés.",
        image: "/images/mezzePartage.jpeg",
        composition: ["16 mezzés chauds, froids et beignets variés"],
        allergens: ["Gluten", "Sésame", "Lait (selon choix)"],
      },
    ],
  },
  {
    title: "Salades libanaises",
    subtitle: "Fraîcheur et herbes",
    items: [
      {
        name: "Mrs. Fattoush",
        price: "7,20€",
        short:
          "Salade verte, tomates, concombres, radis, poivrons, citron et huile d'olive.",
        image: "/images/fattosh.jpeg",
        composition: [
          "Salade verte",
          "Tomates",
          "Concombres",
          "Radis",
          "Poivrons",
          "Citron",
          "Huile d'olive",
        ],
        allergens: [],
      },
      {
        name: "Miss Tabboulé",
        price: "7,20€",
        short:
          "Persil, blé concassé, menthe, tomates, oignons, citron et huile d'olive.",
        image: "/images/tabboule.jpeg",
        composition: [
          "Persil",
          "Blé concassé",
          "Menthe",
          "Tomates",
          "Oignons",
          "Citron",
          "Huile d'olive",
        ],
        allergens: ["Gluten"],
      },
    ],
  },
  {
    title: "Beignets",
    subtitle: "Pièces libanaises",
    items: [
      {
        name: "Falafel",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Boulette de fèves et pois chiche.",
        image: "/images/kafta1.jpeg",
        composition: ["Fèves", "Pois chiche", "Épices", "Herbes fraîches"],
        allergens: [],
      },
      {
        name: "Sambousek fromage",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Rissolé de fromage feta, graines de nigelle et persil.",
        image: "/images/sambousik fromage.jpg",
        composition: [
          "Fromage feta",
          "Graines de nigelle",
          "Persil",
          "Pâte croustillante",
        ],
        allergens: ["Gluten", "Lait"],
      },
      {
        name: "Sambousek viande",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Rissolé de viande hachée et oignons.",
        image: "/images/samboussekViande.jpeg",
        composition: [
          "Viande hachée",
          "Oignons",
          "Épices",
          "Pâte croustillante",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Rikakat",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Feuilleté farci au fromage feta parfumé aux herbes.",
        image: "/images/rikakat.jpeg",
        composition: ["Feuilleté", "Fromage feta", "Herbes"],
        allergens: ["Gluten", "Lait"],
      },
      {
        name: "Sfiha Baalbakye",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Tartelette de viande aux épices.",
        image: "/images/sfihalahme.jpg",
        composition: ["Viande", "Épices", "Pâte"],
        allergens: ["Gluten"],
      },
      {
        name: "Sfiha aubergine",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Tartelette d'aubergine, tomates et pois chiches.",
        image: "/images/sfihaObergine.jpeg",
        composition: ["Aubergine", "Tomates", "Pois chiches", "Pâte"],
        allergens: ["Gluten"],
      },
      {
        name: "Fatayer",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Chaussons aux épinards citronnés.",
        image: "/images/fatayer.jpeg",
        composition: ["Épinards", "Citron", "Pâte"],
        allergens: ["Gluten"],
      },
      {
        name: "Kebbé",
        price: "8€ / 4 pièces · 15,90€ / 8 pièces",
        short: "Boulettes de viande hachée au blé concassé et pignons de pin.",
        image: "/images/kebbe.jpeg",
        composition: ["Viande hachée", "Blé concassé", "Pignons de pin"],
        allergens: ["Gluten", "Fruits à coque"],
      },
    ],
  },
  {
    title: "Sandwiches",
    subtitle: "Classiques",
    items: [
      {
        name: "Chawarma poulet",
        price: "8,90€",
        short:
          "Poulet mariné rôti à la broche, cornichons, sauce à l'ail et frites.",
        image: "/images/sandpoulet.jpg",
        composition: [
          "Poulet mariné rôti à la broche",
          "Cornichons",
          "Sauce toum (ail)",
          "Frites",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Chawarma Bœuf",
        price: "8,90€",
        short:
          "Bœuf mariné, persil, oignons, tomates, tahina, cornichons et batata harra.",
        image: "/images/chBoeuf.jpeg",
        composition: [
          "Bœuf mariné",
          "Persil",
          "Oignons",
          "Tomates",
          "Tahina",
          "Cornichons",
          "Batata harra",
          "Pain pita",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Chich taouk",
        price: "8,90€",
        short:
          "Poulet mariné, cornichons, salade de choux, sauce à l'ail et frites.",
        image: "/images/Sandwich Chich taouk.jpg",
        composition: [
          "Brochette de poulet mariné",
          "Cornichons",
          "Salade de choux",
          "Sauce toum",
          "Frites",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Kafta",
        price: "8,90€",
        short:
          "Viande hachée, persil, oignons, tomates fraîches et crème de sésame.",
        image: "/images/sandkafta.jpg",
        composition: [
          "Viande hachée de bœuf",
          "Persil",
          "Oignons",
          "Tomates fraîches",
          "Tahina",
          "Pain pita",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Fahita",
        price: "8,90€",
        short:
          "Émincé de poulet mariné à la sauce tomate, poivron, champignon, oignons, cornichons.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Émincé de poulet",
          "Sauce tomate",
          "Poivrons",
          "Champignons",
          "Oignons",
          "Cornichons",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Poulet crispy",
        price: "8,90€",
        short:
          "Poulet mariné au curry, sauce à l'ail, tomates, salade, cornichons et frites.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Poulet mariné au curry",
          "Sauce à l'ail",
          "Tomates",
          "Salade",
          "Cornichons",
          "Frites",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Sojok fait maison",
        price: "8,90€",
        short:
          "Mini saucisses libanaises, sauce à l'ail, batata harra, tomates et cornichons.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Mini saucisses libanaises",
          "Sauce à l'ail",
          "Batata harra",
          "Tomates",
          "Cornichons",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Makanek fait maison",
        price: "8,90€",
        short:
          "Mini saucisses libanaises, mélasse de grenade, sauce à l'ail, tomates et cornichons.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Mini saucisses libanaises",
          "Mélasse de grenade",
          "Sauce à l'ail",
          "Tomates",
          "Cornichons",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Kebbé",
        price: "8,90€",
        short:
          "Bœuf haché et blé, crème de sésame, oignons, tomates fraîches, cornichons.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Bœuf haché",
          "Blé",
          "Crème de sésame",
          "Oignons",
          "Tomates",
          "Cornichons",
          "Pain pita",
        ],
        allergens: ["Gluten", "Sésame"],
      },
    ],
  },
  {
    title: "Sandwiches Végétariens",
    subtitle: "Végé",
    items: [
      {
        name: "Falafel",
        price: "8,90€",
        short:
          "Beignets de pois chiche, tomates, salade, cornichon, crème de sésame et hommous.",
        image: "/images/sandfalafel.jpg",
        composition: [
          "Beignets de pois chiche",
          "Tomates",
          "Salade",
          "Cornichons",
          "Tahina",
          "Hommous",
          "Pain pita",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Batata/Frites",
        price: "8,90€",
        short:
          "Sandwich frites, tomates, salade, ketchup, cornichons, coleslaw et sauce à l'ail.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Frites",
          "Tomates",
          "Salade",
          "Ketchup",
          "Cornichons",
          "Coleslaw",
          "Sauce toum",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Labné",
        price: "8,90€",
        short:
          "Fromage blanc, tomates, menthe, huile d'olive, salade et chips de zaatar.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Labné (fromage blanc)",
          "Tomates",
          "Menthe fraîche",
          "Huile d'olive",
          "Salade",
          "Chips de zaatar",
          "Pain pita",
        ],
        allergens: ["Gluten", "Lait"],
      },
      {
        name: "Moutabal / Baba Ghanouj",
        price: "8,90€",
        short:
          "Aubergines, crème de sésame, salade, batata harra, tomates et huile d'olive.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Aubergines",
          "Crème de sésame",
          "Salade",
          "Batata harra",
          "Tomates",
          "Huile d'olive",
          "Pain pita",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Makali",
        price: "8,90€",
        short:
          "Chou-fleur grillé, aubergine grillée, batata harra, tomates, salade, citron et ail.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Chou-fleur grillé",
          "Aubergine grillée",
          "Batata harra",
          "Tomates",
          "Salade",
          "Citron",
          "Ail",
          "Pain pita",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Halloumi",
        price: "8,90€",
        short:
          "Fromage halloumi, zaatar, tomates fraîches, huile d'olive, taboulé et salade.",
        image: "/images/sandkebbe.jpg",
        composition: [
          "Fromage halloumi grillé",
          "Zaatar",
          "Tomates fraîches",
          "Huile d'olive",
          "Taboulé",
          "Salade",
          "Pain pita",
        ],
        allergens: ["Gluten", "Lait"],
      },
      {
        name: "Miss Végé",
        price: "8,90€",
        short: "Moutabal, taboulé, feuilles de vignes.",
        image: "/images/sandkebbe.jpg",
        composition: ["Moutabal", "Taboulé", "Feuilles de vigne", "Pain pita"],
        allergens: ["Gluten", "Sésame"],
      },
    ],
  },
  {
    title: "Sandwiches Combos",
    subtitle: "Formules sandwich",
    items: [
      {
        name: "Tarbouch",
        price: "12,90€",
        short: "1 sandwich, 2 beignets et une boisson.",
        image:
          "https://i.ibb.co/bMZyCsfp/Chat-GPT-Image-Jun-11-2026-01-57-53-PM.png",
        composition: [
          "1 sandwich au choix",
          "2 beignets assortis",
          "1 boisson au choix",
        ],
        allergens: ["Gluten (selon choix)"],
      },
      {
        name: "Mez'Mix",
        price: "13,90€",
        short: "Sandwich, 2 mezzés froids et une boisson.",
        image:
          "https://i.ibb.co/XrN5QP1q/Chat-GPT-Image-Jun-11-2026-02-01-30-PM.png",
        composition: [
          "1 sandwich au choix",
          "2 mezzés froids au choix",
          "1 boisson au choix",
        ],
        allergens: ["Gluten", "Sésame (selon choix)"],
      },
      {
        name: "Miss",
        price: "13,90€",
        short: "Sandwich, 2 baklawas ou mouhalabiyé et une boisson.",
        image:
          "https://i.ibb.co/M5pDn55h/Chat-GPT-Image-Jun-11-2026-02-06-32-PM.png",
        composition: [
          "1 sandwich au choix",
          "2 baklawas ou 1 mouhalabiyé",
          "1 boisson au choix",
        ],
        allergens: ["Gluten", "Fruits à coque (selon dessert)"],
      },
      {
        name: "Mez'Max",
        price: "16,90€",
        short: "2 sandwiches et une boisson.",
        image: "/images/Mezz max.jpeg",
        composition: ["2 sandwiches au choix", "1 boisson au choix"],
        allergens: ["Gluten (selon choix)"],
      },
      {
        name: "Mrs.bowl",
        price: "11,90€",
        short:
          "Riz libanais ou Batata Harra + Chawarma poulet ou taouk ou Falafel + 2 beignets au choix ou 2 feuilles de vigne + 1 boisson.",
        image:
          "https://i.ibb.co/p6TtBhDx/Chat-GPT-Image-Jun-11-2026-12-07-22-AM.png",
        composition: [
          "Riz libanais ou Batata Harra",
          "Chawarma poulet ou taouk ou Falafel",
          "2 beignets au choix ou 2 feuilles de vigne",
          "1 boisson",
        ],
        allergens: ["Gluten", "Sésame (selon choix)"],
      },
    ],
  },
  {
    title: "Plats",
    subtitle: "Formules maison",
    items: [
      {
        name: "Mr. Tarbouch",
        price: "20€",
        short:
          "4 assortiments de makanek et soujouk maison, 3 mezzés, 3 beignets et batata harra.",
        image: "/images/mr. tarbouch.jpeg",
        composition: [
          "Makanek maison",
          "Soujouk maison",
          "3 mezzés assortis",
          "3 beignets assortis",
          "Batata harra",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Miss Chawarma",
        price: "23€",
        short:
          "Duo de chawarma avec 3 assortiments proposés par le chef, 3 beignets et batata harra.",
        image: "/images/misschawarma.jpeg",
        composition: [
          "Chawarma poulet",
          "Chawarma bœuf",
          "3 assortiments du chef",
          "3 beignets assortis",
          "Batata harra",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Maison Mezze",
        price: "25€",
        short:
          "3 mezzés, 3 beignets, batata harra, brochette chich taouk et sandwich chawarma coupé.",
        image:
          "https://i.ibb.co/B5rHLX2Q/Chat-GPT-Image-Jun-11-2026-11-12-59-AM.png",
        composition: [
          "3 mezzés assortis",
          "3 beignets assortis",
          "Batata harra",
          "Brochette chich taouk",
          "Sandwich chawarma coupé",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Mezze Royal",
        price: "27€",
        short:
          "4 mezzés, 3 beignets, batata harra, chich taouk, kafta, soujouk, makanek et boisson incluse.",
        image:
          "https://i.ibb.co/gZ2N3rFG/Chat-GPT-Image-Jun-11-2026-11-15-37-AM.png",
        composition: [
          "4 mezzés assortis",
          "3 beignets assortis",
          "Batata harra",
          "Chich taouk",
          "Kafta",
          "Soujouk",
          "Makanek",
          "Boisson incluse",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Sawda poulet",
        price: "8,90€",
        short:
          "Foie de volaille sauté à l'ail, coriandre, mélasse de grenade et citron.",
        image: "/images/sawda.jpg",
        composition: [
          "Foie de volaille",
          "Ail",
          "Coriandre fraîche",
          "Mélasse de grenade",
          "Citron",
        ],
        allergens: [],
      },
    ],
  },
  {
    title: "Plats Chawarma",
    subtitle: "Accompagnés de 3 assortiments",
    items: [
      {
        name: "Chawarma Poulet",
        price: "16,90€",
        short:
          "Émincé de poulet mariné rôti à la broche accompagné de 3 assortiments.",
        image: "/images/pouletplat.jpeg",
        composition: [
          "Poulet mariné rôti à la broche",
          "3 assortiments au choix : salade, riz, frites, hommous, etc.",
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Chawarma bœuf",
        price: "18,90€",
        short: "Émincé de bœuf mariné accompagné de 3 assortiments.",
        image: "/images/plat chawarma viande.png",
        composition: ["Bœuf mariné", "3 assortiments au choix"],
        allergens: ["Gluten"],
      },
    ],
  },
  {
    title: "Grillades au feu de bois",
    subtitle: "Brochettes et mix grill",
    items: [
      {
        name: "Chichtaouk",
        price: "16,90€",
        short:
          "Deux brochettes de poulet mariné au citron accompagnées de 3 assortiments.",
        image: "/images/chichtaouk plat.jpeg",
        composition: [
          "2 brochettes de poulet mariné au citron",
          "3 assortiments au choix",
        ],
        allergens: [],
      },
      {
        name: "Kafta",
        price: "16,90€",
        short:
          "Deux brochettes de bœuf, persil, oignons accompagnées de 3 assortiments.",
        image: "/images/plat kafta.jpeg",
        composition: [
          "2 brochettes de bœuf haché",
          "Persil",
          "Oignons",
          "3 assortiments au choix",
        ],
        allergens: [],
      },
      {
        name: "Miss Lahmé",
        price: "20,90€",
        short:
          "Deux brochettes d'agneau mariné accompagnées de 3 assortiments.",
        image:
          "https://i.ibb.co/1fKj0j59/Chat-GPT-Image-Jun-8-2026-09-27-24-AM.png",
        composition: [
          "2 brochettes d'agneau mariné",
          "3 assortiments au choix",
        ],
        allergens: [],
      },
      {
        name: "Mix'Ta Grill",
        price: "22,90€",
        short: "Chichtaouk, Kafta et lahmé accompagnés de 3 assortiments.",
        image: "/images/Mix'Ta Grill.jpg",
        composition: [
          "1 brochette chichtaouk",
          "1 brochette kafta",
          "1 brochette lahmé (agneau)",
          "3 assortiments au choix",
        ],
        allergens: [],
      },
    ],
  },
  {
    title: "Plats Découvertes",
    subtitle: "Assiettes découverte",
    items: [
      {
        name: "Foie volaille",
        price: "14,90€",
        short: "Foie de volaille avec 3 assortiments.",
        image:
          "https://i.ibb.co/xq69ZDD7/Chat-GPT-Image-Jun-8-2026-09-38-57-AM.png",
        composition: ["Foie de volaille", "3 assortiments"],
        allergens: [],
      },
    ],
  },
  {
    title: "Plats Végétariens",
    subtitle: "Formules et assiettes veggie",
    items: [
      {
        name: "Mrs. Végé'dream",
        price: "14,90€",
        short: "Hommous, taboulé, moutabal, fatayer, sfiha aubergine, falafel.",
        image: "/images/Mrs Vegedream.jpeg",
        composition: [
          "Hommous",
          "Taboulé",
          "Moutabal",
          "Fatayer",
          "Sfiha aubergine",
          "Falafel",
        ],
        allergens: ["Gluten", "Sésame"],
      },
      {
        name: "Mrs. Falafel",
        price: "14,90€",
        short: "4 pièces falafels, hommous, taboulé, crème de sésame.",
        image: "/images/Mrs falafel.jpeg",
        composition: [
          "4 pièces falafels",
          "Hommous",
          "Taboulé",
          "Crème de sésame",
        ],
        allergens: ["Gluten", "Sésame"],
      },
    ],
  },
  {
    title: "Burgers",
    subtitle: "Servis avec 2 assortiments et frites",
    items: [
      {
        name: "Hamburger libanais au feu de bois",
        price: "14,90€",
        short:
          "Steak haché, tomates, oignons grillés, coleslaw, cornichons servi avec 2 assortiments et frites.",
        image:
          "/images/burger.jpeg",
        composition: [
          "Steak haché",
          "Tomates",
          "Oignons grillés",
          "Coleslaw",
          "Cornichons",
          "2 assortiments",
          "Frites",
        ],
        allergens: ["Gluten"],
      },
    ],
  },
  {
    title: "Desserts",
    subtitle: "Douceurs libanaises",
    items: [
      {
        name: "Baklawa Cajou",
        price: "2€",
        short: "Pâtisserie libanaise feuilletée au miel et aux noix de cajou.",
        image:
          "https://i.ibb.co/4ZQSfrY4/Chat-GPT-Image-Jun-11-2026-12-53-57-AM.png",
        composition: [
          "Pâte filo",
          "Noix de cajou",
          "Miel",
          "Sirop de fleur d'oranger",
        ],
        allergens: ["Gluten", "Fruits à coque"],
      },
      {
        name: "Baklawa pistache",
        price: "2,50€",
        short: "Pâtisserie libanaise feuilletée au miel et à la pistache.",
        image: "/images/baklawa.jpg",
        composition: [
          "Pâte filo",
          "Pistaches",
          "Miel",
          "Sirop de fleur d'oranger",
        ],
        allergens: ["Gluten", "Fruits à coque"],
      },
      {
        name: "Mouhalabiyé",
        price: "4,90€",
        short:
          "Flan libanais parfumé à la fleur d'oranger, pistaches à la rose.",
        image: "/images/mouhalabeya.jpeg",
        composition: [
          "Lait",
          "Amidon de maïs",
          "Eau de fleur d'oranger",
          "Pistaches",
          "Pétales de rose",
        ],
        allergens: ["Lait", "Fruits à coque"],
      },
      {
        name: "Maacarons libanais",
        price: "3,90€",
        short: "Pâtisserie libanaise traditionnelle parfumée.",
        image:
          "https://i.ibb.co/YTkCbLgQ/Chat-GPT-Image-Jun-15-2026-03-04-34-PM.png",
        composition: ["Semoule", "Sucre", "Anis", "Sirop parfumé"],
        allergens: ["Gluten"],
      },
      {
        name: "Namoura",
        price: "3,90€",
        short: "Gâteau libanais à la semoule, moelleux et parfumé.",
        image: "/images/Namoura (2).jpeg",
        composition: ["Semoule", "Sucre", "Yaourt", "Sirop parfumé"],
        allergens: ["Gluten", "Lait"],
      },
      {
        name: "Knefeh",
        price: "7,90€",
        short:
          "Gâteau aux cheveux d'ange avec fromage, pistaches et sirop de sucre.",
        image:
          "https://i.ibb.co/yBQThLrV/Chat-GPT-Image-Jun-11-2026-12-59-41-AM.png",
        composition: [
          "Cheveux d'ange (kataïfi)",
          "Fromage akkawi",
          "Pistaches",
          "Sirop de sucre parfumé",
        ],
        allergens: ["Gluten", "Lait", "Fruits à coque"],
      },
      {
        name: "Sfouf",
        price: "3,90€",
        short: "Gâteau libanais à la semoule et au curcuma.",
        image:
          "https://i.ibb.co/FqHHB6mb/Chat-GPT-Image-Jun-11-2026-01-01-00-AM.png",
        composition: [
          "Semoule de blé",
          "Curcuma",
          "Anis",
          "Huile de tournesol",
          "Sucre",
          "Pignons de pin",
        ],
        allergens: ["Gluten", "Fruits à coque"],
      },
      {
        name: "Café ou Thé gourmand",
        price: "7,90€",
        short:
          "Café ou thé accompagné de deux petites pâtisseries libanaises ou 1 mouhalabiyé ou sfouf.",
        image:
          "https://i.ibb.co/fVTkJjxS/Chat-GPT-Image-Jun-11-2026-01-06-50-AM.png",
        composition: [
          "Café ou thé",
          "2 petites pâtisseries libanaises",
          "Ou 1 mouhalabiyé",
          "Ou sfouf",
        ],
        allergens: ["Selon la pâtisserie"],
      },
    ],
  },
  {
    title: "Boissons",
    subtitle: "Fraîches et chaudes",
    items: [
      {
        name: "Citronnade fait maison",
        price: "3,50€",
        short: "Jus de citron, fleur d'oranger, menthe.",
        image: "/images/citronade.jpeg",
        composition: [
          "Citron pressé",
          "Eau de fleur d'oranger",
          "Menthe fraîche",
          "Sucre",
        ],
        allergens: [],
      },
      {
        name: "Jus de fruits rouge fait maison",
        price: "4€",
        short: "Fruits rouges frais pressés maison.",
        image:
          "https://i.ibb.co/Z1NYBfjG/Chat-GPT-Image-Jun-11-2026-12-13-48-AM.png",
        composition: ["Fruits rouges de saison", "Sucre de canne"],
        allergens: [],
      },
      {
        name: "Sodas",
        price: "2,50€",
        short: "Coca-Cola, Ice Tea, Fanta, Oasis, Orangina, Sprite...",
        image:
          "https://i.ibb.co/Lz8bPZKR/Chat-GPT-Image-Jun-11-2026-12-29-14-AM.png",
        composition: [
          "Coca-Cola",
          "Ice Tea",
          "Fanta",
          "Oasis",
          "Orangina",
          "Sprite",
        ],
        allergens: [],
      },
      {
        name: "Eau",
        price: "2€",
        short: "Plate ou gazeuse.",
        image: "/images/evian.jpeg",
        composition: ["Eau plate ou eau gazeuse"],
        allergens: [],
      },
      {
        name: "Ayran",
        price: "2,50€",
        short: "Lait fermenté salé.",
        image:
          "https://i.ibb.co/xSqLSjMx/Chat-GPT-Image-Jun-11-2026-12-41-53-AM.png",
        composition: ["Lait fermenté", "Sel"],
        allergens: ["Lait"],
      },
      {
        name: "Miss Tea",
        price: "2€",
        short:
          "Thé maison aromatisé à la menthe, cannelle, thym et fleur d'oranger.",
        image:
          "https://i.ibb.co/j9LPwQsC/Chat-GPT-Image-Jun-11-2026-12-47-28-AM.png",
        composition: [
          "Thé noir",
          "Menthe",
          "Cannelle",
          "Thym",
          "Eau de fleur d'oranger",
        ],
        allergens: [],
      },
      {
        name: "Café by Nespresso",
        price: "2,50€",
        short: "Expresso ou allongé.",
        image:
          "https://i.ibb.co/FbQM4XPY/Chat-GPT-Image-Jun-11-2026-12-50-22-AM.png",
        composition: ["Expresso", "Allongé"],
        allergens: [],
      },
    ],
  },
];
*/
const PLACEHOLDER = "https://placehold.co/400x260/9ca89b/f7f0e4?text=🌯";

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

const ItemModal: React.FC<ModalProps> = ({ item, onClose, onAddToCart }) => {
  const { t } = useTranslation();

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="item-modal-scroll relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "#f7f0e4",
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="w-full h-52 overflow-hidden">
          <img
            src={item.image || PLACEHOLDER}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-white font-bold text-lg shadow"
          style={{ background: "#1f6b2d" }}
          aria-label={t("menuPage.close")}
        >
          ✕
        </button>

        <div className="p-6">
          <div className="mb-3">
            <h3
              className="text-2xl font-playfair leading-tight"
              style={{ color: "#1f6b2d" }}
            >
              {item.name}
            </h3>
            <span
              className="inline-block mt-1 text-sm font-bold"
              style={{ color: "#c47d0e" }}
            >
              {item.price}
            </span>
          </div>

          {item.composition && item.composition.length > 0 && (
            <div className="mb-4">
              <h4
                className="text-sm font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#1f6b2d" }}
              >
                {t("menuPage.composition")}
              </h4>
              <ul className="space-y-1">
                {item.composition.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2"
                    style={{ color: "#444" }}
                  >
                    <span style={{ color: "#9ca89b" }}>•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm mb-5 leading-relaxed" style={{ color: "#555" }}>
            {item.short}
          </p>

          {item.allergens && item.allergens.length > 0 && (
            <div
              className="mt-4 rounded-xl p-3"
              style={{ background: "#9ca89b22", border: "1px solid #9ca89b55" }}
            >
              <h4
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#c47d0e" }}
              >
                ⚠ {t("menuPage.allergens")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "#c47d0e22",
                      color: "#c47d0e",
                      border: "1px solid #c47d0e55",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.allergens && item.allergens.length === 0 && (
            <div
              className="mt-4 rounded-xl p-3"
              style={{ background: "#1f6b2d11", border: "1px solid #1f6b2d33" }}
            >
              <p className="text-xs" style={{ color: "#1f6b2d" }}>
                ✓ {t("menuPage.noAllergens")}
              </p>
            </div>
          )}

          {item.id != null && (
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="mt-6 w-full rounded-2xl py-3 text-white font-semibold flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #1f6b2d, #2d8a3e)",
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {t("menuPage.addToCart", "Ajouter au panier")}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .item-modal-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>,
    document.body
  );
};

// ─── Carte plat ───────────────────────────────────────────────────────────────
interface CardProps {
  item: MenuItem;
  onClick: () => void;
  index?: number;
}

const MenuCard: React.FC<CardProps> = ({
  item,
  onClick,
  index = 0,
  dishesByCategory,
  dishesById,
}) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);
  const [burstKey, setBurstKey] = React.useState(0);

  const [showCustomize, setShowCustomize] = React.useState(false);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.id == null) return;

    if (item.customizationRules) {
      setShowCustomize(true);
      return;
    }

    addItem({
      dishId: item.id,
      name: item.name,
      price: item.numericPrice ?? 0,
      priceLabel: item.price,
      image: item.image,
      isBeignet: item.sectionKey === "Beignets",
    });
    setAdded(true);
    setBurstKey((v) => v + 1);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      onClick={showCustomize ? undefined : onClick}
      className="menu-dish-card group relative overflow-hidden rounded-[24px] cursor-pointer"
      style={
        {
          background:
            "linear-gradient(145deg, rgba(157,169,156,0.98), rgba(135,153,136,0.98))",
          animationDelay: `${Math.min(index * 80, 560)}ms`,
        } as React.CSSProperties
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!showCustomize && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      aria-label={item.name}
    >
      <div className="menu-card-shine" aria-hidden="true" />

      <div className="menu-card-image-wrap relative h-48 overflow-hidden">
        <img
          src={item.image || PLACEHOLDER}
          alt={item.name}
          className="menu-card-image h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER;
          }}
        />

        <div className="menu-card-image-overlay" />

        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[#f7f0e4]/92 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1f6b2d] opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-[-6px]">
          <Eye className="h-3.5 w-3.5" />
          {t("menuPage.discover", "Découvrir")}
        </div>

        <span
          className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg"
          style={{
            color: "#1f6b2d",
            background: "rgba(247,240,228,0.94)",
          }}
        >
          {item.price}
        </span>
      </div>

      <div className="relative p-5">
        <div className="mb-2 pr-12">
          <h4 className="font-playfair text-[1.35rem] leading-tight text-[#fff8d8]">
            {item.name}
          </h4>
        </div>

        <p className="line-clamp-2 min-h-[44px] text-sm leading-[1.55] text-[#f7f0e4]/90">
          {item.short}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#fff8d8]/75 transition-colors group-hover:text-white">
            <Sparkles className="h-3.5 w-3.5" />
            {t("menuPage.seeComposition")}
          </span>

          {item.id != null && (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={t("menuPage.addToCart", "Ajouter au panier")}
              className={`menu-add-button relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-visible rounded-full ${
                added ? "menu-add-button-added" : ""
              }`}
              style={{
                background: added ? "#c47d0e" : "#1f6b2d",
                color: "#fff8d8",
              }}
            >
              <span className="menu-add-icon">
                {added ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  <ShoppingCart className="h-5 w-5" strokeWidth={2.4} />
                )}
              </span>

              {added && (
                <span
                  key={burstKey}
                  className="menu-add-burst"
                  aria-hidden="true"
                >
                  {Array.from({ length: 8 }).map((_, burstIndex) => (
                    <span
                      key={burstIndex}
                      style={
                        {
                          "--burst-angle": `${burstIndex * 45}deg`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .menu-dish-card {
          opacity: 0;
          transform: translateY(28px) scale(0.985);
          box-shadow: 0 14px 34px rgba(35, 56, 36, 0.10);
          animation: menuCardReveal 0.72s cubic-bezier(0.16,1,0.3,1) forwards;
          transition:
            transform 0.42s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.42s ease;
          isolation: isolate;
        }

        .menu-dish-card:hover {
          transform: translateY(-9px) rotateX(1.5deg);
          box-shadow:
            0 28px 56px rgba(31,60,30,0.19),
            0 10px 22px rgba(31,60,30,0.09);
        }

        .menu-card-image {
          transform: scale(1.02);
          transition:
            transform 0.85s cubic-bezier(0.16,1,0.3,1),
            filter 0.5s ease;
        }

        .menu-dish-card:hover .menu-card-image {
          transform: scale(1.10);
          filter: saturate(1.08) contrast(1.02);
        }

        .menu-card-image-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent 42%,
              rgba(20,50,25,0.16) 100%
            );
          pointer-events: none;
        }

        .menu-card-shine {
          position: absolute;
          z-index: 6;
          inset: -45%;
          opacity: 0;
          pointer-events: none;
          background:
            linear-gradient(
              115deg,
              transparent 35%,
              rgba(255,255,255,0.18) 50%,
              transparent 65%
            );
          transform: translateX(-70%) rotate(8deg);
        }

        .menu-dish-card:hover .menu-card-shine {
          animation: menuCardShine 0.95s ease-out;
        }

        .menu-add-button {
          box-shadow:
            0 9px 18px rgba(31,107,45,0.28),
            inset 0 1px 0 rgba(255,255,255,0.18);
          transition:
            transform 0.28s cubic-bezier(0.16,1,0.3,1),
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .menu-add-button:hover {
          transform: translateY(-3px) rotate(90deg) scale(1.08);
          box-shadow:
            0 13px 24px rgba(31,107,45,0.34),
            0 0 0 5px rgba(31,107,45,0.08);
        }

        .menu-add-button-added,
        .menu-add-button-added:hover {
          animation: menuAddedPop 0.48s cubic-bezier(0.16,1,0.3,1);
          transform: none;
        }

        .menu-add-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-add-button-added .menu-add-icon {
          animation: menuCheckDraw 0.38s ease-out;
        }

        .menu-add-burst {
          position: absolute;
          inset: 50%;
          pointer-events: none;
        }

        .menu-add-burst > span {
          --burst-angle: 0deg;
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #e5c77e;
          animation: menuBurstParticle 0.62s ease-out forwards;
          transform:
            rotate(var(--burst-angle))
            translateX(0);
        }

        @keyframes menuCardReveal {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes menuCardShine {
          0% {
            opacity: 0;
            transform: translateX(-70%) rotate(8deg);
          }
          35% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(70%) rotate(8deg);
          }
        }

        @keyframes menuAddedPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.22); }
          70% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }

        @keyframes menuCheckDraw {
          from {
            opacity: 0;
            transform: rotate(-22deg) scale(0.4);
          }
          to {
            opacity: 1;
            transform: rotate(0) scale(1);
          }
        }

        @keyframes menuBurstParticle {
          0% {
            opacity: 1;
            transform:
              rotate(var(--burst-angle))
              translateX(8px)
              scale(1);
          }
          100% {
            opacity: 0;
            transform:
              rotate(var(--burst-angle))
              translateX(34px)
              scale(0.15);
          }
        }
@media (max-width: 640px) {
  .menu-card-image-wrap {
    height: 7.5rem; /* h-30 environ, au lieu de h-48 */
  }
  .menu-dish-card .relative.p-5 {
    padding: 0.85rem;
  }
  .menu-dish-card h4 {
    font-size: 1rem;
    line-height: 1.2;
  }
  .menu-dish-card p.line-clamp-2 {
    font-size: 0.72rem;
    min-height: 32px;
    -webkit-line-clamp: 2;
  }
  .menu-add-button {
    width: 2.25rem;
    height: 2.25rem;
  }
  .menu-add-button svg {
    width: 1rem;
    height: 1rem;
  }
  span[style*="Découvrir"],
  .menu-dish-card .absolute.left-4.top-4 {
    display: none; /* le badge "Découvrir" au survol n'a pas de sens au tactile */
  }
  .menu-dish-card .absolute.right-4.top-4 {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
  }
}
        @media (prefers-reduced-motion: reduce) {
          .menu-dish-card,
          .menu-card-shine,
          .menu-add-button,
          .menu-add-icon,
          .menu-add-burst > span {
            animation: none !important;
            transition: none !important;
          }

          .menu-dish-card {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
      {showCustomize && item.id != null && item.customizationRules && (
        <DishCustomizationModal
          dishId={item.id}
          name={item.name}
          price={item.numericPrice ?? 0}
          priceLabel={item.price}
          image={item.image}
          rules={item.customizationRules}
          baseAllergens={item.allergens ?? []}
          dishesByCategory={dishesByCategory}
          dishesById={dishesById}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </article>
  );
};

// ─── Connexion à l'API du menu (backend) ──────────────────────────────────────
// En local, VITE_API_URL (dans .env) prend le dessus ; sinon on retombe sur Render.
const API_URL =
  import.meta.env.VITE_API_URL || "https://chatbot-api-o6bw.onrender.com";

interface MenuItem {
  id?: number;
  name: string;
  price: string;
  numericPrice?: number;
  short: string;
  image?: string;
  composition?: string[];
  allergens?: string[];
  hidden?: boolean;
  sectionKey?: string; // ⟵ AJOUT : nom FR de la catégorie d'origine (ex. "Beignets")
  customizationRules?: CustomizationRules | null; // ⟵ AJOUT
}
interface ApiDish {
  id: number;
  name_fr: string;
  name_en: string;
  short_fr: string;
  short_en: string;
  price: number;
  price_label_fr: string;
  price_label_en: string;
  composition_fr: string[];
  composition_en: string[];
  allergens_fr: string[];
  allergens_en: string[];
  image_url: string;
  hidden?: boolean;
  customization_rules: CustomizationRules | null; // ⟵ AJOUT
}

interface ApiCategory {
  id: number;
  name_fr: string;
  name_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  dishes: ApiDish[];
}

// Formate un prix numérique si aucun price_label n'est renseigné (ex : 8.9 -> "8,90€")
const formatPriceFallback = (price: number): string => {
  if (Number.isInteger(price)) return `${price}€`;
  return `${price.toFixed(2).replace(".", ",")}€`;
};

// Forme commune, que la donnée vienne du backend (live) ou du secours local (hors-ligne)
interface NormalizedSection {
  key: string; // toujours le nom FR — identifiant stable, quelle que soit la langue affichée
  title: string;
  subtitle: string;
  items: MenuItem[];
}

/*const buildStaticSections = (lang: "fr" | "en"): NormalizedSection[] =>
  MENU_SECTIONS.map((section, i) => {
    const localized = lang === "en" ? MENU_SECTIONS_EN[i] : section;
    return {
      key: section.title, // le titre FR sert de clé stable, y compris en affichage EN
      title: localized?.title ?? section.title,
      subtitle: localized?.subtitle ?? section.subtitle,
      items: (localized?.items ?? section.items).map((it) => ({
        ...it,
        sectionKey: section.title,
      })),
    };
  });
*/
const buildApiSections = (
  categories: ApiCategory[],
  lang: "fr" | "en",
): NormalizedSection[] =>
  categories.map((cat) => ({
    key: cat.name_fr,
    title: lang === "en" ? cat.name_en : cat.name_fr,
    subtitle: (lang === "en" ? cat.subtitle_en : cat.subtitle_fr) || "",
    items: cat.dishes.map((d) => ({
      id: d.id,
      hidden: d.hidden,
      name: lang === "en" ? d.name_en : d.name_fr,
      price:
        (lang === "en" ? d.price_label_en : d.price_label_fr) ||
        formatPriceFallback(d.price),
      short: lang === "en" ? d.short_en : d.short_fr,
      image: d.image_url || undefined,
      composition: lang === "en" ? d.composition_en : d.composition_fr,
      allergens: lang === "en" ? d.allergens_en : d.allergens_fr,
      numericPrice: d.price,
      sectionKey: cat.name_fr, // ⟵ AJOUT
      customizationRules: d.customization_rules, // ⟵ AJOUT
    })),
  }));

// Regroupement en onglets : chaque groupe liste les catégories (par nom FR, stable) affichées.
// Une catégorie déjà listée ici qui reçoit un nouveau plat dans l'admin l'affiche automatiquement.
const TAB_GROUPS: { labelKey: string; matchKeys: string[] }[] = [
  {
    labelKey: "menuTabs.mezzes",
    matchKeys: [
      "Mezzé chauds",
      "Mezzé froids",
      "Mezzé à partager",
      "Salades libanaises",
      "Beignets",
    ],
  },
  {
    labelKey: "menuTabs.sandwiches",
    matchKeys: [
      "Sandwiches",
      "Sandwiches Végétariens",
      "Sandwiches Combos",
      "Burgers",
    ],
  },
  {
    labelKey: "menuTabs.platsGrillades",
    matchKeys: [
      "Plat du Chef",
      "Plats",
      "Plats Chawarma",
      "Grillades au feu de bois",
      "Plats Découvertes",
      "Plats Végétariens",
    ],
  },
  
  { labelKey: "menuTabs.desserts", matchKeys: ["Desserts"] },
  { labelKey: "menuTabs.boissons", matchKeys: ["Boissons"] },
];

// ─── Composant principal ──────────────────────────────────────────────────────
const TAB_ICONS = [Salad, Sandwich, UtensilsCrossed, CakeSlice, CupSoda];

const MenuSection = () => {
  const { t, i18n } = useTranslation();
  const lang: "fr" | "en" = i18n.resolvedLanguage === "en" ? "en" : "fr";


  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const [customizeItem, setCustomizeItem] = React.useState<MenuItem | null>(
    null,
  );
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const { addItem } = useCart();

  const handleAddFromItemModal = (item: MenuItem) => {
    if (item.id == null) return;
    if (item.customizationRules) {
      setSelectedItem(null);
      setCustomizeItem(item);
      return;
    }
    addItem({
      dishId: item.id,
      name: item.name,
      price: item.numericPrice ?? 0,
      priceLabel: item.price,
      image: item.image,
      isBeignet: item.sectionKey === "Beignets",
    });
    setSelectedItem(null);
  };

  const { data: apiCategories } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/menu`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiCategory[] = await res.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // le menu est considéré "frais" pendant 5 min — pas de re-fetch inutile
    gcTime: 30 * 60 * 1000, // garde les données en cache 30 min même après avoir quitté la page
  });

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 620);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections: NormalizedSection[] = React.useMemo(
    () => (apiCategories ? buildApiSections(apiCategories, lang) : []),
    [apiCategories, lang],
  );
  const dishesByCategory = React.useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    sections.forEach((s) => {
      map[s.key] = s.items.filter((it) => !it.hidden);
    });
    return map;
  }, [sections]);

  const dishesById = React.useMemo(() => {
    const map: Record<number, MenuItem> = {};
    sections.forEach((s) =>
      s.items.forEach((it) => {
        if (it.id != null) map[it.id] = it;
      }),
    );
    return map;
  }, [sections]);
  const groupedKeys = new Set(TAB_GROUPS.flatMap((group) => group.matchKeys));

  const leftover = sections.filter((section) => !groupedKeys.has(section.key));

  const tabs = TAB_GROUPS.map((group, index) => ({
    label: t(group.labelKey),
    matchKeys: group.matchKeys,
    Icon: TAB_ICONS[index] ?? Sparkles,
  }));

  if (leftover.length > 0) {
    tabs.push({
      label: lang === "en" ? "Other" : "Autres",
      matchKeys: leftover.map((section) => section.key),
      Icon: Sparkles,
    });
  }

  React.useEffect(() => {
    if (activeTabIndex >= tabs.length) {
      setActiveTabIndex(0);
    }
  }, [activeTabIndex, tabs.length]);

  const currentTab = tabs[activeTabIndex] ?? tabs[0];

  const visibleSections = currentTab.matchKeys
    .map((key) => sections.find((section) => section.key === key))
    .filter((section): section is NormalizedSection => Boolean(section));

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    setSelectedSectionKey(null);
    setActiveSectionKey(null);

    window.requestAnimationFrame(() => {
      const el = document.getElementById("menu-content-start");
      if (el) {
        const offset = navHeight + NAV_STICKY_TOP + 18;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  const [activeSectionKey, setActiveSectionKey] = React.useState<string | null>(
    null,
  );

  // Filtre réellement appliqué aux plats.
  // null = afficher toutes les sous-catégories de l'onglet principal.
  const [selectedSectionKey, setSelectedSectionKey] = React.useState<
    string | null
  >(null);

  const displayedSections = selectedSectionKey
    ? visibleSections.filter((section) => section.key === selectedSectionKey)
    : visibleSections;

  const filterToSubsection = (key: string | null) => {
    setSelectedSectionKey(key);
    setActiveSectionKey(key);

    window.requestAnimationFrame(() => {
      const el = document.getElementById("menu-content-start");
      if (el) {
        const offset = navHeight + NAV_STICKY_TOP + 18;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  // La barre de navigation reste visible au scroll via une vraie fixation
  // pilotée en JS (position: fixed), plus fiable que position: sticky quand
  // un parent de la page a un overflow qui casse le comportement natif.
  const NAV_STICKY_TOP = 88; // à ajuster si la hauteur du header change
  const navRef = React.useRef<HTMLDivElement>(null);
  const [navOffsetTop, setNavOffsetTop] = React.useState<number | null>(null);
  const [navHeight, setNavHeight] = React.useState(0);
  const [navPinned, setNavPinned] = React.useState(false);

  React.useEffect(() => {
    if (navPinned) return; // ne pas re-mesurer une fois fixé (devient relatif au viewport)

    const measure = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setNavOffsetTop(rect.top + window.scrollY);
        setNavHeight(rect.height);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navPinned, tabs.length, visibleSections.length]);

  React.useEffect(() => {
    const handleNavScroll = () => {
      if (navOffsetTop == null) return;
      setNavPinned(window.scrollY > navOffsetTop - NAV_STICKY_TOP);
    };

    handleNavScroll();
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleNavScroll);
  }, [navOffsetTop]);

  // Scroll-spy : met en avant la sous-section actuellement visible dans les
  // filtres de droite, pour une navigation plus lisible.
  React.useEffect(() => {
    if (selectedSectionKey || visibleSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute("data-section-key");
            if (key) setActiveSectionKey(key);
          }
        });
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 },
    );

    visibleSections.forEach((section) => {
      const el = document.getElementById(
        `menu-subsection-${slugify(section.key)}`,
      );
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionKey, visibleSections.map((s) => s.key).join("|")]);

  const scrollToSubsection = (key: string) => {
    filterToSubsection(key);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="menu"
      className="menu-page-section relative pb-20 pt-24"
      style={{ background: "#f7f0e4" }}
    >
      <div className="container-width">
        {/* Payment notice banner */}
        <div
          className="mx-auto mb-8 max-w-3xl rounded-2xl border px-5 py-3 text-center text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #fbce8b22, #bfa43522)",
            borderColor: "rgba(196,125,14,0.25)",
            color: "#8a5800",
            fontFamily: "'Fraunces', serif",
          }}
        >
          <span
            className="mr-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#c47d0e", color: "#fff8d8" }}
          >
            {t("menuPage.urgent", "Important")}
          </span>
          {t(
            "menuPage.paymentNotice",
            "Online payment is now available.",
          )}
        </div>

        {/* Main menu heading */}
        <div className="mx-auto max-w-4xl text-center">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.3em] md:text-xs"
            style={{ color: "#c47d0e" }}
          >
            {t("menuPage.eyebrow", "La table Miss Chawarma")}
          </p>

          <h2
            className="mt-2 font-playfair text-4xl md:text-5xl"
            style={{ color: "#1f6b2d" }}
          >
            {t("menuPage.title")}
          </h2>

          <p
            className="mx-auto mt-3 max-w-2xl text-sm leading-6 md:text-base"
            style={{ color: "#555" }}
          >
            {t("menuPage.subtitle")}
          </p>
        </div>

        {/* Primary + secondary navigation: categories and subsection filters, one cohesive shell that pins on scroll */}
        <div className="mt-8">
          {navPinned && <div style={{ height: navHeight }} />}

          <div
            ref={navRef}
            className={`menu-nav-shell mx-auto ${
              navPinned ? "menu-nav-shell-pinned" : ""
            }`}
            style={navPinned ? { top: NAV_STICKY_TOP } : undefined}
          >
            <div className="menu-filter-header">
              <div className="menu-filter-title-wrap">
                <span className="menu-filter-kicker">
                  {t("menuPage.filterBy", "Filtrer le menu")}
                </span>
                <strong className="menu-filter-current">
                  {currentTab?.label}
                </strong>
              </div>

              <nav
                className="menu-category-scroll flex gap-2 overflow-x-auto"
                aria-label={t("menuPage.categories", "Catégories du menu")}
              >
                {tabs.map((tab, index) => {
                  const Icon = tab.Icon;
                  const active = activeTabIndex === index;

                  return (
                    <button
                      key={`${tab.label}-${index}`}
                      type="button"
                      onClick={() => handleTabChange(index)}
                      className={`menu-category-tab ${
                        active ? "menu-category-tab-active" : ""
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="menu-category-icon">
                        <Icon className="h-4 w-4" strokeWidth={1.9} />
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {visibleSections.length > 1 && (
              <>
                <div className="menu-nav-divider" />

                <div
                  className="menu-subfilter-scroll flex items-center justify-center gap-2 overflow-x-auto"
                  aria-label={t(
                    "menuPage.subfilters",
                    "Filtres de la catégorie",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => filterToSubsection(null)}
                    className={`menu-subfilter-chip ${
                      selectedSectionKey === null
                        ? "menu-subfilter-chip-active"
                        : ""
                    }`}
                  >
                    {t("menuPage.all", "Tous")}
                  </button>

                  {visibleSections.map((section) => {
                    const active = selectedSectionKey === section.key;

                    return (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => filterToSubsection(section.key)}
                        className={`menu-subfilter-chip ${
                          active ? "menu-subfilter-chip-active" : ""
                        }`}
                        aria-pressed={active}
                      >
                        {section.title}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary action: downloadable PDFs */}
        <div className="menu-download-row mx-auto mt-6 max-w-3xl">
          <div className="menu-download-heading">
            <span className="menu-download-heading-icon">
              <FileText className="h-4 w-4" />
            </span>

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "#c47d0e" }}
              >
                {t("menuPage.downloadEyebrow", "Version à emporter")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {t(
                  "menuPage.downloadText",
                  "Téléchargez notre carte complète au format PDF.",
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/menus/MENU MISS CHAWARMA VF FR.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
              className="menu-download-button menu-download-button-primary"
            >
              <Download className="h-4 w-4" />
              <span>{t("menuPage.menuFr")}</span>
              <span className="menu-pdf-badge">PDF</span>
            </a>

            <a
              href="/menus/MENU MISS CHAWARMA VF EN.pdf"
              download
              target="_blank"
              rel="noopener noreferrer"
              className="menu-download-button"
            >
              <Download className="h-4 w-4" />
              <span>{t("menuPage.menuEn")}</span>
              <span className="menu-pdf-badge">PDF</span>
            </a>
          </div>
        </div>

        <div className="menu-gold-divider mx-auto mt-8 max-w-5xl">
          <span />
          <Sparkles className="h-4 w-4" />
          <span />
        </div>

        {/* Food sections */}
        <div id="menu-content-start" className="scroll-mt-28 pt-8">
          {displayedSections.map((section, sectionIndex) => (
            <div
              key={section.key}
              id={`menu-subsection-${slugify(section.key)}`}
              data-section-key={section.key}
              className="mb-12 scroll-mt-36"
              style={
                {
                  "--section-delay": `${sectionIndex * 90}ms`,
                } as React.CSSProperties
              }
            >
              <div className="menu-section-heading mb-7">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.25em]"
                    style={{ color: "#c47d0e" }}
                  >
                    {t("menuPage.freshlyPrepared", "Préparé avec soin")}
                  </p>

                  <h3
                    className="mt-1 font-playfair text-3xl md:text-4xl"
                    style={{ color: "#1f6b2d" }}
                  >
                    {section.title}
                  </h3>

                  <p className="mt-2 text-sm text-neutral-500">
                    {section.subtitle}
                  </p>
                </div>

                <div
                  className="hidden h-px flex-1 md:block"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(196,125,14,0.5), transparent)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
                {" "}
                {section.items
                  .filter((item) => !item.hidden)
                  .map((item, itemIndex) => (
                    <MenuCard
                      key={item.id ?? `${section.key}-${item.name}`}
                      item={item}
                      index={itemIndex}
                      onClick={() => setSelectedItem(item)}
                      dishesByCategory={dishesByCategory}
                      dishesById={dishesById}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll-to-top button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t("common.scrollTop", "Retour en haut")}
        className={`menu-scroll-top ${
          showScrollTop ? "menu-scroll-top-visible" : ""
        }`}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </button>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddFromItemModal}
        />
      )}

      {customizeItem &&
        customizeItem.id != null &&
        customizeItem.customizationRules && (
          <DishCustomizationModal
            dishId={customizeItem.id}
            name={customizeItem.name}
            price={customizeItem.numericPrice ?? 0}
            priceLabel={customizeItem.price}
            image={customizeItem.image}
            rules={customizeItem.customizationRules}
            baseAllergens={customizeItem.allergens ?? []}
            dishesByCategory={dishesByCategory}
            dishesById={dishesById}
            onClose={() => setCustomizeItem(null)}
          />
        )}

      <style>{`
        .menu-page-section {
          isolation: isolate;
        }

        .menu-nav-shell {
          /*
            La largeur suit automatiquement le contenu.
            Si de nouvelles catégories arrivent depuis la base, la barre grandit
            jusqu'à la largeur disponible, puis devient scrollable horizontalement.
          */
          width: fit-content;
          max-width: calc(100vw - 36px);
          overflow: hidden;
          border: 1px solid rgba(31,107,45,0.11);
          border-radius: 24px;
          background: rgba(255,253,248,0.97);
          box-shadow:
            0 18px 45px rgba(31,60,30,0.11),
            inset 0 1px 0 rgba(255,255,255,0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition:
            width .28s ease,
            max-width .28s ease,
            box-shadow .28s ease,
            border-color .28s ease,
            border-radius .28s ease;
        }

        .menu-nav-shell-pinned {
          position: fixed;
          left: 50%;
          right: auto;
          width: max-content;
          max-width: calc(100vw - 36px);
          z-index: 60;
          border-radius: 20px;
          border-color: rgba(31,107,45,0.16);
          box-shadow:
            0 16px 40px rgba(18,63,29,0.16),
            0 1px 0 rgba(255,255,255,0.9) inset;
          transform: translateX(-50%);
          animation: menuNavPinIn 0.26s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes menuNavPinIn {
          from {
            opacity: 0;
            transform: translate(-50%, -8px) scale(.99);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .menu-filter-header {
          display: flex;
          width: max-content;
          max-width: 100%;
          align-items: center;
          gap: 18px;
          padding: 10px 12px 10px 16px;
        }

        .menu-filter-title-wrap {
          flex: 0 0 auto;
          min-width: 126px;
          padding-right: 16px;
          border-right: 1px solid rgba(31,107,45,.10);
        }

        .menu-filter-kicker {
          display: block;
          color: #b2770b;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .menu-filter-current {
          display: block;
          margin-top: 2px;
          color: #123f1d;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
        }

        .menu-nav-divider {
          height: 1px;
          margin: 0 14px;
          min-width: 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(31,107,45,0.12) 12%,
              rgba(196,125,14,0.14) 50%,
              rgba(31,107,45,0.12) 88%,
              transparent
            );
        }

.menu-category-scroll {
  display: flex !important;
  width: 100% !important;
  max-width: 100% !important;
  gap: 8px !important;
  padding: 4px 12px !important;
  overflow-x: auto !important;
  justify-content: flex-start !important;
  scroll-padding-inline: 12px;
  scrollbar-width: none;
}

        .menu-category-scroll::-webkit-scrollbar,
        .menu-subfilter-scroll::-webkit-scrollbar {
          display: none;
        }

        .menu-category-tab {
          position: relative;
          display: inline-flex;
          min-height: 40px;
          flex: 0 0 auto;
          align-items: center;
          gap: 7px;
          border: 1px solid transparent;
          border-radius: 14px;
          padding: 7px 11px;
          color: #5c695d;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          transition:
            color 0.25s ease,
            background 0.25s ease,
            transform 0.25s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .menu-category-tab:hover {
          color: #1f6b2d;
          border-color: rgba(31,107,45,.10);
          background: rgba(31,107,45,0.055);
          transform: translateY(-1px);
        }

        .menu-category-tab-active {
          color: #fff8d8;
          border-color: rgba(31,107,45,.30);
          background: linear-gradient(135deg, #1f6b2d, #2f843b);
          box-shadow: 0 8px 18px rgba(31,107,45,0.20);
          transform: translateY(-1px);
        }

        .menu-category-tab-active:hover {
          color: #fff8d8;
          background: linear-gradient(135deg, #1f6b2d, #2f843b);
        }

        .menu-category-icon {
          display: flex;
          width: 26px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(31,107,45,0.08);
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .menu-category-tab:hover .menu-category-icon {
          transform: rotate(-5deg) scale(1.05);
        }

        .menu-category-tab-active .menu-category-icon {
          color: #fff8d8;
          background: rgba(255,255,255,0.13);
        }

        .menu-category-active-dot {
          display: none;
        }

        .menu-subfilter-scroll {
          width: 100%;
          max-width: 100%;
          scrollbar-width: none;
          padding: 9px 12px 10px;
          background:
            linear-gradient(90deg, rgba(247,240,228,.42), rgba(196,125,14,.035));
        }

        .menu-subfilter-label {
          display: none;
        }

        .menu-subfilter-chip {
          display: inline-flex;
          min-height: 34px;
          flex: 0 0 auto;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(31,107,45,0.13);
          border-radius: 999px;
          padding: 6px 11px 6px 7px;
          color: #556356;
          background: rgba(255,255,255,.72);
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
          box-shadow: 0 3px 10px rgba(31,60,30,.035);
          transition:
            color .22s ease,
            background .22s ease,
            border-color .22s ease,
            transform .22s ease,
            box-shadow .22s ease;
        }

        .menu-subfilter-chip:hover {
          color: #1f6b2d;
          border-color: rgba(31,107,45,.24);
          background: #fffdf8;
          transform: translateY(-1px);
        }

        .menu-subfilter-chip-active {
          color: #7b5205;
          border-color: rgba(196,125,14,.34);
          background: linear-gradient(135deg, #fff4d7, #f6e6b7);
          box-shadow: 0 7px 18px rgba(196,125,14,.12);
        }

        .menu-subfilter-count {
          display: inline-flex;
          min-width: 22px;
          height: 22px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #1f6b2d;
          background: rgba(31,107,45,.09);
          font-size: 9px;
          font-weight: 850;
        }

        .menu-subfilter-chip-active .menu-subfilter-count {
          color: #fff8d8;
          background: #c47d0e;
        }

        .menu-download-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border: 1px solid rgba(196,125,14,0.13);
          border-radius: 22px;
          padding: 12px 14px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.46),
              rgba(229,199,126,0.07)
            );
        }

        .menu-download-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .menu-download-heading-icon {
          display: flex;
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: #c47d0e;
          background: rgba(196,125,14,0.10);
        }

        .menu-download-button {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(31,107,45,0.13);
          border-radius: 15px;
          padding: 9px 12px;
          color: #1f6b2d;
          background: rgba(255,255,255,0.70);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 7px 16px rgba(31,60,30,0.06);
          transition:
            transform 0.3s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.3s ease,
            background 0.3s ease;
        }

        .menu-download-button:hover {
          transform: translateY(-3px);
          background: #fff;
          box-shadow: 0 12px 24px rgba(31,60,30,0.11);
        }

        .menu-download-button-primary {
          color: #fff8d8;
          border-color: transparent;
          background:
            linear-gradient(135deg, #b69c22, #2d8a3e);
          box-shadow: 0 9px 20px rgba(31,107,45,0.20);
        }

        .menu-download-button-primary:hover {
          color: #fff8d8;
          background:
            linear-gradient(135deg, #c4a62a, #2d8a3e);
        }

        .menu-pdf-badge {
          border-radius: 999px;
          padding: 2px 7px;
          color: inherit;
          background: rgba(255,255,255,0.18);
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        .menu-download-button:not(.menu-download-button-primary)
          .menu-pdf-badge {
          background: rgba(31,107,45,0.08);
        }

        .menu-gold-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #c47d0e;
        }

        .menu-gold-divider span {
          width: min(170px, 30vw);
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(196,125,14,0.50)
            );
        }

        .menu-gold-divider span:last-child {
          transform: scaleX(-1);
        }

        .menu-section-heading {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          opacity: 0;
          transform: translateY(18px);
          animation:
            menuSectionHeadingIn 0.65s
            cubic-bezier(0.16,1,0.3,1)
            var(--section-delay, 0ms)
            forwards;
        }

    .menu-scroll-top {
  position: fixed;
  left: 26px;
  bottom: 28px;

  width: 52px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(247,240,228,.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  border: 1px solid rgba(31,107,45,.18);

  color: #1f6b2d;

  box-shadow:
      0 10px 30px rgba(31,107,45,.12);

  cursor: pointer;

  opacity: 0;
  visibility: hidden;

  transform: translateX(-25px);

  transition:
      all .35s cubic-bezier(.16,1,.3,1);

  z-index: 80;
}

.menu-scroll-top-visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.menu-scroll-top:hover {
  background: #1f6b2d;
  color: #fff8d8;

  transform: translateX(0) translateY(-4px);

  box-shadow:
      0 16px 36px rgba(31,107,45,.22);
}

.menu-scroll-top svg {
  transition: transform .25s ease;
}

.menu-scroll-top:hover svg {
  transform: translateY(-3px);
}

.menu-scroll-top-ring {
  display: none;
}

@media (max-width: 768px) {
  .menu-scroll-top {
    left: 18px;
    bottom: 20px;

    width: 46px;
    height: 46px;
  }
}



        @keyframes menuTabSpring {
          0% {
            transform: translateY(0) scale(0.92);
          }
          60% {
            transform: translateY(-3px) scale(1.04);
          }
          100% {
            transform: translateY(-2px) scale(1);
          }
        }

        @keyframes menuActiveDot {
          0%, 100% {
            transform: scale(0.82);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes menuSectionHeadingIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes menuScrollRing {
          0% {
            opacity: 0.72;
            transform: scale(0.88);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(1.28);
          }
        }

        @media (max-width: 767px) {
.menu-nav-shell {
  width: calc(100vw - 24px);
  max-width: calc(100vw - 24px);
  margin-left: auto;
  margin-right: auto;
  border-radius: 18px;
}
          .menu-nav-shell-pinned {
            left: 50%;
            right: auto;
            width: max-content;
            max-width: calc(100vw - 16px);
            border-radius: 16px;
            transform: translateX(-50%);
          }

          .menu-filter-header {
            display: block;
            padding: 8px 9px 7px;
          }

          .menu-filter-title-wrap {
            display: none;
          }

.menu-category-scroll {
  justify-content: flex-start;
  padding-left: 10px;
  padding-right: 10px;
}

.menu-category-tab {
  flex: 0 0 auto !important;
  width: auto !important;
  min-width: max-content !important;
  min-height: 42px;
  padding: 7px 12px;
  gap: 6px;
  justify-content: center;
  font-size: 11px;
  white-space: nowrap;
}
     
.menu-category-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.menu-subfilter-scroll {
  width: 100%;
  justify-content: flex-start !important;
  padding: 7px 12px 8px;
  gap: 7px;
  overflow-x: auto;
  scroll-padding-inline: 12px;
}
.menu-subfilter-scroll::after {
  content: "";
  flex: 0 0 8px;
}
          .menu-subfilter-chip {
            min-height: 32px;
            padding: 5px 11px;
            font-size: 10px;
          }

          .menu-download-row {
            align-items: stretch;
            flex-direction: column;
          }

          .menu-download-row > div:last-child {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .menu-download-button {
            justify-content: center;
            min-width: 0;
          }

          .menu-scroll-top {
            right: 16px;
            bottom: 104px;
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 430px) {
          .menu-download-row > div:last-child {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .menu-category-tab-active,
          .menu-category-active-dot,
          .menu-section-heading,
          .menu-scroll-top-ring {
            animation: none !important;
          }

          .menu-section-heading {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

// Transforme une clé de section (nom FR) en identifiant DOM stable
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default MenuSection;
