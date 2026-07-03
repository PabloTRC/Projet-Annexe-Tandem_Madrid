import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import api from "./api";
import { connectSeanceSocket } from "./ws";
import SuiviEleves from "./SuiviEleves";
import DocumentsCours from "./DocumentsCours";
import SynthesesAuto, { AUTO_INTERVAL_MS } from "./SynthesesAuto";
import GestionEleves from "./GestionEleves";

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

// ==========================================================
// Formulaire d'ajout d'une classe (cours)
// ==========================================================
function FormulaireAjoutClasse({ onCreate, disabled }) {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = titre.trim();
    if (!trimmed) {
      setError("Le nom de la classe est obligatoire.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await onCreate(trimmed, description.trim());
      setTitre("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(err.message || "Impossible de créer cette classe.");
    } finally {
      setCreating(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="mt-6 w-full rounded-xl border-2 border-dashed border-pink-200 py-3 text-sm font-semibold text-pink-600 transition hover:border-pink-400 hover:bg-pink-50/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Ajouter une classe
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border-2 border-pink-200 bg-pink-50/30 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Nouvelle classe</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Annuler
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Nom de la classe (ex : 3ème A - Mathématiques)"
          autoFocus
          className="rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          rows={2}
          className="resize-none rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={creating}
        className="mt-3 w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 disabled:opacity-60"
      >
        {creating ? "Création…" : "Créer la classe"}
      </button>
    </form>
  );
}

// ==========================================================
// Écran de sélection du cours / de la séance à suivre
// ==========================================================
function EcranSelectionCours({ coursList, loading, error, onSelect, onCreate, creatingDisabled }) {
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
            Aucune classe pour l'instant. Ajoutes-en une ci-dessous.
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

        <FormulaireAjoutClasse onCreate={onCreate} disabled={creatingDisabled} />
        {creatingDisabled && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Aucun compte professeur trouvé en base — impossible de créer une classe pour l'instant.
          </p>
        )}
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

  // Compte professeur utilise pour creer les classes. Pas d'authentification
  // pour l'instant : on prend le premier professeur trouve en base.
  const [professeurId, setProfesseurId] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [elevesMap, setElevesMap] = useState({});
  const [elevesEnLigne, setElevesEnLigne] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("questions"); // "questions" | "suivi" | "documents" | "auto" | "eleves"

  const elevesMapRef = useRef({});
  useEffect(() => {
    elevesMapRef.current = elevesMap;
  }, [elevesMap]);

  // Synthese automatique des questions, toutes les 20 minutes tant qu'une
  // seance est suivie (independant de l'onglet affiche).
  const [autoSyntheses, setAutoSyntheses] = useState([]);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoError, setAutoError] = useState("");
  const [nextAutoAt, setNextAutoAt] = useState(null);

  // Etats purement locaux (pas de colonnes correspondantes cote backend) :
  // lu / repondue / epinglee, garde en memoire par id de question.
  const [localState, setLocalState] = useState({}); // { [questionId]: { read, answered, pinned } }

  const [syntheseQuestions, setSyntheseQuestions] = useState(null);
  const [syntheseCours, setSyntheseCours] = useState(null);
  const [genererLoading, setGenererLoading] = useState(null); // "questions" | "cours" | null
  const [genererError, setGenererError] = useState("");

  useEffect(() => {
    api
      .getCours()
      .then(setCoursList)
      .catch((err) => setCoursError(err.message))
      .finally(() => setLoadingCours(false));

    api
      .getProfesseurs()
      .then((list) => {
        if (list.length > 0) setProfesseurId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleCreateCours = useCallback(
    async (titre, description) => {
      if (!professeurId) {
        throw new Error("Aucun compte professeur trouvé en base.");
      }
      const nouveauCours = await api.createCours(professeurId, titre, description);
      setCoursList((prev) => [...prev, nouveauCours]);
      return nouveauCours;
    },
    [professeurId]
  );

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

  // ---- Chargement initial (historique) + connexion WebSocket temps réel ----
  // Une seule connexion WS remplace tout le polling : questions, présence
  // (élèves en ligne) et synthèses arrivent au fil de l'eau sur le même
  // canal. Pas d'eleveId ici : cette connexion est identifiée comme
  // "professeur" côté serveur (elle ne compte pas dans la présence élèves).
  useEffect(() => {
    if (!seanceId) return;
    let cancelled = false;

    function refreshElevesMap() {
      api
        .getEleves()
        .then((eleves) => {
          if (cancelled) return;
          const map = {};
          eleves.forEach((e) => {
            map[e.id] = e.nom;
          });
          setElevesMap(map);
        })
        .catch(() => {});
    }

    api.getQuestions(seanceId).then((qs) => !cancelled && setQuestions(qs)).catch(() => {});
    refreshElevesMap();

    const socket = connectSeanceSocket(seanceId, {
      onOpen: () => setWsConnected(true),
      onClose: () => setWsConnected(false),
      onMessage: (message) => {
        switch (message.type) {
          case "question_created":
          case "question_updated": {
            const q = message.data;
            setQuestions((prev) => {
              const exists = prev.some((x) => x.id === q.id);
              return exists ? prev.map((x) => (x.id === q.id ? q : x)) : [...prev, q];
            });
            if (q.eleve_id != null && !elevesMapRef.current[q.eleve_id]) {
              refreshElevesMap();
            }
            break;
          }
          case "presence_snapshot":
            setElevesEnLigne(message.eleves ?? []);
            break;
          case "presence_join":
            setElevesEnLigne((prev) =>
              prev.some((e) => e.id === message.eleve.id) ? prev : [...prev, message.eleve]
            );
            break;
          case "presence_leave":
            setElevesEnLigne((prev) => prev.filter((e) => e.id !== message.eleve_id));
            break;
          case "synthese_questions": {
            const s = message.data;
            setSyntheseQuestions(s.texte_genere);
            setAutoSyntheses((prev) =>
              prev.some((x) => x.id === s.id)
                ? prev
                : [{ id: s.id, texte: s.texte_genere, horodatage: s.horodatage }, ...prev]
            );
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("Nouvelle synthèse des questions", {
                body: s.texte_genere.slice(0, 140),
              });
            }
            break;
          }
          case "synthese_cours":
            setSyntheseCours(message.data.texte_genere);
            break;
          default:
            break;
        }
      },
    });

    return () => {
      cancelled = true;
      socket.close();
    };
  }, [seanceId]);

  // ---- Demande la permission de notification navigateur (une seule fois) ----
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ---- Synthese automatique des questions, toutes les 20 minutes ----
  // NB: la mise a jour de autoSyntheses/syntheseQuestions + la notification
  // sont gerees par le handler WS "synthese_questions" ci-dessus (le client
  // qui declenche la generation recoit aussi le broadcast) : ici on se
  // contente de declencher la generation cote serveur et de gerer le
  // chargement/l'erreur.
  const genererSyntheseAuto = useCallback(async () => {
    if (!seanceId) return;
    setAutoGenerating(true);
    setAutoError("");
    try {
      await api.genererSyntheseQuestions(seanceId);
    } catch (err) {
      setAutoError(err.message || "Erreur lors de la génération automatique de la synthèse.");
    } finally {
      setAutoGenerating(false);
    }
  }, [seanceId]);

  useEffect(() => {
    if (!seanceId) return;
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      setAutoSyntheses([]);
      setNextAutoAt(Date.now() + AUTO_INTERVAL_MS);
    })();

    const interval = setInterval(() => {
      genererSyntheseAuto();
      setNextAutoAt(Date.now() + AUTO_INTERVAL_MS);
    }, AUTO_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [seanceId, genererSyntheseAuto]);

  const handleGenererSyntheseAutoMaintenant = () => {
    genererSyntheseAuto();
    setNextAutoAt(Date.now() + AUTO_INTERVAL_MS);
  };

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
        onCreate={handleCreateCours}
        creatingDisabled={!professeurId}
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

  if (view === "auto") {
    return (
      <SynthesesAuto
        syntheses={autoSyntheses}
        nextRunAt={nextAutoAt}
        generating={autoGenerating}
        error={autoError}
        onGenerateNow={handleGenererSyntheseAutoMaintenant}
        onBack={() => setView("questions")}
      />
    );
  }

  if (view === "eleves") {
    return <GestionEleves cours={cours} onBack={() => setView("questions")} />;
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
                <p className="mt-1 text-sm text-slate-500">{cours?.titre}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      wsConnected
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        wsConnected ? "animate-pulse bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {wsConnected ? "Connecté en direct" : "Reconnexion en cours…"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    {elevesEnLigne.length} élève{elevesEnLigne.length > 1 ? "s" : ""} en ligne
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setView("eleves")}
                  className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100"
                >
                  Élèves
                </button>
                <button
                  onClick={() => setView("auto")}
                  className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-100"
                >
                  Synthèses auto {autoSyntheses.length > 0 && `(${autoSyntheses.length})`}
                </button>
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

        {/* Colonne de droite : élèves en ligne + épinglées */}
        <aside className="flex min-h-0 flex-col gap-6">
          <div className="max-h-56 flex flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
            <div className="border-b border-pink-100 p-4">
              <h2 className="text-sm font-bold text-slate-700">
                Élèves en ligne ({elevesEnLigne.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {elevesEnLigne.length === 0 ? (
                <p className="p-2 text-center text-xs text-slate-400">
                  Aucun élève en ligne pour le moment.
                </p>
              ) : (
                elevesEnLigne.map((eleve) => (
                  <div
                    key={eleve.id}
                    className="flex items-center gap-2 rounded-lg bg-emerald-50/60 px-2.5 py-1.5 text-sm text-slate-700"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {eleve.nom}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
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
          </div>
        </aside>

      </div>
    </div>
  );
}
