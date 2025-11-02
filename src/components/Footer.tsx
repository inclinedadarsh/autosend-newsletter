import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="my-14 pt-14 text-sm font-mono uppercase tracking-wider border-t-2 border-border border-dashed flex items-center justify-between">
      <span className="text-muted-foreground">
        &copy; {new Date().getFullYear()} Adarsh Dubey
      </span>
      <Link
        href="https://github.com/inclinedadarsh/autosend-newsletter"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        GitHub <ArrowUpRight size={16} />
      </Link>
    </footer>
  );
};

export default Footer;
