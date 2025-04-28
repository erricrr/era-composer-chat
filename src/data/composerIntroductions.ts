import { Composer } from './composers';

// Function to generate personalized introduction messages for each composer
export const getComposerIntroduction = (composer: Composer): string => {
  const introductions: Record<string, string> = {
    // Baroque composers
    "johann-sebastian-bach": `Welcome to our musical conversation! I am Johann Sebastian Bach, organist, composer, and Kapellmeister. My life was devoted to creating music that glorifies God and elevates the soul. How might I illuminate the Baroque era for you today?`,

    "george-frideric-handel": `Greetings! I am George Frideric Handel, at your service. Though born in Germany, I found my greatest success in London. From royal water parties to grand oratorios, my music aimed to move and inspire. What would you like to discuss about my works or the Baroque period?`,

    "antonio-vivaldi": `Buongiorno! I am Antonio Vivaldi, the "Red Priest" of Venice. While serving at the Ospedale della Pietà, I composed countless concertos and taught violin to orphaned girls. My Four Seasons captured the essence of nature through music. What musical curiosities shall we explore?`,

    // Classical composers
    "wolfgang-amadeus-mozart": `Hello there! Wolfgang Amadeus Mozart at your service. They called me a child prodigy, but I simply lived for music from my earliest days. From the courts of Europe to the theaters of Vienna, music flowed through me like breath itself. What would you like to know about my short but melodious life?`,

    "ludwig-van-beethoven": `Good day. I am Ludwig van Beethoven. Despite the silence that eventually engulfed me, the music in my mind only grew more profound. I broke the chains of musical convention to express the full range of human experience. What aspects of my symphonies or sonatas interest you?`,

    "joseph-haydn": `Greetings! I am Franz Joseph Haydn, often called the "Father of the Symphony." For decades I served the Esterházy family, developing my craft in relative isolation. Through experimentation and wit, I helped establish the Classical style. What would you like to discuss about my music or my influence on Mozart and Beethoven?`,

    // Romantic composers
    "frederic-chopin": `Bonjour! I am Frédéric Chopin, a son of Poland who made Paris my home. Though my body was frail, my devotion to the piano was absolute. In the intimate spaces of Parisian salons, I transformed the piano's voice through nocturnes, mazurkas, and polonaises. How might I illuminate the language of Romantic piano music for you?`,

    "pyotr-ilyich-tchaikovsky": `Greetings! I am Pyotr Ilyich Tchaikovsky. Through my ballets, symphonies, and concertos, I poured out my soul and spoke to the hearts of listeners. Though often tormented by personal struggles, I found beauty in melancholy. What aspects of Russian Romanticism shall we explore?`,

    "johannes-brahms": `Good day. I am Johannes Brahms. Classical form and Romantic expression found balance in my work. Though often seen as Beethoven's successor, I forged my own path with German thoroughness and dedication. What would you like to know about my symphonies, chamber works, or songs?`,

    // Modern composers
    "claude-debussy": `Bonjour! Claude Debussy at your service. They labeled me an "impressionist," but I merely sought to create music that reflected the light, color, and atmosphere of life itself. Through harmony and timbre, I opened doors to new musical worlds. What aspect of my musical language intrigues you?`,

    "igor-stravinsky": `Greetings! Igor Stravinsky here. From the primeval energy of The Rite of Spring to the crisp precision of neoclassicism, my music constantly evolved. I considered myself a musical inventor above all. What period of my long creative journey interests you most?`,

    "philip-glass": `Hello! I'm Philip Glass. Through repetitive structures and gradual transformation, I found a new musical language that connects with audiences across concert halls, opera houses, and film soundtracks. What aspects of minimalism or my approach to composition would you like to explore?`
  };

  // Return composer-specific introduction or fallback to generic one
  return introductions[composer.id] ||
    `Hello, I am ${composer.name}. As a composer of the ${composer.era} era, I created works that reflected the musical aesthetics and cultural context of my time. How may I assist you in learning about my music and life?`;
};
