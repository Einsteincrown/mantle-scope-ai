

# MantleScope — Full Build with Ecosystem Explorer

Since no previous code was persisted, this plan builds the complete MantleScope app from scratch: theme, landing page, AI chat, wallet analysis, token research, and the new Ecosystem Explorer.

## Files to Create/Modify

### 1. Theme (`src/index.css`)
Replace `:root` with Mantle dark theme as default (no light mode):
- `--background`: `0 0% 0%` (#000000)
- `--card`: `0 0% 6.7%` (#111111)
- `--primary`: `160 100% 41.4%` (#00D395)
- `--foreground`: `0 0% 100%` (#FFFFFF)
- `--muted-foreground`: desaturated gray
- `--border`: dark gray

### 2. Navbar (`src/components/Navbar.tsx`)
- MantleScope logo/text, nav links: Chat, Wallet, Research, Ecosystem
- Green accent on active link

### 3. Landing Page (`src/pages/Index.tsx`)
- Hero with tagline "Research Smarter. Trade Safer. Powered by AI on Mantle."
- Smart search input: `0x...` → `/wallet/:address`, else → `/research?q=...`
- Feature cards (4), footer

### 4. AI Chat (`src/pages/Chat.tsx`)
- Streaming chat with message bubbles (user: green, AI: #111111)
- Markdown rendering via `react-markdown`, typing indicator
- Components: `ChatMessage.tsx`, `TypingIndicator.tsx`

### 5. Wallet Analysis (`src/pages/WalletAnalysis.tsx`)
- Fetches balance + tx count from `https://rpc.mantle.xyz` via JSON-RPC
- Profile card with stats, AI-generated risk score (1-10) with colored badge
- Helper: `src/lib/mantleRpc.ts`

### 6. Token Research (`src/pages/Research.tsx`)
- Search bar, two-column layout: AI research summary (left) + Quick Stats sidebar (right)
- Streams AI response for token/protocol analysis

### 7. Ecosystem Explorer (`src/pages/Ecosystem.tsx`) — NEW
- Header with title "Mantle Ecosystem" and subtitle
- Category filter bar: All, DeFi, Gaming, NFT, Infrastructure (horizontal pills, green when active)
- Responsive grid of project cards from static JSON data (`src/data/ecosystem.json`)
- Each card (#111111 surface): project name, short description, category badges (colored pills), TVL/users placeholder stats
- Clicking a card opens a dialog/modal with AI-generated summary of that project (streamed from edge function)
- Search/filter bar to filter projects by name
- ~20-25 real Mantle ecosystem projects in the JSON (Agni, Merchant Moe, Lendle, Treehouse, iZUMi, Butter.xyz, etc.)

### 8. Static Data (`src/data/ecosystem.json`)
```json
[
  {
    "id": "agni-finance",
    "name": "Agni Finance",
    "description": "Concentrated liquidity DEX on Mantle",
    "category": "DeFi",
    "subcategory": "DEX",
    "website": "https://agni.finance",
    "contractAddress": "0x...",
    "tvl": "$45M",
    "users": "12K"
  },
  ...
]
```

### 9. Edge Function (`supabase/functions/chat/index.ts`)
- Proxies to Lovable AI Gateway (Gemini Flash) via `LOVABLE_API_KEY`
- Accepts `mode`: `chat`, `wallet-risk`, `research`, `ecosystem-summary`
- Streaming SSE responses
- CORS headers included

### 10. Streaming Utility (`src/lib/streamChat.ts`)
- SSE parser with `onDelta` callback for progressive rendering

### 11. Routing (`src/App.tsx`)
- `/` → Index, `/chat` → Chat, `/wallet/:address` → WalletAnalysis, `/research` → Research, `/ecosystem` → Ecosystem

### 12. Dependencies
- Add `react-markdown` for AI response rendering

## Ecosystem Explorer Detail

The explorer page flow:
1. User sees grid of Mantle projects with category filters
2. Typing in search filters cards by name
3. Clicking category pills filters by category
4. Clicking a card opens a dialog with loading skeleton
5. Edge function generates AI summary (what it is, key features, risks, how it fits in Mantle ecosystem)
6. Summary streams into the dialog with markdown rendering

