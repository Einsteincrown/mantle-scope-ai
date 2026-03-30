import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function Research() {
  const [params] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const { toast } = useToast();

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setSearched(q.trim());
    setResult("");
    setLoading(true);
    let acc = "";
    streamChat({
      messages: [{ role: "user", content: `Research: ${q.trim()}` }],
      mode: "research",
      onDelta: (d) => { acc += d; setResult(acc); },
      onDone: () => setLoading(false),
    }).catch((e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setLoading(false);
    });
  };

  useEffect(() => { if (initialQ) doSearch(initialQ); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Token & Protocol Research</h1>
        <p className="mt-1 text-muted-foreground">AI-powered deep dives on any Mantle token or DeFi protocol</p>

        <div className="mt-6 flex max-w-lg gap-2">
          <Input
            placeholder="e.g. Agni Finance, WMNT, Lendle..."
            className="bg-card"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
          />
          <Button onClick={() => doSearch(query)}><Search className="h-4 w-4 mr-2" /> Research</Button>
        </div>

        {(result || loading) && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader><CardTitle>Research Summary — {searched}</CardTitle></CardHeader>
              <CardContent>
                {loading && !result ? (
                  <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /></div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div><p className="text-muted-foreground">Network</p><p className="font-semibold">Mantle</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-semibold">DeFi</p></div>
                <div><p className="text-muted-foreground">Price</p><p className="font-semibold text-muted-foreground italic">Data coming soon</p></div>
                <div><p className="text-muted-foreground">24h Volume</p><p className="font-semibold text-muted-foreground italic">Data coming soon</p></div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
