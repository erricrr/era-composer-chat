[![Netlify Status](https://api.netlify.com/api/v1/badges/cd0a4968-622f-4a4e-aa1f-0dfc4424e202/deploy-status)](https://app.netlify.com/projects/era-composer-chat/deploys)

# Era Composer Chat

After taking an online classical music appreciation course, I found myself with questions. Questions for the deceased composers. For fun, I put together this chat experience with a touch of educational elements. Powered by Gemini (gemini-2.0-flash).

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd era-composer-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:8080`

## Environment Variables

The application requires a Google Gemini API key. The `VITE_` prefix is required by Vite to expose the variable to the frontend:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Note: This is the same API key you get from Google - the `VITE_` prefix is just Vite's naming convention for client-side environment variables.

## Available Scripts

- `npm run dev` - Start development server (runs on port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Google Gemini AI
- React Router
- React Query

## Deployment

The project is deployed on Netlify. For production deployment, ensure your `VITE_GEMINI_API_KEY` environment variable is properly configured in your hosting platform.
