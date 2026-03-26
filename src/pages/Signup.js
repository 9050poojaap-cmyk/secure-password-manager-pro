import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Toast from "../components/Toast";
import { useAuth } from "../hooks/useAuth";

export default function Signup() {
  const { api, login } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      login(res.data.token, res.data.user);
      nav("/dashboard");
    } catch (err) {
      setToast(err?.response?.data?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AuthShell
        title="Create your vault"
        subtitle="Your data is encrypted at rest."
        footer={
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-200 hover:underline">
              Login
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
              placeholder="Poojaa"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">Master password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-400/50"
              placeholder="Use 12+ characters"
            />
            <div className="mt-2 text-xs text-slate-400">Tip: use a long passphrase with mixed characters.</div>
          </div>
          <button
            disabled={busy}
            className="w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>
      </AuthShell>
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

