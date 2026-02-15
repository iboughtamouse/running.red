"use client";

import { useState } from "react";

import type { AboutPage } from "@/lib/types";

export function AboutForm({ initialData }: { initialData: AboutPage }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [aboutMe, setAboutMe] = useState(initialData.aboutMe);
  const [aboutComic, setAboutComic] = useState(initialData.aboutComic);
  const [contentWarnings, setContentWarnings] = useState(initialData.contentWarnings);
  const [updateSchedule, setUpdateSchedule] = useState(initialData.updateSchedule);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutMe, aboutComic, contentWarnings, updateSchedule }),
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
      <h2 className="text-xl font-bold">About Page</h2>

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
          <label htmlFor="aboutMe" className="block text-sm font-medium">
            About Me
          </label>
          <textarea
            id="aboutMe"
            rows={6}
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="aboutComic" className="block text-sm font-medium">
            About the Comic
          </label>
          <textarea
            id="aboutComic"
            rows={6}
            value={aboutComic}
            onChange={(e) => setAboutComic(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="contentWarnings" className="block text-sm font-medium">
            Content Warnings
          </label>
          <textarea
            id="contentWarnings"
            rows={4}
            value={contentWarnings}
            onChange={(e) => setContentWarnings(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-sm text-gray-500">
            General content warnings displayed on the about page.
          </p>
        </div>

        <div>
          <label htmlFor="updateSchedule" className="block text-sm font-medium">
            Update Schedule
          </label>
          <input
            id="updateSchedule"
            type="text"
            value={updateSchedule}
            onChange={(e) => setUpdateSchedule(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            placeholder="e.g. Every Monday"
          />
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
