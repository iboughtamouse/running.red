"use client";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-4 text-foreground/60">
        An error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded bg-btn-dark px-6 py-2 text-sm font-medium text-btn-gold hover:bg-btn-red hover:text-btn-dark transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
