import { useState, useEffect } from "react";

// ==========================================================
// 📚 Liste des matières / classes disponibles
// (chaque entrée : id pour le back, label pour l'UI, symbole visuel)
// ==========================================================
const CLASSES = [
  { id: "mathematiques", label: "Mathématiques", symbol: "π" },
  { id: "anglais",       label: "Anglais",       symbol: "EN" },
  { id: "francais",      label: "Français",      symbol: "FR" },
  { id: "histoire",      label: "Histoire",      symbol: "H" },
  { id: "informatique",  label: "Informatique",  symbol: "</>" },
  { id: "physique",      label: "Physique",      symbol: "Φ" },
  { id: "latin",         label: "Latin",         symbol: "L" },
  { id: "espagnol",      label: "Espagnol",      symbol: "ES" },
  { id: "chinois",       label: "Chinois",       symbol: "中" },
];

// ==========================================================
// Palette de couleurs par catégorie de question (thème rose)
// ==========================================================
const categoryStyles = {
  "Général":   "bg-pink-100 text-pink-700",
  "Technique": "bg-fuchsia-100 text-fuchsia-700",
  "Exercice":  "bg-rose-100 text-rose-700",
};

// ==========================================================
// Données fictives (mock data)
// À remplacer par les données reçues du back via WebSocket
// ==========================================================
const mockQuestions = [
  {
    id: 1,
    student: "Emma",
    question: "Pouvez-vous réexpliquer la différence entre useState et useReducer ?",
    category: "Technique",
    answered: false,
  },
  {
    id: 2,
    student: "Lucas",
    question: "L'exercice 3 est-il à rendre pour la prochaine séance ?",
    category: "Exercice",
    answered: true,
  },
  {
    id: 3,
    student: "Sarah",
    question: "Est-ce que le cours de vendredi est maintenu ?",
    category: "Général",
    answered: false,
  },
];


// ==========================================================
// PHASE 1 — Écran de connexion élève (nom + choix de matière)
// ==========================================================
function EcranConnexion({ onJoin }) {
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Merci de saisir un nom ou pseudo.");
      return;
    }
    if (!selectedClass) {
      setError("Merci de choisir une matière.");
      return;
    }
    setError("");
    onJoin(trimmed, selectedClass);
  };

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="w-full max-w-2xl rounded-2xl border border-pink-100 bg-white p-8 shadow-xl shadow-pink-200/40">

        {/* Icône décorative */}
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

        {/* Titre */}
        <h1 className="text-center text-2xl font-bold text-slate-800">
          Rejoindre la classe
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Saisis ton nom, puis choisis la matière que tu veux rejoindre.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          {/* --- Nom --- */}
          <div>
            <label
              htmlFor="student-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
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

          {/* --- Grille des matières --- */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Choisis ta matière
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CLASSES.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md shadow-pink-500/20"
                        : "border-pink-100 bg-white hover:border-pink-300 hover:bg-pink-50/40"
                    }`}
                  >
                    {/* Symbole */}
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold transition ${
                        isSelected
                          ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/40"
                          : "bg-pink-100 text-pink-700 group-hover:bg-pink-200"
                      }`}
                    >
                      {cls.symbol}
                    </span>
                    {/* Nom de la matière */}
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? "text-pink-700" : "text-slate-700"
                      }`}
                    >
                      {cls.label}
                    </span>

                    {/* Checkmark si sélectionné */}
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-white shadow-md">
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

          {/* --- Message d'erreur --- */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* --- Submit --- */}
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 active:scale-[0.98]"
          >
            Rejoindre la classe virtuelle
          </button>
        </form>
      </div>
    </div>
  );
}


// ==========================================================
// PHASE 2 — Colonne gauche : formulaire de question (1/3)
// ==========================================================
function FormulaireQuestion({ onSend, classe }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Général");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed, category);

    setText("");
    setCategory("Général");
    setFeedback("Question envoyée ✓");
    setTimeout(() => setFeedback(""), 2000);
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
          {classe && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-pink-600 text-[9px] font-bold text-white">
                {classe.symbol}
              </span>
              {classe.label}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Votre question sera visible par toute la classe.
        </p>
      </div>

      {/* Catégorie */}
      <label
        htmlFor="q-category"
        className="mb-2 text-sm font-medium text-slate-700"
      >
        Catégorie
      </label>
      <select
        id="q-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 rounded-xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
      >
        <option>Général</option>
        <option>Technique</option>
        <option>Exercice</option>
      </select>

      {/* Texte */}
      <label
        htmlFor="q-text"
        className="mb-2 text-sm font-medium text-slate-700"
      >
        Votre question
      </label>
      <textarea
        id="q-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: Pouvez-vous réexpliquer la partie sur les hooks React ?"
        className="min-h-32 flex-1 resize-none rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
      />

      {/* Footer avec compteur / feedback + bouton envoyer */}
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
          disabled={!text.trim()}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
        >
          Envoyer la question
        </button>
      </div>
    </form>
  );
}


// ==========================================================
// PHASE 2 — Colonne droite : flux temps réel (2/3)
// ==========================================================
function FluxQuestions({ questions, currentStudent, classe }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-pink-100 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-pink-100 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800">
              Questions de la classe
              {classe && (
                <span className="ml-2 text-pink-600">· {classe.label}</span>
              )}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Flux en direct — mis à jour en temps réel.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {questions.length} question{questions.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {questions.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-pink-200 p-8 text-center text-sm text-slate-400">
            Aucune question pour le moment. Sois le premier à poser une question !
          </div>
        )}

        {questions.map((q) => {
          const isMine = q.student === currentStudent;
          const catStyle =
            categoryStyles[q.category] ?? "bg-slate-100 text-slate-700";

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                isMine
                  ? "border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50/60"
                  : "border-pink-100 bg-white hover:border-pink-200"
              }`}
            >
              {/* Auteur */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    isMine
                      ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {q.student.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-slate-800">
                  {q.student}
                  {isMine && (
                    <span className="ml-2 text-xs font-normal text-pink-600">
                      (moi)
                    </span>
                  )}
                </h3>
              </div>

              {/* Question */}
              <p className="mt-3 text-slate-700">{q.question}</p>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${catStyle}`}
                >
                  {q.category}
                </span>

                {q.answered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Répondue
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ==========================================================
// COMPOSANT PRINCIPAL — EspaceEleve
// ==========================================================
export default function EspaceEleve() {
  const [studentName, setStudentName] = useState(null);
  const [studentClass, setStudentClass] = useState(null); // { id, label, symbol }
  const [questions, setQuestions] = useState(mockQuestions);

  // ==========================================================
  // Écoute WebSocket (Socket.io) — À DÉCOMMENTER côté back prêt
  // ==========================================================
  useEffect(() => {
    // import { socket } from "./socket";   // ton instance io()
    //
    // // ⚠️ Le back peut filtrer par matière côté serveur en fonction du studentClass.id
    // // ou renvoyer un flux distinct par room "classe:mathematiques".
    //
    // socket.on("nouvelleQuestion", (question) => {
    //   setQuestions((prev) => [question, ...prev]);
    // });
    //
    // socket.on("questionRepondue", (id) => {
    //   setQuestions((prev) =>
    //     prev.map((q) => (q.id === id ? { ...q, answered: true } : q))
    //   );
    // });
    //
    // return () => {
    //   socket.off("nouvelleQuestion");
    //   socket.off("questionRepondue");
    // };
  }, []);

  // ==========================================================
  // Envoi d'une question via WebSocket + mise à jour optimiste
  // ==========================================================
  const handleSendQuestion = (text, category) => {
    const newQuestion = {
      id: Date.now(),
      student: studentName,
      classe: studentClass?.id, // envoyé au back pour le routage
      question: text,
      category,
      answered: false,
    };

    // ---- Envoi WebSocket ----
    // socket.emit("proposerQuestion", {
    //   student: studentName,
    //   classe: studentClass.id,
    //   question: text,
    //   category,
    // });

    // ---- MAJ optimiste locale ----
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  // ------- Phase 1 : élève non connecté -------
  if (!studentName || !studentClass) {
    return (
      <EcranConnexion
        onJoin={(nom, classe) => {
          setStudentName(nom);
          setStudentClass(classe);
        }}
      />
    );
  }

  // ------- Phase 2 : interface de cours -------
  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="grid h-full grid-cols-[1fr_2fr] gap-6 p-6">
        <FormulaireQuestion onSend={handleSendQuestion} classe={studentClass} />
        <FluxQuestions
          questions={questions}
          currentStudent={studentName}
          classe={studentClass}
        />
      </div>
    </div>
  );
}