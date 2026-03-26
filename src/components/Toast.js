import React, { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-soft ring-1 ring-white/10 backdrop-blur">
      {message}
    </div>
  );
}

