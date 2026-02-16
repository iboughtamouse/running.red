"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ComicNavProps {
  firstSlug: string | null;
  prevSlug: string | null;
  nextSlug: string | null;
  lastSlug: string | null;
}

function NavButton({
  href,
  label,
  disabled,
}: {
  href: string | null;
  label: string;
  disabled: boolean;
}) {
  if (disabled || !href) {
    return (
      <span className="inline-block rounded px-4 py-2 text-sm font-medium bg-btn-dark/50 text-foreground/30 cursor-not-allowed">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={`/comic/${href}`}
      className="inline-block rounded px-4 py-2 text-sm font-medium bg-btn-dark text-btn-gold hover:bg-btn-red hover:text-btn-dark transition-colors"
    >
      {label}
    </Link>
  );
}

export function ComicNav({ firstSlug, prevSlug, nextSlug, lastSlug }: ComicNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && prevSlug) {
        router.push(`/comic/${prevSlug}`);
      } else if (e.key === "ArrowRight" && nextSlug) {
        router.push(`/comic/${nextSlug}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlug, nextSlug, router]);

  return (
    <nav className="flex items-center justify-center gap-2 rounded-lg bg-base/60 backdrop-blur-sm px-3 py-2" aria-label="Comic navigation">
      <NavButton href={firstSlug} label="First" disabled={!prevSlug} />
      <NavButton href={prevSlug} label="Previous" disabled={!prevSlug} />
      <NavButton href={nextSlug} label="Next" disabled={!nextSlug} />
      <NavButton href={lastSlug} label="Last" disabled={!nextSlug} />
    </nav>
  );
}
