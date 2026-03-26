import React from "react";
import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="hidden lg:block">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-emerald-500/10 p-8 shadow-soft ring-1 ring-white/10">
            <div className="text-2xl font-semibold tracking-tight">Secure Intelligent Password Manager</div>
            <p className="mt-2 text-sm text-slate-300">
              AES-encrypted vault, JWT auth, one-time share tokens, clipboard self-destruct, and password health insights.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3">
              {[
                { k: "Zero plain storage", v: "Passwords are encrypted at rest with AES-256-GCM." },
                { k: "Share safely", v: "Generate temporary, one-time tokens with expiry." },
                { k: "Panic mode", v: "Instant logout and clear sensitive state." },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-sm font-semibold">{x.k}</div>
                  <div className="mt-1 text-xs text-slate-300">{x.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-xs text-slate-400">
              New here?{" "}
              <Link to="/signup" className="text-indigo-200 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl bg-white/5 p-6 shadow-soft ring-1 ring-white/10 sm:p-8">
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
            {footer ? <div className="mt-6 text-sm text-slate-300">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

