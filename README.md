[![Netlify Status](https://api.netlify.com/api/v1/badges/cd0a4968-622f-4a4e-aa1f-0dfc4424e202/deploy-status)](https://app.netlify.com/projects/era-composer-chat/deploys)

# Era Composer Chat

After taking an online classical music appreciation course, I found myself with questions. Questions for the deceased composers. For fun, I put together this chat experience with a touch of educational elements. Powered by Gemini (gemini-3.1-flash-lite).

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) for local API development

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

   Copy `.env.example` to `.env` in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Important:** The Gemini API key must stay server-side. Do **not** use a `VITE_` prefix — Vite embeds those variables in the public browser bundle.

4. **Start the development server**
   ```bash
   npm run dev:full
   ```

   This runs the Vite app and the `/api/chat` Netlify Function together on `http://localhost:8888`.

5. **Open your browser**

   Navigate to `http://localhost:8888`

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | `.env` locally, Netlify env vars in production | Server-only Gemini API key for the chat function |
| `ALLOWED_ORIGINS` | Optional | Comma-separated origins allowed to call `/api/chat` |

In Netlify production, set `GEMINI_API_KEY` under **Site configuration → Environment variables**. Remove any legacy `VITE_GEMINI_API_KEY` variable.

## Available Scripts

- `npm run dev:full` - Start Vite + Netlify Functions (recommended for local chat)
- `npm run dev` - Start Vite only (chat API unavailable unless proxied separately)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Google Gemini AI (via Netlify Function proxy)
- React Router
- React Query

## Deployment

The project is deployed on Netlify.

1. Set `GEMINI_API_KEY` in Netlify environment variables (never `VITE_GEMINI_API_KEY`).
2. Deploy — Gemini calls go through `netlify/functions/chat.ts`, not the browser.
3. After deploying, verify the built JS in `dist/` does not contain your API key.

## Security recovery (if your key was exposed)

If Google suspended your project for abusive API usage:

1. **Revoke the exposed key** in [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Remove `VITE_GEMINI_API_KEY`** from Netlify and redeploy so old bundles are replaced.
3. **Submit a Google Cloud appeal** explaining the key was accidentally embedded in client-side JavaScript and you moved calls server-side.
4. **Create a new restricted API key** after your project is restored and set it as `GEMINI_API_KEY` only.
