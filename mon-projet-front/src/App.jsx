import { useState } from 'react'
import './App.css'


function App() {
  // Cet état permet de savoir quelle page est actuellement active
  const [activePage, setActivePage] = useState('professeur');

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
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
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Barre de statut du haut (Header) */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shadow-sm">
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
        <div className="p-8 max-w-5xl w-full mx-auto">
          
          {activePage === 'professeur' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              
            </div>
          )}

          {activePage === 'eleve' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              
            </div>
          )}

          {activePage === 'parametres' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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

export default App;
