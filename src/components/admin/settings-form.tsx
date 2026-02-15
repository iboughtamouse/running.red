"use client";

import { useState } from "react";

import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ initialData }: { initialData: SiteSettings }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [siteTitle, setSiteTitle] = useState(initialData.siteTitle);
  const [siteDescription, setSiteDescription] = useState(initialData.siteDescription);
  const [socialImageUrl, setSocialImageUrl] = useState(initialData.socialImageUrl || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle,
          siteDescription,
          socialImageUrl: socialImageUrl || null,
        }),
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
      <h2 className="text-xl font-bold">Site Settings</h2>

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

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="siteTitle" className="block text-sm font-medium">
            Site Title
          </label>
          <input
            id="siteTitle"
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium">
            Site Description
          </label>
          <textarea
            id="siteDescription"
            rows={3}
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            Used for SEO meta description and social sharing.
          </p>
        </div>

        <div>
          <label htmlFor="socialImageUrl" className="block text-sm font-medium">
            Social Image URL
          </label>
          <input
            id="socialImageUrl"
            type="url"
            value={socialImageUrl}
            onChange={(e) => setSocialImageUrl(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            placeholder="https://..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Default Open Graph image for social media sharing.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
