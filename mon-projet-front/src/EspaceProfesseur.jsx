import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import api from "./api";
import SuiviEleves from "./SuiviEleves";
import DocumentsCours from "./DocumentsCours";

const categoryStyles = {
  cours_precedent: "bg-fuchsia-100 text-fuchsia-700",
  elementaire: "bg-pink-100 text-pink-700",
  approfondie: "bg-rose-100 text-rose-700",
};

const categoryLabels = {
  cours_precedent: "Cours précédent",
  elementaire: "Élémentaire",
  approfondie: "Approfondie",
};

function categoryStyle(categorie) {
  return categoryStyles[categorie] ?? "bg-slate-100 text-slate-500";
}

function categoryLabel(categorie) {
  return categorie ? categoryLabels[categorie] ?? categorie : "Non catégorisée";
}

const POLL_INTERVAL_MS = 4000;

// ==========================================================
// Écran de sélection du cours / de la séance à suivre
// ==========================================================
function EcranSelectionCours({ coursList, loading, error, onSelect }) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="w-full max-w-2xl rounded-2xl border border-pink-100 bg-white p-8 shadow-xl shadow-pink-200/40">
        <h1 className="text-center text-2xl font-bold text-slate-800">
          Choisis le cours à suivre
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sélectionne le cours pour voir les questions de sa séance en direct.
        </p>

        {loading && <p className="mt-6 text-center text-sm text-slate-400">Chargement…</p>}
        {error && (
          <p className="mt-6 text-center text-sm text-red-600">
            Impossible de charger les cours ({error}).
          </p>
        )}

        {!loading && !error && coursList.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">
            Aucun cours en base. Crée-en un via l'API (POST /cours) ou le seed.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          {coursList.map((cours) => (
            <button
              key={cours.id}
              onClick={() => onSelect(cours.id)}
              className="flex flex-col items-start gap-1 rounded-xl border-2 border-pink-100 bg-white p-4 text-left transition-all hover:border-pink-300 hover:bg-pink-50/40"
            >
              <span className="text-sm font-semibold text-slate-700">{cours.titre}</span>
              {cours.description && (
                <span className="text-xs text-slate-400 line-clamp-2">{cours.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// 👩‍🏫 ESPACE PROFESSEUR
// ==========================================================
export default function EspaceProfesseur() {
  const [coursList, setCoursList] = useState([]);
  const [loadingCours, setLoadingCours] = useState(true);
  const [coursError, setCoursError] = useState("");

  const [cours, setCours] = useState(null);
  const [seanceId, setSeanceId] = useState(null);
  const [selectError, setSelectError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [elevesMap, setElevesMap] = useState({});
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("questions"); // "questions" | "suivi" | "documents"

  // Etats purement locaux (pas de colonnes correspondantes cote backend) :
  // lu / repondue / epinglee, garde en memoire par id de question.
  const [localState, setLocalState] = useState({}); // { [questionId]: { read, answered, pinned } }

  const [syntheseQuestions, setSyntheseQuestions] = useState(null);
  const [syntheseCours, setSyntheseCours] = useState(null);
  const [genererLoading, setGenererLoading] = useState(null); // "questions" | "cours" | null
  const [genererError, setGenererError] = useState("");

  const pollRef = useRef(null);

  useEffect(() => {
    api
      .getCours()
      .then(setCoursList)
      .catch((err) => setCoursError(err.message))
      .finally(() => setLoadingCours(false));
  }, []);

  const handleSelectCours = useCallback(async (coursId) => {
    setSelectError("");
    try {
      const coursFull = await api.getCoursFull(coursId);
      if (!coursFull.seances || coursFull.seances.length === 0) {
        setSelectError("Ce cours n'a aucune séance pour le moment.");
        return;
      }
      const seances = coursFull.seances;
      const enCours = seances.find((s) => s.statut === "en_cours");
      const seance = enCours ?? seances[seances.length - 1];
      setCours(coursFull);
      setSeanceId(seance.id);
    } catch (err) {
      setSelectError(err.message || "Erreur lors de la sélection du cours.");
    }
  }, []);

  // ---- Polling des questions + des eleves ----
  useEffect(() => {
    if (!seanceId) return;

    const refresh = () => {
      api.getQuestions(seanceId).then(setQuestions).catch(() => {});
      api
        .getEleves()
        .then((eleves) => {
          const map = {};
          eleves.forEach((e) => {
            map[e.id] = e.nom;
          });
          setElevesMap(map);
        })
        .catch(() => {});
    };

    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [seanceId]);

  const getLocal = (id) => localState[id] ?? { read: false, answered: false, pinned: false };

  const updateLocal = (id, patch) => {
    setLocalState((prev) => ({ ...prev, [id]: { ...getLocal(id), ...patch } }));
  };

  const togglePin = (id) => updateLocal(id, { pinned: !getLocal(id).pinned });
  const markAnswered = (id) => updateLocal(id, { answered: true, pinned: false, read: true });
  const markRead = (id) => updateLocal(id, { read: true });

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case "unread":
        return questions.filter((q) => !getLocal(q.id).read && !getLocal(q.id).answered);
      case "answered":
        return questions.filter((q) => getLocal(q.id).answered);
      default:
        return questions;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, filter, localState]);

  const pinnedQuestions = questions.filter((q) => getLocal(q.id).pinned);

  const handleGenererSyntheseQuestions = async () => {
    setGenererLoading("questions");
    setGenererError("");
    try {
      const res = await api.genererSyntheseQuestions(seanceId);
      setSyntheseQuestions(res.texte_genere);
    } catch (err) {
      setGenererError(err.message || "Erreur lors de la génération.");
    } finally {
      setGenererLoading(null);
    }
  };

  const handleGenererSyntheseCours = async () => {
    setGenererLoading("cours");
    setGenererError("");
    try {
      const res = await api.genererSyntheseCours(seanceId);
      setSyntheseCours(res.texte_genere);
    } catch (err) {
      setGenererError(err.message || "Erreur lors de la génération.");
    } finally {
      setGenererLoading(null);
    }
  };

  if (!seanceId) {
    return (
      <EcranSelectionCours
        coursList={coursList}
        loading={loadingCours}
        error={coursError || selectError}
        onSelect={handleSelectCours}
      />
    );
  }

  if (view === "suivi") {
    return (
      <SuiviEleves
        cours={cours}
        elevesMap={elevesMap}
        onBack={() => setView("questions")}
      />
    );
  }

  if (view === "documents") {
    return (
      <DocumentsCours
        seanceId={seanceId}
        cours={cours}
        onBack={() => setView("questions")}
      />
    );
  }

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="grid h-full grid-cols-[1fr_340px] gap-6 p-6">

        {/* Colonne de gauche */}
        <div className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          <div className="border-b border-pink-100 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Questions des élèves
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cours?.titre} — mis à jour automatiquement toutes les {POLL_INTERVAL_MS / 1000}s.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setView("documents")}
                  className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100"
                >
                  Documents
                </button>
                <button
                  onClick={() => setView("suivi")}
                  className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100"
                >
                  Suivi des élèves
                </button>
                <button
                  onClick={() => {
                    setSeanceId(null);
                    setCours(null);
                    setView("questions");
                  }}
                  className="rounded-lg border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
                >
                  Changer de cours
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "all"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "unread"
                    ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                Non lues
              </button>
              <button
                onClick={() => setFilter("answered")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "answered"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                }`}
              >
                Répondues
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleGenererSyntheseQuestions}
                  disabled={genererLoading !== null}
                  className="rounded-full bg-fuchsia-50 px-4 py-2 text-sm font-medium text-fuchsia-700 hover:bg-fuchsia-100 disabled:opacity-60"
                >
                  {genererLoading === "questions" ? "Génération…" : "Synthèse des questions"}
                </button>
                <button
                  onClick={handleGenererSyntheseCours}
                  disabled={genererLoading !== null}
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  {genererLoading === "cours" ? "Génération…" : "Synthèse du cours"}
                </button>
              </div>
            </div>

            {genererError && <p className="mt-3 text-sm text-red-600">{genererError}</p>}
            {(syntheseQuestions || syntheseCours) && (
              <div className="mt-4 space-y-2">
                {syntheseQuestions && (
                  <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-fuchsia-700">Synthèse des questions : </span>
                    {syntheseQuestions}
                  </div>
                )}
                {syntheseCours && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-rose-700">Synthèse du cours : </span>
                    {syntheseCours}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredQuestions.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
                Aucune question pour ce filtre.
              </div>
            )}

            {filteredQuestions.map((question) => {
              const local = getLocal(question.id);
              const nom = question.eleve_id
                ? elevesMap[question.eleve_id] ?? `Élève #${question.eleve_id}`
                : "Anonyme";

              return (
                <div
                  key={question.id}
                  className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{nom}</h3>
                      <p className="mt-2 text-slate-600">{question.texte}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryStyle(question.categorie)}`}>
                          {categoryLabel(question.categorie)}
                        </span>
                        {local.answered && (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            Répondue
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => togglePin(question.id)}
                      className={`rounded-lg p-2 transition ${
                        local.pinned ? "bg-fuchsia-100" : "hover:bg-pink-50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${local.pinned ? "text-fuchsia-600" : "text-slate-500"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 4l5 5-3 1-4 6-2-2 6-4 1-3-3-3zM5 19l5-5"
                        />
                      </svg>
                    </button>
                  </div>

                  {!local.read && (
                    <button
                      onClick={() => markRead(question.id)}
                      className="mt-4 text-sm font-medium text-pink-600 hover:underline"
                    >
                      Marquer comme lue
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne de droite : épinglées */}
        <aside className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          <div className="border-b border-pink-100 p-6">
            <h2 className="text-xl font-bold text-slate-800">Questions Épinglées</h2>
            <p className="mt-1 text-sm text-slate-500">
              Les questions prioritaires apparaissent ici.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {pinnedQuestions.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
                Aucune question épinglée.
              </div>
            )}

            {pinnedQuestions.map((question) => {
              const nom = question.eleve_id
                ? elevesMap[question.eleve_id] ?? `Élève #${question.eleve_id}`
                : "Anonyme";
              return (
                <div
                  key={question.id}
                  className="rounded-xl bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200 p-4"
                >
                  <div className="font-semibold text-slate-800">{nom}</div>
                  <p className="mt-2 text-sm text-slate-600">{question.texte}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => togglePin(question.id)}
                      className="rounded-lg bg-white border border-pink-200 px-3 py-2 text-sm text-slate-700 hover:bg-pink-50"
                    >
                      Désépingler
                    </button>
                    <button
                      onClick={() => markAnswered(question.id)}
                      className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-2 text-sm text-white hover:from-pink-600 hover:to-rose-700"
                    >
                      Traitée
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </div>
    </div>
  );
}
