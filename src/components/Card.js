import React from "react";

export default function Card({ title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl bg-white/5 p-4 shadow-soft ring-1 ring-white/10 sm:p-6">
      {(title || subtitle || right) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold text-white">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

