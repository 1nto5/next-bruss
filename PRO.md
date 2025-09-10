# PRO.md - Production Floor Applications

This file provides guidance for developing Production Floor Applications in the Next-Bruss codebase.

## Overview

Production Floor Applications are touchscreen-optimized interfaces for factory floor operations, located in `app/(pro)/[lang]/` directories. **dmcheck-2** serves as the reference implementation for all new Pro applications.

## Application Characteristics

- **Minimal UI**: Essential information only
- **Multi-language**: Support for 6 locales with Polish as default
- **Offline-capable**: Local state persistence via Zustand
- **Real-time**: WebSocket connections for live data updates
- **Audio feedback**: Volume controls for scan confirmations

## Architecture Pattern

### Three-Layer Structure

```typescript
// 1. Page component: app/(pro)/[lang]/app-name/page.tsx
export default async function AppPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <App dict={dict} lang={lang} />;
}

// 2. Layout component: app/(pro)/[lang]/app-name/layout.tsx
export default async function AppLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const { children } = props;
  const dict = await getDictionary(lang);

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Providers>
        <ProLayout header={<Header lang={lang} dict={dict} />}>
          {children}
        </ProLayout>
      </Providers>
    </ThemeProvider>
  );
}

// 3. App component: app/(pro)/[lang]/app-name/components/app.tsx
export default function App({ dict, lang }: AppProps) {
  // Client-side logic, authentication, state management
  // Article selection, scanning workflow, etc.
}
```

## State Management (Zustand Pattern)

Pro apps use a three-store pattern with persist middleware:

```typescript
// Pattern: app/(pro)/[lang]/app-name/lib/stores.ts

// 1. Operator Store - Multi-operator authentication
export const useOperatorStore = create<OperatorStoreType>()(
  persist(
    (set) => ({
      operator1: null,
      operator2: null,
      operator3: null,
      setOperator1: (operator) => set({ operator1: operator }),
      setOperator2: (operator) => set({ operator2: operator }),
      setOperator3: (operator) => set({ operator3: operator }),
      logout: () => set({ operator1: null, operator2: null, operator3: null }),
    }),
    { name: 'appname-operators' },
  ),
);

// 2. Application Store - Core functionality state
export const useScanStore = create<ScanStoreType>()(
  persist(
    (set) => ({
      selectedArticle: null,
      lastScans: [],
      boxStatus: { piecesInBox: 0, boxIsFull: false },
      palletStatus: { boxesOnPallet: 0, palletIsFull: false },
      setSelectedArticle: (article) => set({
        selectedArticle: article,
        lastScans: [],
        boxStatus: { piecesInBox: 0, boxIsFull: false },
        palletStatus: { boxesOnPallet: 0, palletIsFull: false },
      }),
      addScan: (dmc) => set((state) => ({
        lastScans: [
          { dmc, time: new Date() },
          ...state.lastScans.slice(0, 4), // Keep only last 5
        ],
      })),
      clearArticle: () => set({
        selectedArticle: null,
        lastScans: [],
        boxStatus: { piecesInBox: 0, boxIsFull: false },
        palletStatus: { boxesOnPallet: 0, palletIsFull: false },
      }),
      // ... other actions
    }),
    { name: 'appname-scans' },
  ),
);

// 3. Volume Store - Audio feedback controls
export const useVolumeStore = create<VolumeStoreType>()(
  persist(
    (set) => ({
      volume: 0.75,
      setVolume: (volume) => set({ volume }),
    }),
    { name: 'appname-volume' },
  ),
);
```

## Component Library

### Authentication

- **LoginWithKeypad**: Standard keypad-based authentication for Pro apps

### Header Components

```typescript
import { Header, HeaderButton, HeaderBadge } from '@/app/(pro)/components/header-layout';

// HeaderButton supports icon-only or icon+text modes
<HeaderButton
  icon={<Component />}
  onClick={handleClick}
  title="Tooltip text"
  text="Button label" // Optional - shows text next to icon
/>
```

### Standard Components

- `ProLayout`: Wrapper for consistent Pro app structure
- `LanguageSwitcher`: Language selection for i18n
- `ThemeToggle`: Dark/light mode switching
- `VolumeControl`: Audio feedback controls

## Data Fetching with React Query

Pro apps use React Query exclusively for data synchronization:

```typescript
// Pattern: app/(pro)/[lang]/app-name/data/get-*.ts
export function useGetArticles(workplace: string | null) {
  return useQuery({
    queryFn: async () => {
      if (!workplace) return [];
      return getArticlesForWorkplace(workplace);
    },
    queryKey: ['articles', workplace],
    enabled: !!workplace,
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
    refetchOnMount: true, // Always fetch fresh on mount
  });
}

export function useGetBoxStatus(articleId: string | undefined) {
  return useQuery({
    queryFn: async () => {
      if (!articleId) return { piecesInBox: 0, boxIsFull: false };
      return getInBoxTableData(articleId);
    },
    queryKey: ['box-status', articleId],
    enabled: !!articleId,
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}
```

### Manual Refetch Pattern

After mutations, manually refetch affected queries:

```typescript
// Usage in components with manual refetch
const {
  data: boxStatus = { piecesInBox: 0, boxIsFull: false },
  refetch: refetchBoxStatus,
} = useGetBoxStatus(selectedArticle?.id);

const {
  data: palletStatus = { boxesOnPallet: 0, palletIsFull: false },
  refetch: refetchPalletStatus,
} = useGetPalletStatus(selectedArticle?.id, selectedArticle?.pallet || false);

// Refetch after successful mutations
const handleDmcScan = useCallback(async () => {
  const result = await saveDmc(dmcValue, selectedArticle.id, operators);

  if (result.message === 'dmc saved') {
    playOk();
    if (result.dmc) {
      addScan(result.dmc);
    }
    // Manual refetch to update UI
    await refetchBoxStatus();
    return dict.scan.messages.dmcSaved;
  } else {
    playNok();
    throw new Error(errorMessages[result.message]);
  }
}, [dmcValue, selectedArticle, operators, refetchBoxStatus]);
```

## Server Actions Pattern

Server actions perform database operations and return simple result objects:

```typescript
'use server';
import { dbc } from '@/lib/mongo';
import pgp from '@/lib/pg';
import { ObjectId } from 'mongodb';

export async function saveDmc(
  dmc: string,
  articleConfigId: string,
  operators: string[]
): Promise<{ message: string; dmc?: string; time?: string }> {
  try {
    // 1. Get article configuration
    const articlesConfigCollection = await dbc('articles_config');
    const articleConfigDoc = await articlesConfigCollection.findOne({
      _id: new ObjectId(articleConfigId),
    });
    if (!articleConfigDoc) {
      return { message: 'article not found' };
    }

    // 2. Validate DMC format using Zod schema
    const schema = createDmcValidationSchema(articleConfig);
    const parse = schema.safeParse({ dmc });
    if (!parse.success) {
      return { message: 'dmc not valid' };
    }

    // 3. Customer-specific validations
    if (articleConfig.bmw && !bmwDateValidation(dmc)) {
      return { message: 'bmw date not valid' };
    }
    if (articleConfig.ford && !fordDateValidation(dmc)) {
      return { message: 'ford date not valid' };
    }

    // 4. External API integration (SMART, PostgreSQL)
    if (articleConfig.workplace === 'eol810') {
      const url = `http://10.27.90.4:8025/api/part-status-plain/${dmc}`;
      const res = await fetch(url);
      if (!res.ok) {
        return { message: 'smart fetch error' };
      }
      const data = await res.text();
      if (data === 'NOK') {
        return { message: 'smart nok' };
      }
    }

    // 5. Database operations
    const scansCollection = await dbc('scans');
    const insertResult = await scansCollection.insertOne({
      status: 'box',
      dmc: dmc.toUpperCase(),
      workplace: articleConfig.workplace,
      article: articleConfig.articleNumber,
      operator: operators[0],
      time: new Date(),
    });

    if (insertResult) {
      return { message: 'dmc saved', dmc, time: new Date().toISOString() };
    }
    return { message: 'save error' };
  } catch (error) {
    console.error(error);
    return { message: 'save error' };
  }
}
```

## Toast Notifications with Promise Handling

Use toast.promise for user feedback during mutations:

```typescript
import { toast } from 'sonner';

const handleScan = useCallback(async () => {
  toast.promise(
    async () => {
      const result = await saveDmc(dmcValue, selectedArticle.id, operators);

      if (result.message === 'dmc saved') {
        playOk();
        if (result.dmc) {
          addScan(result.dmc);
        }
        await refetchBoxStatus();
        return dict.scan.messages.dmcSaved;
      } else {
        playNok();
        const errorMessages: Record<string, string> = {
          'dmc exists': dict.scan.messages.dmcExists,
          'dmc not valid': dict.scan.messages.dmcNotValid,
          'ford date not valid': dict.scan.messages.fordDateNotValid,
          // ... other error mappings
        };
        throw new Error(errorMessages[result.message] || dict.scan.messages.saveError);
      }
    },
    {
      loading: dict.scan.savingPlaceholder || 'Saving...',
      success: (msg) => msg,
      error: (err) => err.message || 'Error occurred',
    },
  );
}, [dmcValue, selectedArticle, operators, refetchBoxStatus]);
```

## Internationalization

### Dictionary Loading (Server-Only)

```typescript
// app/(pro)/[lang]/app-name/lib/dictionary.ts
import 'server-only';

const dictionaries = {
  pl: () => import('@/app/dictionaries/app-name/pl.json').then((module) => module.default),
  en: () => import('@/app/dictionaries/app-name/en.json').then((module) => module.default),
  de: () => import('@/app/dictionaries/app-name/de.json').then((module) => module.default),
  tl: () => import('@/app/dictionaries/app-name/tl.json').then((module) => module.default),
  uk: () => import('@/app/dictionaries/app-name/uk.json').then((module) => module.default),
  be: () => import('@/app/dictionaries/app-name/be.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (locale === 'en') return dictionaries.en();
  if (locale === 'de') return dictionaries.de();
  if (locale === 'tl') return dictionaries.tl();
  if (locale === 'uk') return dictionaries.uk();
  if (locale === 'be') return dictionaries.be();
  return dictionaries.pl(); // Polish fallback
};
```

### Dictionary Structure

```json
{
  "login": {
    "title": "Login - App Name",
    "operator1Label": "Personal number 1",
    "operator2Label": "Operator 2",
    "operator3Label": "Operator 3",
    "personalNumber2Label": "Personal number 2",
    "personalNumber3Label": "Personal number 3",
    "placeholder": "touch to enter...",
    "loginButton": "Login",
    "clearButton": "Clear",
    "keypadTitle": "Enter operator personal number",
    "errors": {
      "wrongNumber1": "Invalid personal number!",
      "wrongNumber2": "Invalid personal number!",
      "wrongNumber3": "Invalid personal number!",
      "loginError": "Contact IT!"
    }
  },
  "scan": {
    "title": "Scanning",
    "dmcPlaceholder": "Scan DMC...",
    "hydraPlaceholder": "Scan HYDRA QR code...",
    "palletPlaceholder": "Scan pallet QR code...",
    "savingPlaceholder": "Saving...",
    "messages": {
      "dmcSaved": "DMC saved",
      "batchSaved": "Batch saved",
      "dmcExists": "DMC already exists",
      "batchExists": "Batch already exists",
      "dmcNotValid": "DMC invalid",
      "qrNotValid": "Invalid QR code - check format",
      "articleNotFound": "Article not found",
      "fordDateNotValid": "FORD date invalid",
      "bmwDateNotValid": "BMW date invalid",
      "saveError": "Save error"
    }
  },
  "logout": {
    "clearArticle": "Change article",
    "logoutOperators": "Logout"
  }
}
```

## Audio Feedback Integration

```typescript
import useSound from 'use-sound';
import { useVolumeStore } from '@/app/(pro)/components/volume-control';

export default function ScanPanel() {
  const { volume } = useVolumeStore();

  const [playOk] = useSound('/ok.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });

  const handleScanResult = (result: ScanResult) => {
    if (result.message === 'dmc saved') {
      playOk();
    } else {
      playNok();
    }
  };
}
```

## Validation Patterns

### QR Code Validation (Hydra)

```typescript
function extractQrValues(hydra: string) {
  const qrArticleMatch = hydra.match(/A:([^|]+)/);
  const qrQuantityMatch = hydra.match(/Q:([^|]+)/);
  const qrBatchMatch = hydra.match(/B:([^|]+)/);

  const qrArticle = qrArticleMatch ? qrArticleMatch[1].trim() : '';
  const qrQuantity = qrQuantityMatch ? parseInt(qrQuantityMatch[1], 10) : 0;
  const qrBatch = qrBatchMatch ? qrBatchMatch[1].trim() : '';

  if (!qrArticle || !qrBatch || isNaN(qrQuantity) || qrQuantity <= 0) {
    return { qrArticle: '', qrQuantity: 0, qrBatch: '' };
  }

  return { qrArticle, qrQuantity, qrBatch };
}
```

### Customer-Specific Date Validations

```typescript
// FORD DATE VALIDATION
function fordDateValidation(dmc: string) {
  const today = new Date();
  const year = today.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dotyGreg = Math.floor(diff / oneDay);
  const dotyJul = dotyGreg > 13 ? dotyGreg - 13 : 365 - 13 + dotyGreg;
  const dmcDotyJul = parseInt(dmc.substring(7, 10));
  return dmcDotyJul >= dotyJul - 7;
}

// BMW DATE VALIDATION
function bmwDateValidation(dmc: string) {
  const today = new Date();
  const dmcDate = parseInt(dmc.slice(17, 23));

  // Check last 30 days
  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const checkDateFormatted = parseInt(
      checkDate.toISOString().slice(2, 10).split('-').join(''),
    );
    if (dmcDate === checkDateFormatted) {
      return true;
    }
  }

  // Check tomorrow
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDate = parseInt(
    tomorrow.toISOString().slice(2, 10).split('-').join(''),
  );
  return dmcDate === tomorrowDate;
}
```

## Development Guidelines

1. **Reference Implementation**: Use dmcheck-2 patterns for all new Pro applications
2. **Data Flow**: Server Action → Result → Manual refetch → UI Update
3. **State Persistence**: Always use Zustand with persist middleware for offline capability
4. **Authentication**: Multi-operator support (up to 3) via LoginWithKeypad
5. **Data Synchronization**: React Query with manual refetch after mutations
6. **Error Handling**: Return `{ message: string }` from server actions, map to dictionary messages
7. **User Feedback**: Use toast.promise for mutation feedback with audio cues
8. **External APIs**: Handle timeouts and connection errors gracefully
9. **Archive Data**: Always check both main and archive collections
10. **Button Text**: Keep concise for Pro apps (e.g., "Change article" not "Logout article")
