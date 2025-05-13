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
      model: 'gemini-2.0-flash',  // Using the correct model name
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
    const currentYear = new Date().getFullYear();
    const greeting = this.getGreeting(composer.nationality);
    const era = Array.isArray(composer.era) ? composer.era.join(' and ') : composer.era;

    return `You are ${composer.name}, a ${composer.nationality} composer from the ${era} era (${composer.birthYear}-${composer.deathYear || 'present'}).

Your responses should:
- Use a greeting with "${greeting}!" for your first message only.
- Reflect your personality, knowledge, and historical context
- Show deep knowledge of your compositions and musical style
- Reference your famous works: ${composer.famousWorks.join(', ')}
- Include relevant historical context up to ${composer.deathYear || currentYear}
- Italicize musical work titles using *asterisks*
- Be engaging but maintain historical accuracy
- Be 3-5 sentences long, unless a detailed explanation is required
- Draw from your biographical details: ${composer.longBio}

Notable quotes to incorporate naturally:
${composer.notableQuotes.map(quote => `- "${quote}"`).join('\n')}

Remember: You are speaking as ${composer.name} in first person. Maintain your historical perspective and personality throughout the conversation.`;
  }

  public async initializeChat(composer: Composer) {
    this.composer = composer;
    this.chatHistory = [];
    // Future consideration: Load chat history from Firebase here
  }

  public async generateResponse(userMessage: string): Promise<string> {
    if (!this.composer) {
      throw new Error('Chat not initialized with composer');
    }

    try {
      // Add user message to history
      this.chatHistory.push({ role: 'user', text: userMessage });

      // Format the conversation history
      const formattedHistory = this.chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      // Create the chat
      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: DEFAULT_CONFIG,
      });

      // Send the message with the system prompt for the first message,
      // or just the user message for subsequent messages
      const messageToSend = this.chatHistory.length <= 1
        ? `${this.buildSystemPrompt(this.composer)}\n\nUser: ${userMessage}`
        : userMessage;

      console.log('Sending request to Gemini:', {
        messageToSend,
        historyLength: this.chatHistory.length,
        config: DEFAULT_CONFIG
      });

      const result = await chat.sendMessage(messageToSend);

      if (!result.response) {
        throw new Error('Empty response received from Gemini');
      }

      const response = result.response.text();
      console.log('Received response from Gemini:', response);

      // Add response to history
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
        return `${greeting}! I apologize, but I cannot respond at the moment as the API key is missing. Please ensure the VITE_GEMINI_API_KEY environment variable is set.`;
      }

      return `${greeting}! I apologize for the technical difficulty. As ${this.composer.name}, I would be delighted to discuss my work *${this.composer.famousWorks[0]}* or my experiences during the ${era} period. What would you like to know?`;
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

export const geminiService = new GeminiService();
