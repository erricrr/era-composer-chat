import composersData from './composers.json';

export interface Composer {
  id: string;
  name: string;
  searchableName: string;
  era: Era[];
  birthYear: number;
  deathYear: number | null;
  shortBio: string;
  longBio: string;
  nationality: string;
  location: string;
  famousWorks: string[];
  imageUrl: string;
}

export enum Era {
  Baroque = "Baroque",
  Classical = "Classical",
  Romantic = "Romantic",
  Modern = "20th Century"
}

export const eras = [
  {
    id: "baroque",
    name: Era.Baroque,
    period: "1600-1750",
    description: "Spanning the Early, Middle, and Late Baroque, this era brings grandeur and drama through intricate counterpoint, ornate melodies, and basso continuo. It marks the emergence of opera, the development of the concerto and fugue, and a growing focus on expressive structure."
  },
  {
    id: "classical",
    name: Era.Classical,
    period: "1750-1820",
    description: "From the Galant style to the late Classical period, this era values clarity, balance, and formal structure. It refines the symphony and sonata, emphasizing elegant melodies, clear harmonies, and forms like sonata-allegro and rondo, marking a shift from Baroque complexity."
  },
  {
    id: "romantic",
    name: Era.Romantic,
    period: "1820-1900",
    description: "Divided into Early, High, and Late Romantic periods, this era emphasized emotion, individuality, and imagination. Composers explored lyrical melodies, rich chromaticism, national identity, and larger orchestras, with program music and expressive nuance taking center stage."
  },
  {
    id: "modern",
    name: Era.Modern,
    period: "1900-2000",
    description: "Beginning with Impressionism's dreamy soundscapes, the century saw composers break traditional rules, experiment with unusual sounds, and draw inspiration globally. New technologies transformed how music was created and heard, producing everything from atmospheric pieces to bold experimental works unprecedented in earlier periods."
  }
];

// Type assertion to ensure the imported JSON matches our Composer interface
export const composers: Composer[] = composersData.composers as Composer[];

// Function to get composers by era
export const getComposersByEra = (era: Era): Composer[] => {
  return composers.filter(composer => {
    // Support legacy data where era might be a string
    if (Array.isArray(composer.era)) {
      return composer.era.includes(era);
    } else {
      return composer.era === era;
    }
  });
};

// Function to extract the last name, handling prefixes like "de" and "de La"
export const getLastName = (fullName: string): string => {
  if (!fullName) {
    return "";
  }
  const parts = fullName.trim().split(' ');
  const n = parts.length;

  if (n === 0) {
    return "";
  }
  if (n === 1) {
    return parts[0];
  }

  // Check for "de La Xyz" (case-insensitive)
  if (n >= 3 && parts[n - 2].toLowerCase() === 'la' && parts[n - 3].toLowerCase() === 'de') {
    return parts.slice(n - 3).join(' ');
  }

  // Check for "de Xyz" (case-insensitive)
  if (n >= 2 && parts[n - 2].toLowerCase() === 'de') {
    return parts.slice(n - 2).join(' ');
  }

  // Default: last word
  return parts[n - 1];
};

// Function to check if composer is likely in the public domain (died <= 1954)
export const isComposerInPublicDomain = (composer: Composer): boolean => {
  const PUBLIC_DOMAIN_DEATH_YEAR_THRESHOLD = 1954;
  return composer.deathYear !== null && composer.deathYear <= PUBLIC_DOMAIN_DEATH_YEAR_THRESHOLD;
};

// Interface for the copyright data structure
export interface CopyrightDetails {
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

const copyrightInfo: { [key: string]: CopyrightDetails } = {
  'saariaho': {
    author: "Ministère de l'Europe et des Affaires étrangères",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kaija_Saariaho_in_2022.png",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  'iannis-xenakis': {
    author: "Les Amis de Xenakis",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:XenakisMDaniel_crop.jpg",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
  },
  'arnold-schoenberg': {
    author: "Man Ray",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Arnold_sch%C3%B6nberg_man_ray.jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
};

// Return CopyrightDetails object or null
export const getCopyrightAttribution = (composerId: string): CopyrightDetails | null => {
  return copyrightInfo[composerId] || null;
};
// --- End Copyright Info ---

// Message interface for chat
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'composer';
  timestamp: number;
}

// Conversation interface for storing in localStorage
export interface Conversation {
  id: string;
  composerId: string;
  messages: Message[];
  lastUpdated: number;
}
