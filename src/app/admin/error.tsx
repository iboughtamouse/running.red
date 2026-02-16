"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-4 text-gray-500">
        {error.message || "An error occurred while loading this page."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded bg-gray-900 px-6 py-2 text-sm text-white hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
