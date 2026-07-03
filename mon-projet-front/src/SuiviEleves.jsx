import { useEffect, useMemo, useState } from "react";
import api from "./api";

const categoryLabels = {
  cours_precedent: "Cours précédent",
  elementaire: "Élémentaire",
  approfondie: "Approfondie",
};

const categoryStyles = {
  cours_precedent: "bg-fuchsia-100 text-fuchsia-700",
  elementaire: "bg-pink-100 text-pink-700",
  approfondie: "bg-rose-100 text-rose-700",
};

function categoryLabel(categorie) {
  return categorie ? categoryLabels[categorie] ?? categorie : "Non catégorisée";
}

function categoryStyle(categorie) {
  return categoryStyles[categorie] ?? "bg-slate-100 text-slate-500";
}

// Heuristique de statut, basee uniquement sur la categorie majoritaire parmi
// les questions deja categorisees par le LLM (pas de donnee inventee) :
//   - majorite "cours_precedent" -> lacunes sur des notions deja vues
//   - majorite "elementaire"     -> a surveiller, niveau de base
//   - majorite "approfondie"     -> va au-dela du cours, progresse bien
//   - egalite / pas assez de donnees -> suit normalement
function computeStatut(counts) {
  const { cours_precedent = 0, elementaire = 0, approfondie = 0 } = counts;
  const total = cours_precedent + elementaire + approfondie;
  if (total === 0) {
    return { label: "Aucune question", tone: "bg-slate-100 text-slate-500", order: 3 };
  }
  if (cours_precedent >= elementaire && cours_precedent >= approfondie && cours_precedent > 0) {
    return { label: "En difficulté", tone: "bg-red-100 text-red-700", order: 0 };
  }
  if (elementaire > approfondie) {
    return { label: "À surveiller", tone: "bg-amber-100 text-amber-700", order: 1 };
  }
  if (approfondie > 0) {
    return { label: "Progresse bien", tone: "bg-emerald-100 text-emerald-700", order: 2 };
  }
  return { label: "Suit normalement", tone: "bg-slate-100 text-slate-600", order: 2 };
}

export default function SuiviEleves({ cours, elevesMap, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyByEleve, setHistoryByEleve] = useState({});
  const [selectedEleveId, setSelectedEleveId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const seances = cours?.seances ?? [];
        const fulls = await Promise.all(seances.map((s) => api.getSeanceFull(s.id)));
        if (cancelled) return;

        const byEleve = {};
        fulls.forEach((seanceFull) => {
          (seanceFull.questions ?? []).forEach((q) => {
            if (q.eleve_id == null) return;
            if (!byEleve[q.eleve_id]) byEleve[q.eleve_id] = [];
            byEleve[q.eleve_id].push({
              texte: q.texte,
              categorie: q.categorie,
              horodatage: q.horodatage,
              seanceDate: seanceFull.date,
            });
          });
        });

        Object.values(byEleve).forEach((qs) => qs.sort((a, b) => new Date(b.horodatage) - new Date(a.horodatage)));
        setHistoryByEleve(byEleve);
      } catch (err) {
        if (!cancelled) setError(err.message || "Erreur lors du chargement du suivi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cours]);

  const eleves = useMemo(() => {
    return Object.entries(historyByEleve)
      .map(([eleveId, questions]) => {
        const counts = { elementaire: 0, approfondie: 0, cours_precedent: 0 };
        questions.forEach((q) => {
          if (q.categorie && counts[q.categorie] !== undefined) counts[q.categorie] += 1;
        });
        const statut = computeStatut(counts);
        return {
          id: eleveId,
          nom: elevesMap[eleveId] ?? `Élève #${eleveId}`,
          questions,
          counts,
          statut,
        };
      })
      .sort((a, b) => a.statut.order - b.statut.order || b.questions.length - a.questions.length);
  }, [historyByEleve, elevesMap]);

  const selectedEleve = eleves.find((e) => e.id === selectedEleveId) ?? null;

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="grid h-full grid-cols-[1fr_380px] gap-6 p-6">
        {/* Colonne de gauche : liste des élèves */}
        <div className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          <div className="border-b border-pink-100 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Suivi des élèves</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cours?.titre} — statut calculé à partir des catégories de questions posées.
                </p>
              </div>
              <button
                onClick={onBack}
                className="shrink-0 rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
              >
                ← Retour aux questions
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading && <p className="text-center text-sm text-slate-400">Chargement…</p>}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            {!loading && !error && eleves.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
                Aucun élève n'a encore posé de question pour ce cours.
              </div>
            )}

            {eleves.map((eleve) => (
              <button
                key={eleve.id}
                onClick={() => setSelectedEleveId(eleve.id)}
                className={`w-full rounded-xl border p-4 text-left transition hover:shadow-md ${
                  selectedEleveId === eleve.id
                    ? "border-pink-300 bg-pink-50/60"
                    : "border-pink-100 bg-white hover:border-pink-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{eleve.nom}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {eleve.questions.length} question{eleve.questions.length > 1 ? "s" : ""} posée
                      {eleve.questions.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eleve.statut.tone}`}>
                    {eleve.statut.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(eleve.counts).map(
                    ([cat, count]) =>
                      count > 0 && (
                        <span
                          key={cat}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyle(cat)}`}
                        >
                          {categoryLabel(cat)} · {count}
                        </span>
                      )
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colonne de droite : historique détaillé de l'élève sélectionné */}
        <aside className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          <div className="border-b border-pink-100 p-6">
            <h2 className="text-xl font-bold text-slate-800">
              {selectedEleve ? selectedEleve.nom : "Historique"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedEleve
                ? "Toutes les questions posées par cet élève dans ce cours."
                : "Sélectionne un élève pour voir son historique."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {!selectedEleve && (
              <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
                Aucun élève sélectionné.
              </div>
            )}

            {selectedEleve?.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-700">{q.texte}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyle(q.categorie)}`}>
                    {categoryLabel(q.categorie)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(q.horodatage).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
