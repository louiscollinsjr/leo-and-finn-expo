# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web

# Lint code
npm run lint
```

### Testing & Running
- No test suite currently configured
- Development is done through Expo's development client
- Use `npx expo start` and test on physical device or simulator

## Project Architecture

### Tech Stack
- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: Expo Router (file-based routing in `app/` directory)
- **Styling**: NativeWind (Tailwind for React Native)
- **Database**: Neon PostgreSQL (migrating away from Supabase)
- **Authentication**: Stack Auth (via `@stackframe/react`)
- **State Management**: React Context (ReaderProvider, StackAuthProvider)
- **Animations**: Reanimated 4 + Skia
- **UI Components**: Bottom Sheet modals, custom themed components

### Application Purpose
Leo & Finn is a language learning app focused on reading comprehension using the Birkenbihl method. The app provides:
- Interactive story reader with word-level interactions
- Multiple reading modes: normal, focused, pronunciation guides, translations
- Customizable reading experience (themes, fonts, spacing, margins)
- Pronunciation rules for Romanian, Romani, and English learners
- Word context overlays with translations and definitions

### Key Architectural Patterns

#### 1. Provider Hierarchy
The app uses nested context providers in `app/_layout.tsx`:
```
GestureHandlerRootView
  → SafeAreaProvider
    → BottomSheetModalProvider
      → StackAuthProvider (auth state)
        → ReaderProvider (reader preferences + UI state)
          → ThemeProvider
            → App content
```

#### 2. Reader System Architecture
The reader is built with a modular block-based system:
- **Blocks** (`types/reader.ts`): Content units (paragraph, heading, chapter) with optional tokens
- **Tokens**: Word-level elements with IDs for tracking interactions
- **BlockRegistry** (`lib/blockRegistry.tsx`): Maps block types to React components
- **InteractiveParagraph** (`components/InteractiveParagraph.tsx`): Efficient word-level hit testing using a single Pressable per paragraph instead of per-word (reduces component count by ~95%)
- **ReaderView** (`components/ReaderView.tsx`): Main reader container with overlay management

#### 3. Database Abstraction
Database access goes through an adapter pattern in `lib/db/`:
- `lib/db/index.ts`: Exports singleton `db` instance
- `lib/db/types.ts`: Defines `DatabaseAdapter` interface
- `lib/db/neon.ts`: Neon PostgreSQL implementation
- `adapters/neon.ts`: Additional database operations

This allows swapping database providers without changing application code.

#### 4. Reading Modes
Four distinct reading modes controlled via ReaderProvider:
- **normal**: Standard reading
- **focused**: Highlights current section
- **pronunciation**: Shows phonetic breakdowns using language-specific rules
- **translations**: Displays word translations inline

Pronunciation rules are in `lib/pronunciation/` organized by language pair (e.g., `ro-en.ts` for Romanian→English learners).

### Directory Structure

```
app/                    # Expo Router screens (file-based routing)
  (tabs)/              # Tab navigation screens (home, browse, library, etc.)
  reader/[storyId].tsx # Dynamic story reader screen
  auth/                # Authentication screens
  _layout.tsx          # Root layout with providers
components/            # React components
  overlays/           # Modal overlays (WordContext, Settings, Theme, etc.)
  ui/                 # Reusable UI components
  InteractiveParagraph.tsx  # Core word-interaction component
  ReaderView.tsx      # Main reader container
  StoryContent.tsx    # Story rendering logic
lib/                   # Business logic and utilities
  db/                 # Database adapters
  pronunciation/      # Language-specific pronunciation rules
  auth.ts             # Legacy auth (being replaced by Stack)
  stack.ts            # Stack Auth implementation
  typography.ts       # Typography constants
  blockRegistry.tsx   # Block renderer registry
providers/            # React Context providers
  ReaderProvider.tsx  # Reader preferences + UI state
  StackAuthProvider.tsx # Authentication state
hooks/                # Custom React hooks
types/                # TypeScript type definitions
constants/            # App constants (colors, mock data)
assets/               # Static assets (fonts, images)
```

### Important Implementation Details

#### Reader State Management
ReaderProvider manages two separate contexts:
1. **ReaderPrefsContext**: Persistent preferences (font scale, theme, typeface, margins, etc.)
2. **ReaderUIContext**: Transient UI state (overlay visibility, word context, reading mode)

Both contexts are consumed via specific hooks:
- `useReaderPrefs()`: Access/modify preferences
- `useReaderUI()`: Access/modify UI state
- `useReaderOverlay()`: Shorthand for overlay visibility

#### Authentication Migration
The app is transitioning from Supabase auth to Stack Auth:
- New code should use `useStackAuth()` from `@/providers/StackAuthProvider`
- Legacy `useAuth()` hook exists for compatibility
- Auth tokens stored in Expo SecureStore via `lib/stack.ts`

#### Theme System
Three theme modes with custom color schemes:
- `system`: Follows device theme
- `light`: Light theme
- `dark`: Dark theme with quiet color palette
- `sepia`: Sepia tones for reading comfort

Theme colors defined in `constants/Colors.ts` as `QuickThemeSwatches`.

#### Performance Optimizations
1. **InteractiveParagraph**: Single Pressable with hit-testing instead of wrapping each word
2. **Text Layout Caching**: Uses `onTextLayout` to cache word positions
3. **Memoization**: Heavy use of `useMemo` and `useCallback` for expensive computations
4. **LogBox Suppressions**: Known harmless warnings from third-party libraries are suppressed in `_layout.tsx`

### Path Aliases
TypeScript paths configured in `tsconfig.json`:
- `@/*` → Project root

Example: `import { db } from '@/lib/db'`

### Environment Variables
Required environment variables in `.env`:
- `EXPO_PUBLIC_DATABASE_URL`: Neon PostgreSQL connection string
- `EXPO_PUBLIC_STACK_PROJECT_ID`: Stack Auth project ID
- `EXPO_PUBLIC_STACK_PUBLISHABLE_KEY`: Stack Auth public key
- `STACK_SECRET_SERVER_KEY`: Stack Auth server key (server-side only)

Note: `EXPO_PUBLIC_*` variables are exposed to client code.

### Common Pitfalls

1. **Font Loading**: App won't render until fonts load. Check `_layout.tsx` for required font files.
2. **Bottom Sheet Warnings**: `@gorhom/bottom-sheet` generates harmless warnings about scrollable nodes - these are suppressed in LogBox.
3. **Word Interactions**: Don't wrap individual words in Pressable - use InteractiveParagraph's hit-testing approach.
4. **Database Adapter**: Always import from `@/lib/db`, not directly from adapters.
5. **Reading Mode**: Changes to reading mode should go through `useReaderUI().setReadingMode()`, not local state.

### Code Style Notes

- TypeScript strict mode enabled
- React 19.1 with new JSX transform
- Prefer functional components with hooks
- Use `ThemedText` and `ThemedView` for consistent theming
- Animation code uses Reanimated's worklets (functions marked for UI thread)
