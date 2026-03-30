import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Copy, Check } from "lucide-react";
import { getBalance, getTransactionCount } from "@/lib/mantleRpc";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface WalletData {
  balance: string;
  txCount: number;
}

interface RiskData {
  score: number;
  explanation: string;
}

export default function WalletAnalysis() {
  const { address } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [riskText, setRiskText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    const q = search.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) navigate(`/wallet/${q}`);
  };

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setWallet(null);
    setRisk(null);
    setRiskText("");

    Promise.all([getBalance(address), getTransactionCount(address)])
      .then(([balance, txCount]) => {
        setWallet({ balance, txCount });
        setLoading(false);

        // Fetch risk score
        let acc = "";
        streamChat({
          messages: [{ role: "user", content: `Analyze this Mantle wallet and provide a risk score 1-10 with explanation.\nAddress: ${address}\nBalance: ${balance} MNT\nTransactions: ${txCount}\n\nRespond with a number score on the first line, then explanation.` }],
          mode: "wallet-risk",
          onDelta: (d) => { acc += d; setRiskText(acc); },
          onDone: () => {
            const scoreMatch = acc.match(/(\d+)/);
            const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5;
            setRisk({ score, explanation: acc });
          },
        }).catch((e: any) => toast({ title: "Risk Error", description: e.message, variant: "destructive" }));
      })
      .catch((e: any) => {
        toast({ title: "RPC Error", description: e.message, variant: "destructive" });
        setLoading(false);
      });
  }, [address]);

  const riskColor = (s: number) => (s <= 3 ? "bg-[hsl(160,100%,41.4%)] text-black" : s <= 6 ? "bg-yellow-500 text-black" : "bg-red-500 text-white");
  const truncate = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  const copyAddr = () => {
    if (address) navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {!address && (
          <div className="flex flex-col items-center py-20 text-center">
            <h1 className="text-3xl font-bold">Wallet Analysis</h1>
            <p className="mt-2 text-muted-foreground">Paste a Mantle wallet address to analyze</p>
            <div className="mt-6 flex w-full max-w-md gap-2">
              <Input placeholder="0x..." className="bg-card" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {address && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Wallet Profile</h1>
              <button onClick={copyAddr} className="flex items-center gap-1 rounded-lg bg-card px-3 py-1.5 text-sm text-muted-foreground border border-border/50 hover:text-foreground transition-colors">
                {truncate(address)} {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">MNT Balance</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold text-primary">{wallet?.balance}</p>}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Transactions</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{wallet?.txCount.toLocaleString()}</p>}</CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Risk Score</CardTitle></CardHeader><CardContent>{risk ? <Badge className={`text-lg px-3 py-1 ${riskColor(risk.score)}`}>{risk.score}/10</Badge> : <Skeleton className="h-8 w-16" />}</CardContent></Card>
            </div>

            {(riskText || risk) && (
              <Card>
                <CardHeader><CardTitle>AI Risk Analysis</CardTitle></CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{riskText || risk?.explanation || ""}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
