import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-btn-dark/30 mt-auto bg-base/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 text-sm text-foreground/50">
        <span>&copy; {new Date().getFullYear()} Running Red</span>
        <Link href="/rss.xml" className="hover:text-btn-gold transition-colors">
          RSS
        </Link>
      </div>
    </footer>
  );
}
