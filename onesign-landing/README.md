# OneSign Landing Page

This is the standalone landing page for OneSign - an enterprise Identity & Access Management platform.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

The landing page supports internationalization (i18n) with English and Farsi/Persian languages.

## Features

- Built with Next.js 16
- Internationalization with next-intl
- Tailwind CSS for styling
- TypeScript support
- Responsive design
- SEO optimized

## Build

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
onesign-landing/
├── app/
│   ├── [locale]/
│   │   └── landing/
│   │       └── page.tsx      # Main landing page
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── messages/
│   ├── en.json                # English translations
│   └── fa.json                # Farsi translations
├── public/                    # Static assets
├── i18n.ts                    # i18n configuration
└── next.config.ts             # Next.js configuration
```
