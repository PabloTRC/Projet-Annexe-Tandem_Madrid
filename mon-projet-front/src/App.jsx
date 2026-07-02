import { useState, useMemo } from 'react'
import EspaceEleve from './EspaceEleve';

// ==========================================================
// ⚙️  CONFIGURATION — Code d'accès à l'espace professeur
// (à changer facilement ici, ou plus tard à récupérer via API)
// ==========================================================
const CODE_ACCES_PROF = "TANDEM2025";


// ==========================================================
// 🌸 MOTIF FLEUR — petit ornement décoratif (5 pétales)
// ==========================================================
function FleurMotif({ className = "h-8 w-8", color = "#fbcfe8" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 5 pétales disposés autour du centre */}
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="11"
          rx="4.5"
          ry="8"
          fill={color}
          opacity="0.85"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      {/* Cœur */}
      <circle cx="20" cy="20" r="3.5" fill="#fde047" />
      <circle cx="20" cy="20" r="1.5" fill="#f59e0b" />
    </svg>
  );
}

// ==========================================================
// ⛏ LAMPE DE MINEUR — style lampe Davy avec flamme
// ==========================================================
function LampeMineur({ className = "h-10 w-7", color = "#fbcfe8" }) {
  return (
    <svg className={className} viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Anse */}
      <path
        d="M9 3 Q12 0.5 15 3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Chapeau */}
      <path d="M7 4 L17 4 L15.5 6.5 L8.5 6.5 Z" fill={color} opacity="0.85" />
      {/* Cage vitrée */}
      <rect x="7" y="6.5" width="10" height="10" rx="0.5" fill={color} opacity="0.18" />
      {/* Barres verticales de la cage */}
      <line x1="9" y1="6.5" x2="9" y2="16.5" stroke={color} strokeWidth="0.8" />
      <line x1="12" y1="6.5" x2="12" y2="16.5" stroke={color} strokeWidth="0.8" />
      <line x1="15" y1="6.5" x2="15" y2="16.5" stroke={color} strokeWidth="0.8" />
      {/* Cerclage horizontal */}
      <line x1="7" y1="11.5" x2="17" y2="11.5" stroke={color} strokeWidth="0.8" />
      {/* Flamme */}
      <ellipse cx="12" cy="11" rx="1.5" ry="3" fill="#fbbf24" opacity="0.95" />
      <ellipse cx="12" cy="10" rx="0.8" ry="1.6" fill="#fef3c7" opacity="0.9" />
      {/* Réservoir */}
      <path
        d="M6 16.5 L18 16.5 L17 22.5 Q12 24.5 7 22.5 Z"
        fill={color}
        opacity="0.75"
      />
      {/* Socle */}
      <rect x="8" y="23" width="8" height="1.5" rx="0.4" fill={color} opacity="0.7" />
    </svg>
  );
}

// ==========================================================
// 🎨 LOGO — Deux bulles de dialogue entrelacées
// Symbolique : l'échange prof ↔ élève (le "tandem")
// ==========================================================
function LogoTandem({ className = "h-8 w-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      {/* Bulle arrière (prof) */}
      <path
        d="M22 6h9a3 3 0 013 3v11a3 3 0 01-3 3h-3l-2 4-2-4h-2a3 3 0 01-3-3V9a3 3 0 013-3z"
        fill="url(#logo-grad)"
        opacity="0.55"
      />
      {/* Bulle avant (élève) */}
      <path
        d="M9 14h9a3 3 0 013 3v11a3 3 0 01-3 3h-2l-2 4-2-4H9a3 3 0 01-3-3V17a3 3 0 013-3z"
        fill="url(#logo-grad)"
      />
      {/* Petits points de dialogue */}
      <circle cx="10.5" cy="23" r="1.3" fill="white" />
      <circle cx="14" cy="23" r="1.3" fill="white" />
      <circle cx="17.5" cy="23" r="1.3" fill="white" />
    </svg>
  );
}


// ==========================================================
// 🔐 Écran de connexion — Espace professeur
// ==========================================================
function EcranConnexionProf({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === CODE_ACCES_PROF) {
      setError("");
      onSuccess();
    } else {
      setError("Code d'accès incorrect. Réessaie.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-6 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div
        className={`w-full max-w-md rounded-2xl border border-pink-100 bg-white p-8 shadow-xl shadow-pink-200/40 ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {/* Logo décoratif */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/40">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-center text-2xl font-bold text-slate-800">
          Espace Professeur
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Saisis ton code d'accès pour ouvrir l'interface enseignant.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label
              htmlFor="prof-code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Code d'accès
            </label>
            <input
              id="prof-code"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              autoFocus
              autoComplete="off"
              className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:from-pink-600 hover:to-rose-700 active:scale-[0.98]"
          >
            Accéder au tableau de bord
          </button>

          <p className="mt-2 text-center text-xs text-slate-400">
            Vous êtes un élève ? Utilisez l'onglet <span className="font-semibold text-pink-600">Élève</span> à gauche.
          </p>
        </form>
      </div>

      {/* Petite animation shake pour le mauvais code */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}


// ==========================================================
// 👩‍🏫 ESPACE PROFESSEUR
// ==========================================================
function EspaceProfesseur() {
  const initialQuestions = [
    {
      id: 1,
      student: "Emma",
      question: "Pouvez-vous réexpliquer la complexité de Dijkstra ?",
      category: "Algorithmes",
      recurrence: 3,
      read: false,
      answered: false,
      pinned: false,
    },
    {
      id: 2,
      student: "Lucas",
      question: "Pourquoi utilise-t-on des clés API ici ?",
      category: "React",
      recurrence: 5,
      read: false,
      answered: false,
      pinned: true,
    },
    {
      id: 3,
      student: "Sarah",
      question: "Quelle est la différence entre let et const ?",
      category: "JavaScript",
      recurrence: 1,
      read: true,
      answered: true,
      pinned: false,
    },
    {
      id: 4,
      student: "Noah",
      question: "Comment fonctionne Tailwind CSS v4 ?",
      category: "Tailwind",
      recurrence: 2,
      read: false,
      answered: false,
      pinned: false,
    },
    {
      id: 5,
      student: "Lina",
      question: "Peut-on utiliser plusieurs Context React ?",
      category: "React",
      recurrence: 4,
      read: false,
      answered: false,
      pinned: false,
    },
  ];

  const [questions, setQuestions] = useState(initialQuestions);
  const [filter, setFilter] = useState("all");

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case "unread":
        return questions.filter((q) => !q.read && !q.answered);
      case "answered":
        return questions.filter((q) => q.answered);
      default:
        return questions;
    }
  }, [questions, filter]);

  const pinnedQuestions = questions.filter((q) => q.pinned);

  const togglePin = (id) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, pinned: !q.pinned } : q
      )
    );
  };

  const markAnswered = (id) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, answered: true, pinned: false, read: true }
          : q
      )
    );
  };

  const markRead = (id) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, read: true } : q
      )
    );
  };

  return (
    <div className="h-full overflow-hidden bg-gradient-to-br from-pink-50/50 to-rose-50/30">
      <div className="grid h-full grid-cols-[1fr_340px] gap-6 p-6">

        {/* Colonne de gauche */}
        <div className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          {/* Header */}
          <div className="border-b border-pink-100 p-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Questions des élèves
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Gérez les questions reçues en temps réel.
            </p>

            {/* Filtres */}
            <div className="mt-5 flex gap-3">
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
            </div>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-pink-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {question.student}
                    </h3>
                    <p className="mt-2 text-slate-600">
                      {question.question}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                        {question.category}
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                        {question.recurrence} élève
                        {question.recurrence > 1 ? "s" : ""}
                      </span>
                      {question.answered && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          Répondue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton épingler */}
                  <button
                    onClick={() => togglePin(question.id)}
                    className={`rounded-lg p-2 transition ${
                      question.pinned ? "bg-fuchsia-100" : "hover:bg-pink-50"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        question.pinned ? "text-fuchsia-600" : "text-slate-500"
                      }`}
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

                {!question.read && (
                  <button
                    onClick={() => markRead(question.id)}
                    className="mt-4 text-sm font-medium text-pink-600 hover:underline"
                  >
                    Marquer comme lue
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne de droite : épinglées */}
        <aside className="flex min-h-0 flex-col rounded-2xl bg-white border border-pink-100 shadow-sm">
          <div className="border-b border-pink-100 p-6">
            <h2 className="text-xl font-bold text-slate-800">
              Questions Épinglées
            </h2>
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

            {pinnedQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200 p-4"
              >
                <div className="font-semibold text-slate-800">
                  {question.student}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {question.question}
                </p>
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
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}


// ==========================================================
// 🏠 APP — Racine
// ==========================================================
function App() {
  const [activePage, setActivePage] = useState('professeur');
  // 🔐 État d'authentification de l'espace prof
  const [profAuthenticated, setProfAuthenticated] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* 1. BANDEAU LATÉRAL (SIDEBAR) */}
      <aside className="relative w-64 bg-gradient-to-b from-rose-900 via-pink-900 to-fuchsia-900 text-pink-100 flex flex-col justify-between p-4 border-r border-pink-950/50 overflow-hidden">

        {/* 🌸⛏ Motifs décoratifs en fond (fleurs + lampes de mineur) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Fleurs */}
          <FleurMotif className="absolute -top-2 -right-3 h-16 w-16 opacity-15 rotate-12" />
          <FleurMotif className="absolute top-32 -left-3 h-10 w-10 opacity-10 -rotate-12" />
          <FleurMotif className="absolute top-1/2 right-2 h-8 w-8 opacity-15 rotate-45" />
          <FleurMotif className="absolute bottom-20 -right-4 h-14 w-14 opacity-15 -rotate-6" />
          <FleurMotif className="absolute bottom-2 left-2 h-8 w-8 opacity-15 rotate-12" />

          {/* Lampes de mineur */}
          <LampeMineur className="absolute top-24 right-3 h-12 w-8 opacity-20 -rotate-6" />
          <LampeMineur className="absolute top-[55%] left-3 h-14 w-10 opacity-15 rotate-6" />
          <LampeMineur className="absolute bottom-24 left-4 h-16 w-11 opacity-20 -rotate-3" />
          <LampeMineur className="absolute bottom-1 right-5 h-11 w-8 opacity-15 rotate-6" />
        </div>

        {/* Partie Haute : Logo + Navigation (au-dessus des motifs) */}
        <div className="relative flex flex-col gap-6">
          {/* Logo / Nom du projet + noms devs */}
          <div className="px-2 py-3 border-b border-pink-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur shadow-lg">
                <LogoTandem className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-white leading-tight tracking-wide">
                  El Tandem
                </span>
                <span className="text-xs text-pink-200/80 leading-tight">
                  Educacion
                </span>
              </div>
            </div>

            {/* 👩‍💻 Équipe de développement */}
            <div className="mt-4 pt-3 border-t border-pink-800/40">
              <div className="text-[10px] uppercase tracking-wider text-pink-300/80 font-semibold mb-1.5">
                Développé par
              </div>
              <ul className="text-[11.5px] text-pink-100/85 leading-relaxed space-y-0.5">
                <li>Keanu Toofa</li>
                <li>Amaury Viaud</li>
                <li>Pablo Thoumyre</li>
                <li>Amandine de Rocca</li>
              </ul>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="flex flex-col gap-2">

            {/* Bouton Professeur */}
            <button
              onClick={() => setActivePage('professeur')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePage === 'professeur'
                  ? 'bg-white text-pink-700 shadow-lg shadow-pink-950/40'
                  : 'hover:bg-white/10 hover:text-white text-pink-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Professeur
              {profAuthenticated && (
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" title="Connecté" />
              )}
            </button>

            {/* Bouton Élève */}
            <button
              onClick={() => setActivePage('eleve')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePage === 'eleve'
                  ? 'bg-white text-pink-700 shadow-lg shadow-pink-950/40'
                  : 'hover:bg-white/10 hover:text-white text-pink-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Élève
            </button>

          </nav>
        </div>

        {/* Partie Basse : Paramètres + Déconnexion prof (au-dessus des motifs) */}
        <div className="relative border-t border-pink-800/50 pt-4 space-y-2">
          {profAuthenticated && (
            <button
              onClick={() => {
                setProfAuthenticated(false);
                setActivePage('eleve');
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:text-white text-pink-200"
              title="Déconnecter la session professeur"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion prof
            </button>
          )}

          <button
            onClick={() => setActivePage('parametres')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activePage === 'parametres'
                ? 'bg-white text-pink-700 shadow-lg shadow-pink-950/40'
                : 'hover:bg-white/10 hover:text-white text-pink-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </button>
        </div>

      </aside>

      {/* 2. ZONE DE CONTENU PRINCIPALE */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Barre de statut du haut */}
        <header className="h-16 border-b border-pink-100 bg-white flex items-center justify-between px-8 shadow-sm flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 capitalize">
            Espace actuel &gt; <span className="text-pink-600">{activePage}</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {activePage === 'professeur' && profAuthenticated
                ? "Professeur connecté"
                : "Utilisateur Invité"}
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-pink-500/30">
              {activePage === 'professeur' && profAuthenticated ? "PR" : "UI"}
            </div>
          </div>
        </header>

        {/* Zone où le contenu change selon la page */}
        <div className="flex-1 h-full min-h-0">

          {/* 🔐 Espace prof — protégé par un code */}
          {activePage === 'professeur' && (
            profAuthenticated
              ? <EspaceProfesseur />
              : <EcranConnexionProf onSuccess={() => setProfAuthenticated(true)} />
          )}

          {activePage === 'eleve' && <EspaceEleve />}

          {activePage === 'parametres' && (
            <div className="p-8 max-w-5xl mx-auto bg-white rounded-2xl border border-pink-100 shadow-sm mt-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Paramètres de l'application</h3>
              <p className="text-slate-600 mb-6">Ajustez les préférences d'affichage et gérez votre profil.</p>
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Mode sombre</h4>
                    <p className="text-xs text-slate-500">Changer le thème de l'interface.</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-300 rounded-full p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Notifications sonores</h4>
                    <p className="text-xs text-slate-500">Jouer un son lors d'une nouvelle réponse.</p>
                  </div>
                  <div className="w-11 h-6 bg-pink-600 rounded-full p-1 cursor-pointer flex justify-end">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

export default App