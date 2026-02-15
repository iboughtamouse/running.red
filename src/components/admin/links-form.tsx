"use client";

import { useState } from "react";

import type { Link } from "@/lib/types";

export function LinksForm({ initialLinks }: { initialLinks: Link[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [links, setLinks] = useState<Link[]>(initialLinks);

  function addLink() {
    setLinks([...links, { title: "", url: "", description: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof Link, value: string) {
    setLinks(links.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  function moveLink(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const updated = [...links];
    const temp = updated[index]!;
    updated[index] = updated[target]!;
    updated[target] = temp;
    setLinks(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const cleaned = links
      .filter((link) => link.title.trim() && link.url.trim())
      .map((link) => ({
        title: link.title.trim(),
        url: link.url.trim(),
        description: link.description?.trim() || undefined,
      }));

    try {
      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: cleaned }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Links Page</h2>

      {error && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">
          Saved successfully.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {links.length === 0 && (
          <p className="text-sm text-gray-500">No links yet. Add one below.</p>
        )}

        {links.map((link, index) => (
          <div key={index} className="rounded border border-gray-300 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Link {index + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(index, 1)}
                  disabled={index === links.length - 1}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateLink(index, "title", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="My Twitter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">URL</label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">Description (optional)</label>
              <input
                type="text"
                value={link.description || ""}
                onChange={(e) => updateLink(index, "description", e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Short description"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addLink}
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Add Link
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
