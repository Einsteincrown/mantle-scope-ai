import ReactMarkdown from "react-markdown";

interface Props {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md border border-border/50"
        }`}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-headings:text-foreground prose-a:text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
