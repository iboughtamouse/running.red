"use client";

import { useState } from "react";
import type { ContentWarningType } from "@/lib/types";
import { CONTENT_WARNING_TYPES } from "@/lib/types";

interface ContentWarningProps {
  warnings: ContentWarningType[];
  warningOther: string | null;
  children: React.ReactNode;
}

const WARNING_LABELS: Record<ContentWarningType, string> = {
  [CONTENT_WARNING_TYPES.ABUSE]: "Abuse",
  [CONTENT_WARNING_TYPES.TRAUMA]: "Trauma",
  [CONTENT_WARNING_TYPES.SELF_HARM_SUICIDE]: "Self-Harm / Suicide",
  [CONTENT_WARNING_TYPES.EATING_DISORDERS]: "Eating Disorders",
  [CONTENT_WARNING_TYPES.VIOLENCE]: "Violence",
  [CONTENT_WARNING_TYPES.DEATH_DYING]: "Death / Dying",
  [CONTENT_WARNING_TYPES.MENTAL_ILLNESS]: "Mental Illness",
};

export function ContentWarning({ warnings, warningOther, children }: ContentWarningProps) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div>
        {children}
        <div className="mt-3 flex flex-wrap gap-2">
          {warnings.map((w) => (
            <span
              key={w}
              className="rounded-full bg-btn-dark px-3 py-1 text-xs text-btn-gold"
            >
              {WARNING_LABELS[w] || w}
            </span>
          ))}
          {warningOther && (
            <span className="rounded-full bg-btn-dark px-3 py-1 text-xs text-btn-gold">
              {warningOther}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="blur-xl pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-base/60 rounded">
        <h2 className="text-xl font-bold text-foreground">Content Warning</h2>
        <ul className="flex flex-wrap justify-center gap-2">
          {warnings.map((w) => (
            <li
              key={w}
              className="rounded-full bg-btn-dark px-3 py-1 text-sm text-btn-gold"
            >
              {WARNING_LABELS[w] || w}
            </li>
          ))}
          {warningOther && (
            <li className="rounded-full bg-btn-dark px-3 py-1 text-sm text-btn-gold">
              {warningOther}
            </li>
          )}
        </ul>
        <button
          onClick={() => setRevealed(true)}
          className="rounded bg-btn-dark px-6 py-2 text-sm font-medium text-btn-gold hover:bg-btn-red hover:text-btn-dark transition-colors"
        >
          View Page
        </button>
      </div>
    </div>
  );
}
