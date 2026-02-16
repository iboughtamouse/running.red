"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CONTENT_WARNING_TYPES, WARNING_LABELS } from "@/lib/types";

import type { ComicPage } from "@/lib/types";

export function EditComicForm({ comic }: { comic: ComicPage }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pageNumber, setPageNumber] = useState(String(comic.pageNumber));
  const [title, setTitle] = useState(comic.title || "");
  const [publishDate, setPublishDate] = useState(
    new Date(comic.publishDate).toISOString().split("T")[0] || ""
  );
  const [status, setStatus] = useState<"draft" | "published">(comic.status);
  const [commentary, setCommentary] = useState(comic.commentary || "");
  const [contentWarnings, setContentWarnings] = useState<string[]>(comic.contentWarnings);
  const [contentWarningOther, setContentWarningOther] = useState(
    comic.contentWarningOther || ""
  );
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const existingImageUrl = comic.imageUrl
    ? `/api/images/${comic.imageUrl}?v=${comic.updatedAt}`
    : null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function toggleWarning(value: string) {
    setContentWarnings((prev) =>
      prev.includes(value) ? prev.filter((w) => w !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("pageNumber", pageNumber);
      formData.set("publishDate", publishDate);
      formData.set("status", status);
      formData.set("title", title);
      formData.set("commentary", commentary);
      formData.set("contentWarnings", JSON.stringify(contentWarnings));
      formData.set("contentWarningOther", contentWarningOther);
      if (image) formData.set("image", image);

      const res = await fetch(`/api/admin/comics/${comic.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update comic page");
        return;
      }

      router.push("/admin/comics");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this comic page?")) return;

    try {
      const res = await fetch(`/api/admin/comics/${comic.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Failed to delete comic page");
        return;
      }
      router.push("/admin/comics");
    } catch {
      setError("Something went wrong");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Edit Comic Page</h2>
        <button
          onClick={handleDelete}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
        >
          Delete Page
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="pageNumber" className="block text-sm font-medium">
              Page Number *
            </label>
            <input
              id="pageNumber"
              type="number"
              required
              min="1"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium">
            Replace Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageChange}
            className="mt-1 block text-sm file:mr-3 file:rounded file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
          />
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="New image preview"
              className="mt-2 max-h-48 rounded border border-gray-300"
            />
          )}
          {!imagePreview && existingImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current image:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingImageUrl}
                alt="Current comic page"
                className="mt-1 max-h-48 rounded border border-gray-300"
              />
            </div>
          )}
          {!imagePreview && !existingImageUrl && (
            <p className="mt-1 text-sm text-gray-500">No image uploaded yet.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium">
              Publish Date *
            </label>
            <input
              id="publishDate"
              type="date"
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status *</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === "draft"}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                />
                Draft
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === "published"}
                  onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                />
                Published
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="commentary" className="block text-sm font-medium">
            Commentary
          </label>
          <textarea
            id="commentary"
            rows={4}
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Content Warnings</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {Object.values(CONTENT_WARNING_TYPES).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={contentWarnings.includes(value)}
                  onChange={() => toggleWarning(value)}
                />
                {WARNING_LABELS[value] || value}
              </label>
            ))}
          </div>
          <div className="mt-2">
            <label htmlFor="contentWarningOther" className="block text-sm text-gray-500">
              Other (describe):
            </label>
            <input
              id="contentWarningOther"
              type="text"
              value={contentWarningOther}
              onChange={(e) => setContentWarningOther(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/comics")}
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
