import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="site-header">
      <a href="/" className="brand">
        <span className="brand-icon">
          <ShieldCheck size={22} />
        </span>

        <span className="brand-name">
          essay<span>check</span>
        </span>

        <span className="beta-badge">BETA</span>
      </a>

      <div className="header-right">
        <span className="privacy-status">
          <span className="status-dot" />
          Private analysis
        </span>
      </div>
    </header>
  );
}
