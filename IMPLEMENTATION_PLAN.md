# Finance Market Dashboard — Implementation Plan

> **Context**: This plan derives from the workshop repository at `/Users/biaohao/Projects/BobL3SDLC/bobl3/Github SDLC Automation`, which contains lab instructions (Part 1 build, Part 2 GitHub automation), CI workflow, PR template, and an example feature request. The application does not yet exist — this plan defines the greenfield build.

---

## 1. Source Folder Structure

```
finance-app/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/           # Button, Card, LoadingSpinner, ErrorMessage, Select
│   │   ├── charts/           # LineChart, AreaChart, SparklineChart, ChartCard
│   │   ├── dashboard/        # CurrentDayView, SevenDayView, QuarterView, CompanySelector, DashboardLayout
│   │   └── index.ts
│   ├── services/
│   │   └── finance/
│   │       ├── yahooFinance.ts   # yahoo-finance2 wrapper
│   │       ├── types.ts          # Quote, HistoryPoint, CompanyConfig
│   │       ├── transformers.ts   # Raw → domain normalization
│   │       ├── cache.ts          # In-memory + localStorage (5 min TTL)
│   │       └── index.ts          # Facade: getQuotes, getHistory, getQuarter
│   ├── hooks/
│   │   ├── useFinanceData.ts     # React Query wrappers
│   │   ├── useTimeWindow.ts      # Window logic
│   │   └── index.ts
│   ├── store/
│   │   ├── financeStore.ts       # Zustand: companies, timeWindow, custom symbols
│   │   └── index.ts
│   ├── utils/
│   │   ├── dateUtils.ts          # Window calculations, formatting
│   │   ├── numberUtils.ts        # Currency, percent, compact formatting
│   │   └── validation.ts         # Ticker regex, normalization
│   ├── constants/
│   │   ├── companies.ts          # Default: IBM, MSFT, ORCL, SAP, CRM
│   │   └── timeWindows.ts        # Enum + labels + date ranges
│   ├── pages/
│   │   └── DashboardPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── unit/
│   │   ├── services/finance.transformers.test.ts
│   │   ├── utils/dateUtils.test.ts
│   │   └── hooks/useFinanceData.test.ts
│   ├── integration/dashboard.render.test.tsx
│   └── e2e/dashboard.cy.ts       # Optional Playwright
├── .github/workflows/finance-app-ci.yml   # Exists
├── .github/PULL_REQUEST_TEMPLATE.md       # Exists
├── docs/pr-feature-request-example.md     # Exists
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── jest.config.ts       # or vitest.config.ts
├── .env.example
└── README.md
```

---

## 2. React Component Boundaries

| Component | Responsibility | Key Props |
|-----------|----------------|-----------|
| `DashboardLayout` | Shell: header, time-window tabs, company selector | `children`, `activeWindow`, `onWindowChange` |
| `CurrentDayView` | Grid of `SummaryCard` per company | `quotes: Quote[]` |
| `SevenDayView` | `ChartCard` per company with 7-day line chart | `historyMap: Map<symbol, HistoryPoint[]>` |
| `QuarterView` | Comparative area chart (all companies) | `quarterMap: Map<symbol, HistoryPoint[]>` |
| `ChartCard` | Title, loading/error, Recharts wrapper | `data`, `title`, `xKey`, `yKeys`, `color` |
| `CompanySelector` | Autocomplete for custom ticker (Part 2) | `onSelect`, `disabled` |
| `SummaryCard` | Static metric: price, change, %change | `quote: Quote` |

**Principle**: Presentational components receive data via props; data fetching in hooks/services; UI state in Zustand.

---

## 3. Data Service Abstractions

```typescript
// types.ts
interface Quote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  longName: string;
  currency: string;
}

interface HistoryPoint {
  date: string;   // ISO
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

interface CompanyConfig {
  symbol: string;
  name: string;
  color: string;
  isPrimary: boolean;   // IBM = true
}

// yahooFinance.ts — thin wrapper over yahoo-finance2
export async function fetchQuote(symbol: string): Promise<Quote>
export async function fetchHistory(symbol: string, period1: Date, period2: Date): Promise<HistoryPoint[]>
export async function fetchQuotes(symbols: string[]): Promise<Quote[]>

// transformers.ts — pure normalization
export function normalizeQuote(raw: any): Quote
export function normalizeHistory(raw: any[]): HistoryPoint[]
export function alignHistoryByDate(histories: Map<string, HistoryPoint[]>): AlignedPoint[]

// cache.ts — 5 min TTL, memory + localStorage
export function getCached<T>(key: string): T | null
export function setCache(key: string, value: any): void
```

**Decisions**:
- `yahoo-finance2` (actively maintained, no API key for basic use)
- Service layer isolates external dependency — UI never imports `yahoo-finance2`
- Transformers handle missing fields, snake_case → camelCase, type coercion
- Cache TTL = 5 min; swap to backend proxy later if CORS blocks browser calls

---

## 4. Charting Approach (Recharts)

| View | Chart Type | Config Notes |
|------|------------|--------------|
| Current Day | Summary cards (KPI tiles) | No chart |
| Last 7 Days | Line chart per company | `type="monotone"`, `dot={false}`, responsive |
| Last Quarter | Area chart (overlaid) | `fill` opacity, shared tooltip |

```tsx
// LineChart.tsx example
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data} margin={{top:10, right:30, left:0, bottom:0}}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#57606a" />
    <YAxis stroke="#57606a" tickFormatter={formatCurrency} />
    <Tooltip formatter={formatCurrency} content={<CustomTooltip />} />
    <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

- Colors from `CompanyConfig.color`
- Disable animations in CI (`isAnimationActive={false}`) for deterministic snapshots

---

## 5. State Management

**Zustand** (UI state) + **TanStack Query** (server state)

```typescript
// store/financeStore.ts
interface FinanceState {
  companies: CompanyConfig[];
  primarySymbol: 'IBM';
  activeTimeWindow: 'day' | '7d' | 'quarter';
  selectedCustomSymbol: string | null;
  setTimeWindow: (w: TimeWindow) => void;
  addCustomCompany: (symbol: string) => Promise<void>;
  removeCustomCompany: (symbol: string) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  companies: DEFAULT_COMPANIES,
  primarySymbol: 'IBM',
  activeTimeWindow: 'day',
  selectedCustomSymbol: null,
  setTimeWindow: (w) => set({ activeTimeWindow: w }),
  addCustomCompany: async (symbol) => { /* validate, fetch, add */ },
  removeCustomCompany: (symbol) => set((s) => ({
    companies: s.companies.filter(c => c.symbol !== symbol)
  })),
}));
```

```typescript
// hooks/useFinanceData.ts
export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['quotes', symbols],
    queryFn: () => financeService.getQuotes(symbols),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHistory(symbol: string, window: TimeWindow) {
  const { period1, period2 } = getDateRange(window);
  return useQuery({
    queryKey: ['history', symbol, window],
    queryFn: () => financeService.getHistory(symbol, period1, period2),
    enabled: !!symbol,
  });
}
```

---

## 6. Error Handling

| Layer | Strategy |
|-------|----------|
| Service | `Result<T, AppError>` — never throw to UI |
| Hook | React Query `onError` → store error; `isError` drives UI |
| Component | `ErrorBoundary` per view; `ErrorMessage` with retry button |
| Network | 10s timeout, 2 retries, exponential backoff |
| Validation | Ticker regex `/^[A-Z]{1,5}$/`; inline error on invalid input |
| Logging | Dev: `console.error`; Prod: Sentry via env flag |

```typescript
export class AppError extends Error {
  constructor(
    public code: 'NETWORK' | 'NOT_FOUND' | 'RATE_LIMIT' | 'PARSE' | 'UNKNOWN',
    message: string,
    public originalError?: Error
  ) { super(message); }
}
```

---

## 7. Test Strategy

| Layer | Tool | Target |
|-------|------|--------|
| Transformers / Utils | Vitest | 100% |
| Hooks | Vitest + React Query Mock | 80% |
| Components | Vitest + React Testing Library | 70% |
| E2E (optional) | Playwright | Smoke tests |

```json
// package.json scripts
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"lint": "eslint src --ext ts,tsx",
"typecheck": "tsc --noEmit",
"build": "vite build",
"preview": "vite preview"
```

**Example**:
```typescript
// tests/unit/services/finance.transformers.test.ts
describe('normalizeQuote', () => {
  it('maps yahoo-finance2 response to domain Quote', () => {
    const raw = { symbol: 'IBM', regularMarketPrice: 150.25, ... };
    const result = normalizeQuote(raw);
    expect(result.symbol).toBe('IBM');
    expect(result.regularMarketPrice).toBe(150.25);
  });
  it('handles missing optional fields', () => {
    const result = normalizeQuote({ symbol: 'IBM' });
    expect(result.regularMarketPrice).toBe(0);
  });
});
```

---

## 8. Local Validation Steps

```bash
# 1. Install
npm install

# 2. Type-check
npm run typecheck

# 3. Lint
npm run lint

# 4. Unit + Integration tests
npm run test

# 5. Coverage (enforce 80% on transformers/utils/hooks)
npm run test:coverage

# 6. Production build
npm run build

# 7. Preview locally
npm run preview
# → http://localhost:4173

# 8. Verify CI (push to feature branch, check Actions tab)
```

**Success Criteria**:
- All type-check, lint, test, build pass
- Coverage ≥ 80% on `transformers/`, `utils/`, `hooks/`
- Dev server loads dashboard with 5 companies × 3 windows
- No console errors in browser devtools

---

## 9. GitHub-Driven Feature Evolution

The repo already scaffolds this workflow:

### Branch Convention
```
feature/initial-finance-dashboard     # Part 1 delivery
feature/user-selected-company-chart   # Part 2 example
bob/auto-<issue-number>-<slug>        # Bob-created branches
```

### PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)
- Summary, Motivation, Change Type, Bob Collaboration Notes, Validation, Issue Alignment

### CI Workflow (`.github/workflows/finance-app-ci.yml`)
- Triggers: push to `main`, `feature/**`, `bob/**`; PR to `main`
- Steps: install → lint → test → build
- Bob validates locally first; CI is the gate

### Bob Collaboration Patterns

| Phase | Bob Action |
|-------|------------|
| Issue Analysis | Fetch issue, parse criteria, map to code areas |
| Planning | Generate implementation plan + file list (`update_todo_list`) |
| Implementation | Write code respecting boundaries (`write_file`, `apply_diff`) |
| Validation | Run full suite (`execute_command`) |
| Review | Analyze diff, find issues (`obtain_git_diff`, `submit_review_findings`) |
| PR Creation | Generate description from diff + context (`generate_description_from_diff`, `create_pull_request`) |

### Extensibility Points

| Future Feature | Extension Point |
|----------------|-----------------|
| User-selected company | `CompanySelector` + `addCustomCompany` in store |
| More competitors | Add to `DEFAULT_COMPANIES` in `constants/companies.ts` |
| New time window (YTD, 1yr) | Extend `TimeWindow` enum + `getDateRange` |
| New chart type | Add `CandlestickChart.tsx` in `components/charts/` |
| Backend proxy for CORS | Swap `yahooFinance.ts` impl; interface unchanged |
| Watchlist / alerts | New slice in Zustand store |
| CSV export | `exportUtils.ts` + button in `ChartCard` |

---

## 10. Recommended Implementation Order

1. **Scaffold**: Vite + React + TS + ESLint + Vitest + Recharts + Zustand + TanStack Query
2. **Constants & Types**: `companies.ts`, `timeWindows.ts`, `finance/types.ts`
3. **Service Layer**: `yahooFinance.ts` → `transformers.ts` → `cache.ts` → `index.ts`
4. **Hooks**: `useFinanceData.ts` (React Query wrappers)
5. **Store**: `financeStore.ts` (Zustand)
6. **UI Primitives**: `Card`, `LoadingSpinner`, `ErrorMessage`, `Select`
7. **Charts**: `LineChart`, `AreaChart`, `ChartCard`
8. **Dashboard Views**: `CurrentDayView`, `SevenDayView`, `QuarterView`, `DashboardLayout`
9. **Page**: `DashboardPage` + `App.tsx`
10. **Tests**: Transformers → Hooks → Component render
11. **Validation**: Full suite, fix, commit
12. **PR**: Bob generates description, pushes `feature/initial-finance-dashboard`

---

## 11. Key Design Principles

| Principle | Application |
|-----------|-------------|
| **Separation of concerns** | Service / Hook / Store / Component layers never cross-import incorrectly |
| **Typed boundaries** | All service returns use `types.ts` interfaces; no `any` in public APIs |
| **Pure transformations** | `transformers.ts` has zero side effects — 100% unit-testable |
| **Cache-first** | 5 min TTL avoids rate limits; `localStorage` survives reloads |
| **Graceful degradation** | Missing data → placeholder cards; network error → retry UI |
| **CI as quality gate** | Every push to feature branch runs lint/test/build |
| **Documented extension points** | Future features map to specific files, not refactors |

---

*Generated from repository analysis of the IBM Bob GitHub SDLC Lab starting point.*