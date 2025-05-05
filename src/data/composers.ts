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
  Modern = "20th-21st Century"
}

export const eras = [
  {
    id: "baroque",
    name: Era.Baroque,
    period: "1600-1750",
    description: "A period of grandeur and drama in music, known for its intricate polyphony (counterpoint), ornate melodic decorations, use of the basso continuo for harmonic foundation, and the flourishing of opera, concerto, and fugue."
  },
  {
    id: "classical",
    name: Era.Classical,
    period: "1750-1820",
    description: "This era emphasized clarity, balance, elegance, and formal structure, particularly sonata form. It saw the refinement of the symphony, string quartet, and piano sonata, featuring well-defined melodies and clear harmonic progressions."
  },
  {
    id: "romantic",
    name: Era.Romantic,
    period: "1820-1900",
    description: "Characterized by heightened emotional expression, individualism, and often drawing inspiration from literature, nature, and national identity. Music features lyrical melodies, rich and often chromatic harmonies, expanded orchestras, and greater dynamic contrasts."
  },
  {
    id: "modern",
    name: Era.Modern,
    period: "1900-Present",
    description: "A time of immense experimentation and stylistic diversity, challenging traditional tonality and form. Encompasses Impressionism's focus on atmosphere, Neoclassicism's return to earlier forms, the structured atonality of serialism, the repetitive patterns of Minimalism, and the advent of electronic music."
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
