import { useEffect, useState } from "react";

const AUTO_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

function formatCountdown(ms) {
  if (ms <= 0) return "maintenant";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ==========================================================
// 🕒 Historique organisé des synthèses générées automatiquement
// toutes les 20 minutes, + génération manuelle à la demande.
// ==========================================================
export default function SynthesesAuto({ syntheses, nextRunAt, generating, error, onGenerateNow, onBack }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const remaining = nextRunAt ? nextRunAt - now : null;

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 p-6">
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Synthèses automatiques</h2>
              <p className="mt-1 text-sm text-slate-500">
                Une synthèse des questions posées est générée automatiquement toutes les 20 minutes.
              </p>
            </div>
            <button
              onClick={onBack}
              className="shrink-0 rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
            >
              ← Retour aux questions
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Prochaine synthèse dans {remaining !== null ? formatCountdown(remaining) : "—"}
            </span>
            <button
              onClick={onGenerateNow}
              disabled={generating}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 disabled:opacity-60"
            >
              {generating ? "Génération…" : "Générer maintenant"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          {syntheses.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
              Aucune synthèse générée pour l'instant.
            </div>
          ) : (
            <div className="space-y-4">
              {syntheses.map((s, i) => (
                <div key={s.id ?? i} className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-fuchsia-700">
                      {i === 0 ? "Dernière synthèse" : `Synthèse #${syntheses.length - i}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(s.horodatage).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{s.texte}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { AUTO_INTERVAL_MS };
