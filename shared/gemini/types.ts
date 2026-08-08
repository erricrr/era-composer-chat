export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ComposerPayload {
  name: string;
  birthYear: number;
  deathYear: number | null;
  nationality: string;
  era: string | string[];
  location: string;
  famousWorks: string[];
  longBio: string;
  shortBio: string;
  notableQuotes: string[];
}

export interface ChatRequestBody {
  message: string;
  composer: ComposerPayload;
  history: ChatMessage[];
}

export interface ChatResponseBody {
  text: string;
}
