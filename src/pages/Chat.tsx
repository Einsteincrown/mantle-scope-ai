import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { streamChat, type Msg } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((p) => {
        const last = p[p.length - 1];
        if (last?.role === "assistant") return p.map((m, i) => (i === p.length - 1 ? { ...m, content: acc } : m));
        return [...p, { role: "assistant", content: acc }];
      });
    };

    try {
      await streamChat({ messages: [...messages, userMsg], mode: "chat", onDelta: upsert, onDone: () => setLoading(false) });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col mx-auto w-full max-w-3xl px-4">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="text-lg font-semibold text-foreground">Ask anything about Mantle</p>
              <p className="text-sm mt-1">Protocols, tokens, strategies, on-chain data...</p>
            </div>
          )}
          {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
          {loading && messages[messages.length - 1]?.role !== "assistant" && <TypingIndicator />}
          <div ref={endRef} />
        </div>
        <div className="sticky bottom-0 bg-background pb-4 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              className="bg-card border-border/60 focus-visible:ring-primary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="icon" onClick={send} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
