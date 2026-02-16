import Link from "next/link";

export default function ComicNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold text-btn-gold">Page Not Found</h1>
      <p className="mt-4 text-foreground/60">This comic page doesn&apos;t exist or isn&apos;t published yet.</p>
      <Link
        href="/"
        className="mt-6 rounded bg-btn-dark px-6 py-2 text-sm font-medium text-btn-gold hover:bg-btn-red hover:text-btn-dark transition-colors"
      >
        Go to Latest
      </Link>
    </div>
  );
}
