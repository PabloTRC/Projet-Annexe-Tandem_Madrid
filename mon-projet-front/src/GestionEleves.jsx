import { useEffect, useState } from "react";
import api from "./api";

//Inscription, déconnexion
export default function GestionEleves({ cours, onBack }) {
  const [tousLesEleves, setTousLesEleves] = useState([]);
  const [inscritsIds, setInscritsIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [nouveauNom, setNouveauNom] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!cours) return;
    let cancelled = false;

    (async () => {
      try {
        const [tous, inscrits] = await Promise.all([
          api.getEleves(),
          api.getElevesInscrits(cours.id),
        ]);
        if (cancelled) return;
        setTousLesEleves(tous);
        setInscritsIds(new Set(inscrits.map((e) => e.id)));
      } catch (err) {
        if (!cancelled) setError(err.message || "Erreur lors du chargement des élèves.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cours]);

  async function handleToggle(eleve) {
    setBusyId(eleve.id);
    setError("");
    try {
      if (inscritsIds.has(eleve.id)) {
        await api.desinscrireEleve(cours.id, eleve.id);
        setInscritsIds((prev) => {
          const next = new Set(prev);
          next.delete(eleve.id);
          return next;
        });
      } else {
        await api.inscrireEleve(cours.id, eleve.id);
        setInscritsIds((prev) => new Set(prev).add(eleve.id));
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de l'inscription.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateEleve(e) {
    e.preventDefault();
    const nom = nouveauNom.trim();
    if (!nom) return;
    setCreating(true);
    setError("");
    try {
      const eleve = await api.createEleve(nom);
      setTousLesEleves((prev) => [...prev, eleve]);
      await api.inscrireEleve(cours.id, eleve.id);
      setInscritsIds((prev) => new Set(prev).add(eleve.id));
      setNouveauNom("");
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'élève.");
    } finally {
      setCreating(false);
    }
  }

  const inscrits = tousLesEleves.filter((e) => inscritsIds.has(e.id));
  const nonInscrits = tousLesEleves.filter((e) => !inscritsIds.has(e.id));

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Élèves de la classe</h2>
            <p className="mt-1 text-sm text-slate-500">
              {cours?.titre} — inscris ou désinscris les élèves de cette classe.
            </p>
          </div>
          <button
            onClick={onBack}
            className="shrink-0 rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
          >
            ← Retour aux questions
          </button>
        </div>

        <form
          onSubmit={handleCreateEleve}
          className="flex gap-2 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm"
        >
          <input
            type="text"
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
            placeholder="Nom du nouvel élève à créer et inscrire directement…"
            className="flex-1 rounded-lg border border-pink-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
          />
          <button
            type="submit"
            disabled={!nouveauNom.trim() || creating}
            className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/30 hover:from-pink-600 hover:to-rose-700 disabled:opacity-60"
          >
            {creating ? "Création…" : "Créer + inscrire"}
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid flex-1 min-h-0 grid-cols-2 gap-6">
          {/* Inscrits */}
          <div className="flex min-h-0 flex-col rounded-2xl border border-pink-100 bg-white shadow-sm">
            <div className="border-b border-pink-100 p-4">
              <h3 className="font-semibold text-slate-700">
                Inscrits ({inscrits.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading && <p className="text-center text-sm text-slate-400">Chargement…</p>}
              {!loading && inscrits.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-pink-200 p-6 text-center text-sm text-slate-400">
                  Aucun élève inscrit.
                </div>
              )}
              {inscrits.map((eleve) => (
                <div
                  key={eleve.id}
                  className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{eleve.nom}</span>
                  <button
                    onClick={() => handleToggle(eleve)}
                    disabled={busyId === eleve.id}
                    className="rounded-lg border border-pink-200 bg-white px-2.5 py-1 text-xs font-medium text-pink-700 hover:bg-pink-50 disabled:opacity-50"
                  >
                    Désinscrire
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Non inscrits */}
          <div className="flex min-h-0 flex-col rounded-2xl border border-pink-100 bg-white shadow-sm">
            <div className="border-b border-pink-100 p-4">
              <h3 className="font-semibold text-slate-700">
                Autres élèves ({nonInscrits.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {!loading && nonInscrits.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-pink-200 p-6 text-center text-sm text-slate-400">
                  Tous les élèves existants sont déjà inscrits.
                </div>
              )}
              {nonInscrits.map((eleve) => (
                <div
                  key={eleve.id}
                  className="flex items-center justify-between rounded-lg border border-pink-100 bg-white px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{eleve.nom}</span>
                  <button
                    onClick={() => handleToggle(eleve)}
                    disabled={busyId === eleve.id}
                    className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:from-pink-600 hover:to-rose-700 disabled:opacity-50"
                  >
                    Inscrire
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
