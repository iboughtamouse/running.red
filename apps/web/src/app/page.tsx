export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex aspect-[2/3] w-full max-w-2xl items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-400">Comic page will display here</p>
      </div>

      <nav className="flex gap-4">
        <button className="rounded bg-gray-200 px-4 py-2 text-sm" disabled>
          First
        </button>
        <button className="rounded bg-gray-200 px-4 py-2 text-sm" disabled>
          Previous
        </button>
        <button className="rounded bg-gray-200 px-4 py-2 text-sm" disabled>
          Next
        </button>
        <button className="rounded bg-gray-200 px-4 py-2 text-sm" disabled>
          Last
        </button>
      </nav>

      <div className="w-full max-w-2xl rounded-lg bg-gray-50 p-6">
        <p className="text-sm text-gray-500">
          Author commentary will display here
        </p>
      </div>
    </div>
  );
}
