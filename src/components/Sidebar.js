import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, panic } = useAuth();

  return (
    <aside className="hidden w-72 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 to-slate-950/60 p-4 sm:flex">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight">PasswordManager Pro</div>
          <div className="text-xs text-slate-400">Secure • Encrypted • Minimal</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/5 p-4 shadow-soft ring-1 ring-white/10">
        <div className="text-xs text-slate-400">Signed in as</div>
        <div className="mt-1 truncate text-sm font-semibold">{user?.name || "—"}</div>
        <div className="truncate text-xs text-slate-300">{user?.email || ""}</div>
      </div>

      <nav className="mt-6 space-y-2">
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/add" label="Add Password" />
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={panic}
          className="w-full rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-500/25"
          title="Panic mode: instant logout and clear sensitive state"
        >
          Panic Mode
        </button>
        <div className="mt-2 text-xs text-slate-500">
          Tip: Panic Mode logs you out instantly and clears local sensitive state.
        </div>
      </div>
    </aside>
  );
}

