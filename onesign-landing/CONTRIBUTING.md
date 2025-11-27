# Contributing to OneSign Landing Page

Thank you for your interest in contributing to the OneSign Landing Page!

## Development Workflow

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevFrogPlatform/OneSign.git
   cd OneSign/onesign-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - English: http://localhost:3001/en/landing
   - Farsi: http://localhost:3001/fa/landing

### Project Structure

```
onesign-landing/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Internationalized routes
│   │   ├── landing/         # Landing page
│   │   ├── layout.tsx       # Locale layout
│   │   └── page.tsx         # Root redirect
│   ├── api/                 # API routes
│   │   └── health/          # Health check endpoint
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── messages/                 # i18n translations
│   ├── en.json              # English
│   └── fa.json              # Farsi
├── public/                   # Static assets
├── i18n.ts                  # i18n configuration
├── proxy.ts                 # Middleware for i18n
└── next.config.ts           # Next.js configuration
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Avoid using `any` type when possible
- Use proper type definitions

### React Components

- Use functional components with hooks
- Follow React best practices
- Use client components only when necessary
- Prefer server components for static content

### Styling

- Use Tailwind CSS for styling
- Follow responsive design principles
- Support both LTR and RTL layouts
- Maintain consistent spacing and typography

### Code Formatting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Internationalization (i18n)

### Adding New Translations

1. **Add keys to translation files**
   ```json
   // messages/en.json
   {
     "landing": {
       "newFeature": {
         "title": "New Feature",
         "description": "Description here"
       }
     }
   }
   ```

2. **Use translations in components**
   ```tsx
   import { useTranslations } from 'next-intl';

   export default function Component() {
     const t = useTranslations('landing');
     return <h1>{t('newFeature.title')}</h1>;
   }
   ```

### Adding New Locales

1. Update `i18n.ts`:
   ```typescript
   export const locales = ['en', 'fa', 'ar'] as const;
   ```

2. Create new message file:
   ```bash
   touch messages/ar.json
   ```

3. Add translations to the new file

## Testing

### Manual Testing

Before submitting a PR, test:

- [ ] Both English and Farsi versions
- [ ] Desktop and mobile views
- [ ] All interactive elements
- [ ] Navigation and routing
- [ ] RTL layout for Farsi

### Build Testing

```bash
# Test production build
npm run build
npm start

# Verify build output
ls -la .next/
```

## Git Workflow

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Claude branches: `claude/description-sessionId`

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
perf: improve performance
test: add tests
chore: update dependencies
```

### Creating a Pull Request

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

3. **Push to remote**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create PR on GitHub**
   - Provide clear description
   - Reference related issues
   - Add screenshots if UI changes

### PR Checklist

- [ ] Code follows project standards
- [ ] All translations updated
- [ ] Tested on multiple browsers
- [ ] Tested both locales
- [ ] Build passes without errors
- [ ] No console errors or warnings
- [ ] Documentation updated if needed

## Common Tasks

### Adding a New Section

1. **Update translations**
   ```json
   {
     "landing": {
       "newSection": {
         "title": "Title",
         "description": "Description"
       }
     }
   }
   ```

2. **Add component to page**
   ```tsx
   // app/[locale]/landing/page.tsx
   <section className="py-20">
     <h2>{t('newSection.title')}</h2>
     <p>{t('newSection.description')}</p>
   </section>
   ```

3. **Test both locales**

### Updating Styles

1. Use Tailwind classes
2. Ensure responsive design
3. Test RTL layout
4. Maintain consistency

### Performance Optimization

- Use Next.js Image component
- Lazy load components when appropriate
- Optimize bundle size
- Use static generation

## Docker Development

```bash
# Development with hot reload
docker-compose up landing-dev

# Production build
docker-compose up landing

# Rebuild after changes
docker-compose up --build
```

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Translation Issues

- Verify JSON syntax in message files
- Check locale configuration in i18n.ts
- Ensure all keys exist in all locales

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js i18n](https://next-intl-docs.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## Questions?

For questions or help:
- Open an issue on GitHub
- Review existing documentation
- Check Next.js documentation

Thank you for contributing! 🎉
