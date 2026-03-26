import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function titleFor(pathname) {
  if (pathname.startsWith("/add")) return "Add a password";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return "PasswordManager Pro";
}

export default function Topbar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div>
          <div className="text-base font-semibold">{titleFor(pathname)}</div>
          <div className="text-xs text-slate-400">Encrypted vault • Clipboard auto-clear • Share tokens</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/add"
            className="rounded-xl bg-indigo-500/15 px-3 py-2 text-sm font-semibold text-indigo-200 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500/25"
          >
            New
          </Link>
          <button
            onClick={logout}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

