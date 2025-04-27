export interface Composer {
  id: string;
  name: string;
  era: Era;
  years: string;
  country: string;
  bio: string;
  image: string;
  famousWorks: string[];
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

// Sample placeholder data until we integrate with Wikipedia API
export const composers: Composer[] = [
  // Baroque Era
  {
    id: "bach",
    name: "Johann Sebastian Bach",
    era: Era.Baroque,
    years: "1685-1750",
    country: "Germany",
    bio: "Bach was a German composer and musician of the Baroque period. He is known for instrumental compositions such as the Brandenburg Concertos and the Goldberg Variations, and for vocal music such as the St Matthew Passion and the Mass in B minor.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Johann_Sebastian_Bach.jpg",
    famousWorks: ["Brandenburg Concertos", "The Well-Tempered Clavier", "St. Matthew Passion"]
  },
  {
    id: "handel",
    name: "George Frideric Handel",
    era: Era.Baroque,
    years: "1685-1759",
    country: "Germany/England",
    bio: "Handel was a German-British Baroque composer well known for his operas, oratorios, anthems, concerti grossi, and organ concertos. His most famous work is the oratorio Messiah with its 'Hallelujah' chorus.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/George_Frideric_Handel_by_Balthasar_Denner.jpg",
    famousWorks: ["Messiah", "Water Music", "Music for the Royal Fireworks"]
  },
  {
    id: "vivaldi",
    name: "Antonio Vivaldi",
    era: Era.Baroque,
    years: "1678-1741",
    country: "Italy",
    bio: "Vivaldi was an Italian Baroque composer, virtuoso violinist, teacher, and cleric. He is known mainly for composing many instrumental concertos, especially for the violin, as well as sacred choral works and more than forty operas.",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Vivaldi.jpg",
    famousWorks: ["The Four Seasons", "Gloria", "L'Olimpiade"]
  },

  // Classical Era
  {
    id: "mozart",
    name: "Wolfgang Amadeus Mozart",
    era: Era.Classical,
    years: "1756-1791",
    country: "Austria",
    bio: "Mozart was a prolific and influential composer of the Classical era. Born in Salzburg, he showed prodigious ability from his earliest childhood. Already competent on keyboard and violin, he composed from the age of five and performed before European royalty.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/47/Croce-Mozart-Detail.jpg",
    famousWorks: ["The Magic Flute", "Symphony No. 40", "Requiem"]
  },
  {
    id: "beethoven",
    name: "Ludwig van Beethoven",
    era: Era.Classical,
    years: "1770-1827",
    country: "Germany",
    bio: "Beethoven was a German composer and pianist. He was a crucial figure in the transition between the Classical and Romantic eras in Western art music. He remains one of the most famous and influential of all composers.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Beethoven.jpg",
    famousWorks: ["Symphony No. 5", "Symphony No. 9", "Moonlight Sonata"]
  },
  {
    id: "haydn",
    name: "Joseph Haydn",
    era: Era.Classical,
    years: "1732-1809",
    country: "Austria",
    bio: "Haydn was an Austrian composer of the Classical period. He was instrumental in the development of chamber music such as the piano trio. His contributions to musical form have earned him the epithets 'Father of the Symphony' and 'Father of the String Quartet'.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Joseph_Haydn.jpg",
    famousWorks: ["The Creation", "Symphony No. 94 (Surprise)", "String Quartets Op. 76"]
  },

  // Romantic Era
  {
    id: "chopin",
    name: "Frédéric Chopin",
    era: Era.Romantic,
    years: "1810-1849",
    country: "Poland/France",
    bio: "Chopin was a Polish composer and virtuoso pianist of the Romantic era who wrote primarily for solo piano. He has maintained worldwide renown as a leading musician of his era, one whose 'poetic genius was based on a professional technique that was without equal in his generation.'",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Frederic_Chopin_photo.jpeg",
    famousWorks: ["Nocturnes", "Preludes", "Polonaises"]
  },
  {
    id: "tchaikovsky",
    name: "Pyotr Ilyich Tchaikovsky",
    era: Era.Romantic,
    years: "1840-1893",
    country: "Russia",
    bio: "Tchaikovsky was a Russian composer of the Romantic period. He was the first Russian composer whose music made a lasting impression internationally. He was honored in 1884 by Tsar Alexander III and awarded a lifetime pension.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Portr%C3%A4t_des_Komponisten_Pjotr_I._Tschaikowski_%281840-1893%29.jpg",
    famousWorks: ["Swan Lake", "The Nutcracker", "Symphony No. 6 (Pathétique)"]
  },
  {
    id: "brahms",
    name: "Johannes Brahms",
    era: Era.Romantic,
    years: "1833-1897",
    country: "Germany",
    bio: "Brahms was a German composer, pianist, and conductor of the Romantic period. Born in Hamburg into a Lutheran family, Brahms spent much of his professional life in Vienna, Austria. His reputation and status as a composer are such that he is sometimes grouped with Bach and Beethoven as one of the 'Three Bs' of music.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/15/JohannesBrahms.jpg",
    famousWorks: ["Symphony No. 4", "Ein deutsches Requiem", "Hungarian Dances"]
  },

  // Modern Era
  {
    id: "debussy",
    name: "Claude Debussy",
    era: Era.Modern,
    years: "1862-1918",
    country: "France",
    bio: "Debussy was a French composer. He is sometimes seen as the first Impressionist composer, although he vigorously rejected the term. He was among the most influential composers of the late 19th and early 20th centuries.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Claude_Debussy_ca_1908%2C_foto_av_F%C3%A9lix_Nadar.jpg",
    famousWorks: ["Clair de Lune", "Prélude à l'après-midi d'un faune", "La Mer"]
  },
  {
    id: "stravinsky",
    name: "Igor Stravinsky",
    era: Era.Modern,
    years: "1882-1971",
    country: "Russia/France/USA",
    bio: "Stravinsky was a Russian composer, pianist, and conductor, later of French and American citizenship. He is widely considered one of the most important and influential composers of the 20th century and a pivotal figure in modernist music.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/28/Igor_Stravinsky_LOC_37093u.jpg",
    famousWorks: ["The Rite of Spring", "The Firebird", "Petrushka"]
  },
  {
    id: "glass",
    name: "Philip Glass",
    era: Era.Modern,
    years: "1937-present",
    country: "USA",
    bio: "Glass is an American composer and pianist. He is widely regarded as one of the most influential composers of the late 20th century. Glass's work has been associated with minimalism, being built up from repetitive phrases and shifting layers.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Philip_Glass_by_Pasquale_Salerno.jpg",
    famousWorks: ["Einstein on the Beach", "Glassworks", "Koyaanisqatsi"]
  }
];

// Function to get composers by era
export const getComposersByEra = (era: Era): Composer[] => {
  return composers.filter(composer => composer.era === era);
};

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
