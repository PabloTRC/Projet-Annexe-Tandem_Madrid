import { useState, useEffect, useCallback, useRef } from "react";
import api from "./api";

//Style pour les différentes types de classification de questions
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

//rafraîchissement
const POLL_INTERVAL_MS = 4000;

//Connexion élève : écran, nom + choix de cours, ..
function EcranConnexion({ coursList, loadingCours, coursError, onJoin, joining, joinError }) {
  const [name, setName] = useState("");
  const [selectedCoursId, setSelectedCoursId] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Merci de saisir un nom ou pseudo.");
      return;
    }
    if (!selectedCoursId) {
      setError("Merci de choisir un cours.");
      return;
    }
    setError("");
    onJoin(trimmed, selectedCoursId);
  };

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="w-full max-w-2xl rounded-2xl border border-pink-100 bg-white p-8 shadow-xl shadow-pink-200/40">

        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/40">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">
          Rejoindre la classe
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Saisis ton nom, puis choisis le cours que tu veux rejoindre.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div>
            <label htmlFor="student-name" className="mb-2 block text-sm font-medium text-slate-700">
              Nom / Pseudo
            </label>
            <input
              id="student-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lina, EmmaCoding…"
              autoFocus
              className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Choisis ton cours
            </label>

            {loadingCours && (
              <p className="text-sm text-slate-400">Chargement des cours…</p>
            )}

            {coursError && (
              <p className="text-sm text-red-600">
                Impossible de charger les cours ({coursError}). Vérifie que le backend tourne bien.
              </p>
            )}

            {!loadingCours && !coursError && coursList.length === 0 && (
              <p className="text-sm text-slate-400">Aucun cours disponible pour le moment.</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {coursList.map((cours) => {
                const isSelected = selectedCoursId === cours.id;
                return (
                  <button
                    key={cours.id}
                    type="button"
                    onClick={() => setSelectedCoursId(cours.id)}
                    className={`group relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md shadow-pink-500/20"
                        : "border-pink-100 bg-white hover:border-pink-300 hover:bg-pink-50/40"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? "text-pink-700" : "text-slate-700"
                      }`}
                    >
                      {cours.titre}
                    </span>
                    {cours.description && (
                      <span className="text-xs text-slate-400 line-clamp-2">
                        {cours.description}
                      </span>
                    )}

                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-white shadow-md">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {(error || joinError) && (
            <p className="text-sm text-red-600">{error || joinError}</p>
          )}

          <button
            type="submit"
            disabled={joining}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 active:scale-[0.98] disabled:opacity-60"
          >
            {joining ? "Connexion…" : "Rejoindre la classe virtuelle"}
          </button>
        </form>
      </div>
    </div>
  );
}

//Partage doc, synthèse à télécharger
function DocumentsEleve({ documents, seanceId }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-bold text-slate-700">
        Documents du cours ({documents.length})
      </h3>
      <div className="max-h-32 space-y-1.5 overflow-y-auto">
        {documents.map((doc) => {
          const nom = doc.donnees?.file_name || doc.donnees?.titre || `Document #${doc.id}`;
          const telechargeable = Boolean(doc.donnees?.file_path);
          return (
            <div key={doc.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-slate-600">📄 {nom}</span>
              {telechargeable ? (
                <a
                  href={api.downloadContenuUrl(seanceId, doc.id)}
                  className="shrink-0 rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700 hover:bg-pink-100"
                >
                  Télécharger
                </a>
              ) : (
                <span className="shrink-0 text-xs text-slate-400">{doc.type}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

//formulaire de questions
function FormulaireQuestion({ onSend, cours, sending }) {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setError("");
    try {
      await onSend(trimmed);
      setText("");
      setFeedback("Question envoyée ✓ (catégorisation par l'IA en cours…)");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-0 flex-col rounded-2xl border border-pink-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800">
            Poser une question au professeur
          </h2>
          {cours && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
              {cours.titre}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Votre question sera visible par toute la classe et catégorisée automatiquement.
        </p>
      </div>

      <label htmlFor="q-text" className="mb-2 text-sm font-medium text-slate-700">
        Votre question
      </label>
      <textarea
        id="q-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: Pouvez-vous réexpliquer la partie sur les suites géométriques ?"
        className="min-h-32 flex-1 resize-none rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        {feedback ? (
          <span className="text-sm font-medium text-emerald-600">{feedback}</span>
        ) : (
          <span className="text-xs text-slate-400">
            {text.length} caractère{text.length > 1 ? "s" : ""}
          </span>
        )}

        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
        >
          {sending ? "Envoi…" : "Envoyer la question"}
        </button>
      </div>
    </form>
  );
}

//rafraichissement questions 
function FluxQuestions({ questions, currentEleveId, elevesMap, cours }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-pink-100 bg-white shadow-sm">
      <div className="border-b border-pink-100 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800">
              Questions de la classe
              {cours && <span className="ml-2 text-pink-600">· {cours.titre}</span>}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Flux mis à jour automatiquement toutes les {POLL_INTERVAL_MS / 1000}s.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {questions.length} question{questions.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {questions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
            Aucune question pour le moment. Sois le premier à poser une question !
          </div>
        )}

        {questions.map((q) => {
          const isMine = q.eleve_id === currentEleveId;
          const nom = q.eleve_id ? elevesMap[q.eleve_id] ?? `Élève #${q.eleve_id}` : "Anonyme";

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                isMine
                  ? "border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50/60"
                  : "border-pink-100 bg-white hover:border-pink-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    isMine
                      ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {nom.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-slate-800">
                  {nom}
                  {isMine && <span className="ml-2 text-xs font-normal text-pink-600">(moi)</span>}
                </h3>
              </div>

              <p className="mt-3 text-slate-700">{q.texte}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryStyle(q.categorie)}`}>
                  {categoryLabel(q.categorie)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

//l'espace des élèves
export default function EspaceEleve() {
  const [coursList, setCoursList] = useState([]);
  const [loadingCours, setLoadingCours] = useState(true);
  const [coursError, setCoursError] = useState("");

  const [studentName, setStudentName] = useState(null);
  const [eleveId, setEleveId] = useState(null);
  const [cours, setCours] = useState(null);
  const [seanceId, setSeanceId] = useState(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [elevesMap, setElevesMap] = useState({});
  const [documents, setDocuments] = useState([]);
  const [sending, setSending] = useState(false);

  const pollRef = useRef(null);

  //Chargement de la liste des cours au montage
  useEffect(() => {
    api
      .getCours()
      .then((data) => setCoursList(data))
      .catch((err) => setCoursError(err.message))
      .finally(() => setLoadingCours(false));
  }, []);

  //Rejoindre un cours : créer l'élève + trouver une séance
  const handleJoin = useCallback(
    async (nom, coursId) => {
      setJoining(true);
      setJoinError("");
      try {
        const [eleve, coursFull] = await Promise.all([
          api.createEleve(nom),
          api.getCoursFull(coursId),
        ]);

        if (!coursFull.seances || coursFull.seances.length === 0) {
          setJoinError("Aucune séance disponible pour ce cours pour le moment.");
          setJoining(false);
          return;
        }

        //séance la plus récente : en priorité celle "en_cours", sinon la dernière
        const seances = coursFull.seances;
        const enCours = seances.find((s) => s.statut === "en_cours");
        const seance = enCours ?? seances[seances.length - 1];

        setEleveId(eleve.id);
        setStudentName(nom);
        setCours(coursFull);
        setSeanceId(seance.id);
      } catch (err) {
        setJoinError(err.message || "Impossible de rejoindre ce cours.");
      } finally {
        setJoining(false);
      }
    },
    []
  );

  //flux de questions + liste des élèves (pour les noms)
  useEffect(() => {
    if (!seanceId) return;

    const refresh = () => {
      api.getQuestions(seanceId).then(setQuestions).catch(() => {});
      api.getContenus(seanceId).then(setDocuments).catch(() => {});
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

  const handleSendQuestion = async (texte) => {
    setSending(true);
    try {
      const nouvelle = await api.createQuestion(seanceId, texte, eleveId);
      setQuestions((prev) => [nouvelle, ...prev]);
    } finally {
      setSending(false);
    }
  };

  //Non connexion d'un élève
  if (!studentName || !seanceId) {
    return (
      <EcranConnexion
        coursList={coursList}
        loadingCours={loadingCours}
        coursError={coursError}
        onJoin={handleJoin}
        joining={joining}
        joinError={joinError}
      />
    );
  }

  //Interface de cours
  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="grid h-full grid-cols-[1fr_2fr] gap-6 p-6">
        <div className="flex min-h-0 flex-col">
          <DocumentsEleve documents={documents} seanceId={seanceId} />
          <div className="min-h-0 flex-1">
            <FormulaireQuestion onSend={handleSendQuestion} cours={cours} sending={sending} />
          </div>
        </div>
        <FluxQuestions
          questions={questions}
          currentEleveId={eleveId}
          elevesMap={elevesMap}
          cours={cours}
        />
      </div>
    </div>
  );
}
