import { NavLink } from "@/components/NavLink";
import { Activity } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chat" },
  { to: "/research", label: "Research" },
  { to: "/ecosystem", label: "Ecosystem" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-['Space_Grotesk']">
            Mantle<span className="text-primary">Scope</span>
          </span>
        </NavLink>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="!text-primary bg-primary/10"
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
