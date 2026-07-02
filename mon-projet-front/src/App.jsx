import { useState, useMemo } from 'react'
import EspaceEleve from './EspaceEleve';

//     ESPACE PROFESSEUR
function EspaceProfesseur() {
  // Données fictives (Mock Data)
  // A remplacer plus tard par les données provenant
  // de votre API / WebSocket.
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

  // catégories de questions
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

  // Questions épinglées
  const pinnedQuestions = questions.filter((q) => q.pinned);

  // Actions pour épingler
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
    <div className="h-full overflow-hidden bg-slate-50">
      <div className="grid h-full grid-cols-[1fr_340px] gap-6 p-6">

        {/* colonne de gauche */}
        <div className="flex min-h-0 flex-col rounded-2xl bg-pink shadow-sm">
          {/* Header */}
          <div className="border-b p-6">
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
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                Toutes
              </button>

              <button
                onClick={() => setFilter("unread")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "unread"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                Non lues
              </button>

              <button
                onClick={() => setFilter("answered")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === "answered"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                Répondues
              </button>
            </div>
          </div>

          {/* Liste qui peut etre scroller */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl border border-slate-200 bg-pink p-5 shadow-sm transition hover:shadow-md"
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
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {question.category}
                      </span>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-orange-700">
                        {question.recurrence} élève
                        {question.recurrence > 1 ? "s" : ""}
                      </span>
                      {question.answered && (
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-green-700">
                          Répondue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton épingler */}
                  <button
                    onClick={() => togglePin(question.id)}
                    className={`rounded-lg p-2 transition ${
                      question.pinned ? "bg-yellow-100" : "hover:bg-slate-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        question.pinned ? "text-yellow-600" : "text-slate-500"
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
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Marquer comme lue
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* colonne de droite */}
        <aside className="flex min-h-0 flex-col rounded-2xl bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-slate-800">
              Questions Épinglées
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Les questions prioritaires apparaissent ici.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {pinnedQuestions.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                Aucune question épinglée.
              </div>
            )}

            {pinnedQuestions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl bg-yellow-50 border border-yellow-200 p-4"
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
                    className="rounded-lg bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
                  >
                    Désépingler
                  </button>
                  <button
                    onClick={() => markAnswered(question.id)}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
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


function App() {
  // Cet état permet de savoir quelle page est actuellement active
  const [activePage, setActivePage] = useState('professeur');

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. LE BANDEAU LATÉRAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-4 border-r border-slate-800">
        
        {/* Partie Haute : Titre / Logo et Navigation principale */}
        <div className="flex flex-col gap-8">
          {/* Logo / Nom du projet */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              T
            </div>
            <span className="font-bold text-lg text-white tracking-wide">El Tandem Educacion</span>
          </div>

          {/* Menu de Navigation */}
          <nav className="flex flex-col gap-2">
            
            {/* Bouton Professeur */}
            <button
              onClick={() => setActivePage('professeur')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePage === 'professeur'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Professeur
            </button>

            {/* Bouton Élève */}
            <button
              onClick={() => setActivePage('eleve')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activePage === 'eleve'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Élève
            </button>

          </nav>
        </div>

        {/* Partie Basse : Paramètres */}
        <div className="border-t border-slate-800 pt-4">
          <button
            onClick={() => setActivePage('parametres')}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activePage === 'parametres'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
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
      {/* CORRECTION : Remplacement de overflow-y-auto par overflow-hidden pour que le sous-composant gère lui-même son défilement */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Barre de statut du haut (Header) */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 capitalize">
            Espace actuel &gt; {activePage}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Utilisateur Invité</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              UI
            </div>
          </div>
        </header>

        {/* Zone où le contenu change selon la page sélectionnée */}
        {/* CORRECTION : Remplacement de max-w-5xl, p-8, et auto-margin par un conteneur flex-1 h-full pour laisser EspaceProfesseur respirer */}
        <div className="flex-1 h-full min-h-0">
          
          {activePage === 'professeur' && <EspaceProfesseur />}

          {activePage === 'eleve' && <EspaceEleve />}

          {activePage === 'parametres' && (
            <div className="p-8 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Paramètres de l'application</h3>
              <p className="text-slate-600 mb-6">Ajustez les préférences d'affichage et gérez votre profil.</p>
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Mode sombre</h4>
                    <p className="text-xs text-slate-500">Changer le thème de l'interface.</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-300 rounded-full p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Notifications sonores</h4>
                    <p className="text-xs text-slate-500">Jouer un son lors d'une nouvelle réponse.</p>
                  </div>
                  <div className="w-11 h-6 bg-indigo-600 rounded-full p-1 cursor-pointer flex justify-end">
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