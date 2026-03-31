import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Wallet, FlaskConical, Globe } from "lucide-react";

const features = [
  { icon: Wallet, title: "Wallet Analysis", desc: "Paste any address for on-chain stats, token holdings, and AI-powered risk scoring." },
  { icon: FlaskConical, title: "Token Research", desc: "Deep-dive research on any token or DeFi protocol with AI-generated insights." },
  { icon: Globe, title: "Ecosystem Explorer", desc: "Browse the full Mantle ecosystem directory — DeFi, Gaming, NFTs, and more." },
];

const navCards = [
  { icon: MessageSquare, title: "AI Chat", desc: "Ask anything about Mantle — protocols, tokens, strategies.", link: "/chat" },
  { icon: Wallet, title: "Wallet Analysis", desc: "Paste any address for on-chain stats and AI risk scoring.", link: "/wallet" },
  { icon: FlaskConical, title: "Token Research", desc: "Deep-dive research on any token or DeFi protocol.", link: "/research" },
  { icon: Globe, title: "Ecosystem Explorer", desc: "Browse the full Mantle ecosystem directory.", link: "/ecosystem" },
];

export default function Index() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      navigate(`/wallet/${q}`);
    } else {
      navigate(`/research?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4">
        {/* Hero */}
        <section className="flex flex-col items-center py-24 pb-32 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Research Smarter. Trade Safer.{" "}
            <span className="text-primary">Powered by AI on Mantle.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Your all-in-one AI research hub for the Mantle blockchain — analyze wallets, explore protocols, and chat with on-chain data.
          </p>

          {/* Badges */}
          <div className="mt-5 flex gap-3">
            <Badge variant="outline" className="border-primary/60 bg-card text-foreground px-3 py-1 text-xs">
              Powered by Claude AI
            </Badge>
            <Badge variant="outline" className="border-primary/60 bg-card text-foreground px-3 py-1 text-xs">
              Built on Mantle
            </Badge>
          </div>

          <div className="mt-10 flex w-full max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search token, protocol, or paste a wallet address..."
                className="pl-10 bg-card border-border/60 focus-visible:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Feature Highlight Cards */}
          <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/50 bg-card p-6 text-left"
              >
                <f.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {navCards.map((f) => (
            <button
              key={f.title}
              onClick={() => navigate(f.link)}
              className="group rounded-xl border border-border/50 bg-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-[0_0_24px_-6px_hsl(160,100%,41.4%,0.15)]"
            >
              <f.icon className="mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}