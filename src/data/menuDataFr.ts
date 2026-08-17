// src/data/menuDataFr.ts
interface MenuItem {
  name: string;
  price: string;
  short: string;
  image?: string;
  composition?: string[];
  allergens?: string[];
}

interface MenuSectionData {
  title: string;
  subtitle: string;
  items: MenuItem[];
}

export const MENU_SECTIONS: MenuSectionData[] = [
  // ... colle ici les 15 sections FR de ton ancien fichier
];