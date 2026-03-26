import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../components/Toast";

export default function ShareRedeem() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch(`/api/share/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Invalid token");
        setData(json);
        setStatus("ready");
      } catch (e) {
        setStatus("error");
        setToast(e.message || "Failed");
      }
    }
    run();
  }, [token]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(data.password);
      setToast("Copied. Clipboard will clear in 10 seconds.");
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === data.password) {
            await navigator.clipboard.writeText("");
          }
        } catch {}
      }, 10000);
    } catch {
      setToast("Clipboard copy failed.");
    }
  }

  return (
    <div className="min-h-full bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-xl rounded-3xl bg-white/5 p-6 shadow-soft ring-1 ring-white/10 sm:p-8">
        <div className="text-lg font-semibold">Shared password</div>
        <div className="mt-1 text-sm text-slate-300">This link is one-time and expires.</div>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-slate-950/40 p-4 text-sm text-slate-200 ring-1 ring-white/10">
            Redeeming token...
          </div>
        ) : status === "error" ? (
          <div className="mt-6 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
            Token is invalid, expired, or already used.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">Site</div>
              <div className="mt-1 text-sm font-semibold">{data.siteName}</div>
              {data.siteUrl ? <div className="mt-1 text-xs text-slate-300">{data.siteUrl}</div> : null}
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">Username</div>
              <div className="mt-1 font-mono text-sm">{data.username}</div>
            </div>
            <div className="rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">Password</div>
              <div className="mt-1 font-mono text-sm">{data.password}</div>
              <button
                onClick={copy}
                className="mt-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
              >
                Copy (self-destruct)
              </button>
            </div>
            {data.notes ? (
              <div className="rounded-2xl bg-slate-950/40 p-4 ring-1 ring-white/10">
                <div className="text-xs text-slate-400">Notes</div>
                <div className="mt-1 text-sm text-slate-200">{data.notes}</div>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-8 text-sm text-slate-300">
          Go to{" "}
          <Link to="/login" className="text-indigo-200 hover:underline">
            login
          </Link>{" "}
          to access your own vault.
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

