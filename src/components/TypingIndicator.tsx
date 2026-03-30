export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-card px-4 py-3 border border-border/50">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
