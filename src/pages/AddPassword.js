import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Toast from "../components/Toast";
import { useAuth } from "../hooks/useAuth";

export default function AddPassword() {
  const { api } = useAuth();
  const nav = useNavigate();
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/passwords", { siteName, siteUrl, username, password, notes });
      setToast("Saved");
      nav("/dashboard");
    } catch (err) {
      setToast(err?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="max-w-3xl">
        <Card
          title="Add a new password"
          subtitle="Your password and notes are encrypted before being stored."
        >
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Site name</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
                placeholder="GitHub"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Site URL (optional)</label>
              <input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
                placeholder="https://github.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
                placeholder="yourname"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
                placeholder="••••••••••••"
              />
              <div className="mt-2 text-xs text-slate-400">Tip: avoid reusing passwords across sites.</div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
                placeholder="Recovery hints, MFA notes, etc."
              />
            </div>
            <div className="sm:col-span-2">
              <button
                disabled={busy}
                className="w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Saving..." : "Save password"}
              </button>
            </div>
          </form>
        </Card>
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

