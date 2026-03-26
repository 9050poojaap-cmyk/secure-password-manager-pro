import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import PasswordRow from "../components/PasswordRow";
import Toast from "../components/Toast";
import { useAuth } from "../hooks/useAuth";

function aggregate(items) {
  if (!items.length) return { avg: 0, weak: 0, reused: 0 };
  const avg = Math.round(items.reduce((acc, x) => acc + (x.health?.score || 0), 0) / items.length);
  const weak = items.filter((x) => (x.health?.score || 0) < 55).length;
  const reused = items.filter((x) => x.reused).length;
  return { avg, weak, reused };
}

export default function Dashboard() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [toast, setToast] = useState("");
  const [shareLink, setShareLink] = useState("");

  async function refresh() {
    setBusy(true);
    try {
      const res = await api.get("/passwords");
      setItems(res.data.items || []);
    } catch (err) {
      setToast(err?.response?.data?.message || "Failed to load vault");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => aggregate(items), [items]);

  async function onDelete(item) {
    if (!window.confirm(`Delete password for ${item.siteName}?`)) return;
    try {
      await api.delete(`/passwords/${item.id}`);
      setToast("Deleted");
      await refresh();
    } catch (err) {
      setToast(err?.response?.data?.message || "Delete failed");
    }
  }

  async function onShare(item) {
    try {
      const res = await api.post("/share", {
        passwordEntryId: item.id,
        expiresInMinutes: 30,
        oneTime: true,
      });
      const url = `${window.location.origin}/share/${res.data.token}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      setToast("Share link created (copied if permitted).");
    } catch (err) {
      setToast(err?.response?.data?.message || "Share failed");
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Vault health" subtitle="Average score across saved passwords">
          <div className="text-3xl font-semibold">{stats.avg}/100</div>
          <div className="mt-2 text-xs text-slate-400">
            Weak: <span className="text-slate-200">{stats.weak}</span> • Reused:{" "}
            <span className="text-slate-200">{stats.reused}</span>
          </div>
        </Card>
        <Card title="Self-destruct clipboard" subtitle="Copied passwords are cleared after 10 seconds">
          <div className="text-sm text-slate-200">Use the “Copy” button on any entry.</div>
          <div className="mt-2 text-xs text-slate-400">
            Clearing is best-effort (browser permissions vary).
          </div>
        </Card>
        <Card title="Fake sharing" subtitle="Create a one-time token with expiry">
          <div className="text-sm text-slate-200">Click “Share Token” on an entry.</div>
          {shareLink ? (
            <div className="mt-3 rounded-xl bg-slate-950/40 p-3 text-xs text-slate-200 ring-1 ring-white/10">
              <div className="text-slate-400">Latest link</div>
              <div className="mt-1 break-all font-mono">{shareLink}</div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Your passwords</div>
          <button
            onClick={refresh}
            className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {busy ? (
          <div className="rounded-2xl bg-white/5 p-6 text-sm text-slate-300 ring-1 ring-white/10">Loading...</div>
        ) : items.length ? (
          <div className="space-y-3">
            {items.map((item) => (
              <PasswordRow
                key={item.id}
                item={item}
                onDelete={onDelete}
                onShare={onShare}
                onToast={setToast}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 p-6 text-sm text-slate-300 ring-1 ring-white/10">
            Your vault is empty. Add your first password.
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

