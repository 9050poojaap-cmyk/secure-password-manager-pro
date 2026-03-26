import React, { useMemo, useState } from "react";

function HealthPill({ score, label, reused }) {
  const color =
    score >= 80 ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30" : score >= 55 ? "bg-sky-500/15 text-sky-200 ring-sky-400/30" : score >= 35 ? "bg-amber-500/15 text-amber-200 ring-amber-400/30" : "bg-rose-500/15 text-rose-200 ring-rose-400/30";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color}`}>
        {label} • {score}/100
      </span>
      {reused ? (
        <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/20">
          Reused
        </span>
      ) : null}
    </div>
  );
}

export default function PasswordRow({ item, onDelete, onShare, onToast }) {
  const [reveal, setReveal] = useState(false);
  const masked = useMemo(() => "•".repeat(Math.min(12, Math.max(8, item.password?.length || 10))), [item.password]);

  async function copyWithSelfDestruct() {
    try {
      await navigator.clipboard.writeText(item.password);
      onToast?.("Copied. Clipboard will clear in 10 seconds.");
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === item.password) {
            await navigator.clipboard.writeText("");
          }
        } catch {
          // ignore
        }
      }, 10000);
    } catch {
      onToast?.("Clipboard copy failed (browser permissions).");
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-white">{item.siteName}</div>
            {item.siteUrl ? (
              <a
                href={item.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-xs text-indigo-200 hover:underline"
              >
                {item.siteUrl}
              </a>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-slate-300">
            <span className="text-slate-400">Username:</span> {item.username}
          </div>
          <div className="mt-2 font-mono text-sm text-slate-100">
            {reveal ? item.password : masked}
          </div>
          <div className="mt-3">
            <HealthPill score={item.health?.score ?? 0} label={item.health?.label ?? "—"} reused={item.reused} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            onClick={() => setReveal((v) => !v)}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            {reveal ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={copyWithSelfDestruct}
            className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
          >
            Copy
          </button>
          <button
            onClick={() => onShare?.(item)}
            className="rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-semibold text-indigo-200 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500/25"
          >
            Share Token
          </button>
          <button
            onClick={() => onDelete?.(item)}
            className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-500/25"
          >
            Delete
          </button>
        </div>
      </div>

      {item.notes ? (
        <div className="mt-3 text-xs text-slate-300">
          <span className="text-slate-400">Notes:</span> {item.notes}
        </div>
      ) : null}
    </div>
  );
}

