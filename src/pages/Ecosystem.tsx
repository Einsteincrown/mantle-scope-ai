import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink } from "lucide-react";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import ecosystemData from "@/data/ecosystem.json";

const categories = ["All", "DeFi", "Infrastructure", "Gaming", "NFT"];

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  tvl: string;
  users: string;
}

export default function Ecosystem() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { toast } = useToast();

  const projects = (ecosystemData as Project[]).filter((p) => {
    const matchCat = filter === "All" || p.category === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openProject = (p: Project) => {
    setSelected(p);
    setSummary("");
    setLoadingSummary(true);
    let acc = "";
    streamChat({
      messages: [{ role: "user", content: `Provide a comprehensive summary of "${p.name}" — ${p.description}. Cover: what it is, key features, how it fits in the Mantle ecosystem, risk factors, and community sentiment.` }],
      mode: "ecosystem-summary",
      onDelta: (d) => { acc += d; setSummary(acc); },
      onDone: () => setLoadingSummary(false),
    }).catch((e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setLoadingSummary(false);
    });
  };

  const catColor = (c: string) => {
    switch (c) {
      case "DeFi": return "bg-primary/20 text-primary border-primary/30";
      case "Infrastructure": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Gaming": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "NFT": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mantle Ecosystem</h1>
          <p className="mt-1 text-muted-foreground">Explore protocols, dApps, and tokens building on Mantle</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-10 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer border-border/50 transition-all hover:border-primary/40 hover:shadow-[0_0_20px_-6px_hsl(160,100%,41.4%,0.12)]"
              onClick={() => openProject(p)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{p.name}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${catColor(p.category)}`}>{p.category}</span>
                  <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{p.subcategory}</span>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>TVL: <strong className="text-foreground">{p.tvl}</strong></span>
                  <span>Users: <strong className="text-foreground">{p.users}</strong></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">No projects found matching your filters.</p>
        )}

        {/* Project Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selected?.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{selected?.description}</p>
            </DialogHeader>
            <div className="mt-4">
              {loadingSummary && !summary ? (
                <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" /></div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
