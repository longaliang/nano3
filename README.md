# Nano Banana Image Editor

AI image editor built with Next.js that supports text-to-image and image-to-image generation.

## Requirements

- Node.js 18+
- An OpenRouter API key with access to `google/gemini-3-pro-image-preview`

## Getting Started

```bash
npm install
```

Create `.env.local`:

```bash
OPENROUTER_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GENERATE_TIMEOUT_MS=15000
GENERATE_MAX_CONCURRENT=2
GENERATE_OVERALL_TIMEOUT_MS=15000
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Notes

- `.env.local` is ignored by git. Use `.env.example` as a template.
