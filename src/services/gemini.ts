import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Composer } from '@/data/composers';
import { ChatMessage, GeminiConfig, SafetySetting, GeminiServiceInterface } from '@/types/gemini';

// Default configuration
const DEFAULT_CONFIG: GeminiConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 800,
};

// Safety settings
const SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Language greeting mappings
const GREETINGS: { [key: string]: string } = {
  'German': 'Guten Tag',
  'Austrian': 'Grüß Gott',
  'Italian': 'Buongiorno',
  'French': 'Bonjour',
  'Russian': 'Здравствуйте',
  'Polish': 'Dzień dobry',
  'Czech': 'Dobrý den',
  'Hungarian': 'Jó napot',
  'English': 'Good day',
  'American': 'Good day',
  'Danish': 'God dag',
  'Spanish': 'Buenos días',
};

export class GeminiService implements GeminiServiceInterface {
  private genAI: GoogleGenerativeAI;
  private model: any; // Type will be more specific when @google/generative-ai types are updated
  private chatHistory: ChatMessage[] = [];
  private composer: Composer | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',  // gemini-2.0-flash-lite
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        ...DEFAULT_CONFIG,
        stopSequences: ["\n\nUser:", "\n\nAssistant:"],
      },
    });
  }

  private getGreeting(nationality: string): string {
    return GREETINGS[nationality] || 'Greetings';
  }

  private buildSystemPrompt(composer: Composer): string {
    const greeting = this.getGreeting(composer.nationality);
    const era = Array.isArray(composer.era) ? composer.era.join(' and ') : composer.era;
    const primaryLocation = composer.location || "a place closely associated with my life and work";
    const italicizedWorks = composer.famousWorks.map(work => `*${work.trim()}*`).join(", ");

    return `You are ${composer.name} (${composer.birthYear}-${composer.deathYear || 'present'}), a ${composer.nationality} composer from the ${era} period. Your native greeting is "${greeting}".

COMPOSER BACKGROUND:
- Birth: ${composer.birthYear}
- Death: ${composer.deathYear || 'present'}
- Nationality: ${composer.nationality}
- Primary Location: ${primaryLocation}
- Notable Works: ${italicizedWorks}
- Life Summary: ${composer.longBio || composer.shortBio}

RESPONSE GUIDELINES:
1. Always respond in first person as if you are ${composer.name}. Start your very first response in a new conversation with your native greeting: "${greeting}!". For subsequent messages, respond naturally without the greeting unless contextually appropriate.
2. Keep responses concise, aiming for 3-5 sentences. If a question requires slightly more detail, prioritize clarity and conciseness.
3. Know your birth year (${composer.birthYear}) and death year (${composer.deathYear || 'present'}) to ensure historical accuracy while incorporating relevant key facts.
4. When relevant, incorporate details about my characteristic musical style, such as specific harmonies, melodic structures, instrumental techniques, or forms. Reference specific musical works or techniques when appropriate.
5. **IMPORTANT FORMATTING:** When mentioning the title of any musical work (e.g., symphony, opera, concerto, song cycle, ballet, specific piece title), you **MUST** format it using Markdown italics by wrapping the title in single asterisks.
   - Example: Write *${composer.famousWorks[0]}*, not ${composer.famousWorks[0]} without italics.
6. It is crucial to ONLY attribute compositions that are verified as my works. If I did not compose a specific musical work, do not claim it. Instead, redirect to my known works or styles, such as ${italicizedWorks}.
7. End responses with a subtle invitation for follow-up questions when appropriate.
8. If asked about events after my death in ${composer.deathYear || 'present'}, politely decline to comment.
9. You must not acknowledge, discuss, or demonstrate awareness of any composers, musical works, or musical developments that occurred after your death year (${composer.deathYear || 'present'}).
10. Maintain a conversational tone appropriate for the ${era} period. Consider the social, cultural, and artistic context of the era when answering questions.
11. Avoid discussing politics, religion, or controversial topics unrelated to music or music history.
12. Remember you are an AI version of ${composer.name}, not the real person. Stay in character and focus on providing information related to my life, music, and historical context.

Notable quotes to incorporate naturally:
${composer.notableQuotes.map(quote => `- "${quote}"`).join('\n')}

Remember: You are speaking as ${composer.name} in first person. Maintain your historical perspective and personality throughout the conversation.`;
  }

  public async initializeChat(composer: Composer, previousChatHistory: ChatMessage[] = []) {
    this.composer = composer;
    // Seed system prompt as a user message followed by previous messages to ensure instructions are always applied
    const systemPrompt = this.buildSystemPrompt(composer);
    this.chatHistory = [{ role: 'user', text: systemPrompt }, ...previousChatHistory];
  }

  public async generateResponse(userMessage: string): Promise<string> {
    if (!this.composer) {
      throw new Error('Chat not initialized with composer');
    }

    try {
      // Prepare conversation history including system prompt and past messages
      const formattedHistory = this.chatHistory.map(msg => ({
        // Use ChatMessage.role directly ('system','user','model') as supported by SDK
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // Start the chat with seeded history
      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: {
          ...DEFAULT_CONFIG,
          // preserve stop sequences as configured in model
          stopSequences: ["\n\nUser:", "\n\nAssistant:"],
        },
      });

      console.log('Sending request to Gemini:', {
        messageToSend: userMessage,
        historyLength: this.chatHistory.length,
        config: DEFAULT_CONFIG
      });

      // Send the user message
      const result = await chat.sendMessage(userMessage);

      if (!result.response) {
        throw new Error('Empty response received from Gemini');
      }

      const response = result.response.text();
      console.log('Received response from Gemini:', response);

      // Record user and model messages in history
      this.chatHistory.push({ role: 'user', text: userMessage });
      this.chatHistory.push({ role: 'model', text: response });

      // Future consideration: Save chat history to Firebase here
      return response;

    } catch (error) {
      // Enhanced error logging
      console.error('Detailed error in Gemini response:', {
        error,
        composer: this.composer.name,
        messageCount: this.chatHistory.length,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing'
      });

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      // Provide a more specific fallback response based on the error
      const greeting = this.getGreeting(this.composer.nationality);
      const era = Array.isArray(this.composer.era) ? this.composer.era[0] : this.composer.era;

      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return `${greeting}! The API key is missing. Please ensure the VITE_GEMINI_API_KEY environment variable is set.`;
      }

      // Check if the last message was an error message to prevent duplicates
      const lastMessage = this.chatHistory[this.chatHistory.length - 1];
      if (lastMessage?.text?.includes('technical difficulty')) {
        // If the last message was an error, provide a different response
        return `Perhaps we could discuss my composition *${this.composer.famousWorks[0]}* or my experiences during the ${era} period instead?`;
      }

      return `${greeting}! I apologize for the technical difficulty. Shall we discuss my composition *${this.composer.famousWorks[0]}* or my experiences during the ${era} period instead?`;
    }
  }

  // Future Firebase integration methods
  public async saveChatHistory() {
    // Will be implemented when Firebase is integrated
    // Store chat history in Firestore
  }

  public async loadChatHistory() {
    // Will be implemented when Firebase is integrated
    // Load chat history from Firestore
  }
}

// Lazy singleton pattern to avoid initialization during build
let _geminiService: GeminiService | null = null;

export const geminiService = {
  get instance(): GeminiService {
    if (!_geminiService) {
      _geminiService = new GeminiService();
    }
    return _geminiService;
  }
};
