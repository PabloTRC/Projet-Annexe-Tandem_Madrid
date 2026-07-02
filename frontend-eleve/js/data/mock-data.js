/* ==========================================================================
   Assistant de Cours — données mockées (frontend élève)

   Mêmes conventions de nommage que côté professeur (backend/app/models.py).
   `eleveActuel` simule la session connectée : pas d'authentification réelle
   dans ce MVP, l'app se comporte comme si Manon Bertrand était connectée.
   ========================================================================== */

(function () {
  window.App = window.App || {};

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  function atHour(dayOffset, hour, minute) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  const now = new Date();

  const eleveActuel = { id: 13, nom: "Manon Bertrand", email: "manon.bertrand@eleve.fr" };

  const cours = [
    {
      id: 3,
      professeur_nom: "Camille Dubois",
      titre: "Terminale Spé Maths — Groupe B",
      agenda: "Géométrie dans l'espace, produit scalaire, équations de plans.",
    },
    {
      id: 1,
      professeur_nom: "Camille Dubois",
      titre: "Terminale S1 — Mathématiques",
      agenda:
        "Suites numériques, limites, théorème des gendarmes, introduction aux probabilités conditionnelles.",
    },
  ];

  // seance.statut: 'planifiee' | 'en_cours' | 'terminee'
  const seances = [
    { id: 7, cours_id: 3, date: addMinutes(now, -18).toISOString(), statut: "en_cours" },
    { id: 8, cours_id: 3, date: atHour(-3, 10, 0), statut: "terminee" },

    { id: 1, cours_id: 1, date: addMinutes(now, 12).toISOString(), statut: "planifiee" },
    { id: 2, cours_id: 1, date: atHour(-7, 9, 0), statut: "terminee" },
    { id: 3, cours_id: 1, date: atHour(-14, 9, 0), statut: "terminee" },
  ];

  const contenus = [
    {
      id: 4,
      cours_id: 3,
      seance_id: 7,
      type: "document",
      donnees: { nom: "geometrie_espace_support.pdf", taille: "1.1 Mo" },
      created_at: addMinutes(now, -17).toISOString(),
    },
    {
      id: 5,
      cours_id: 3,
      seance_id: 8,
      type: "document",
      donnees: { nom: "produit_scalaire_rappel.pdf", taille: "540 Ko" },
      created_at: atHour(-3, 9, 50),
    },
    {
      id: 1,
      cours_id: 1,
      seance_id: 2,
      type: "document",
      donnees: { nom: "chap12_suites_numeriques.pdf", taille: "1.4 Mo" },
      created_at: atHour(-7, 8, 40),
    },
    {
      id: 2,
      cours_id: 1,
      seance_id: 3,
      type: "document",
      donnees: { nom: "exercices_limites.pdf", taille: "820 Ko" },
      created_at: atHour(-14, 8, 45),
    },
  ];

  // Questions déjà posées par l'élève connecté pendant la séance en cours.
  const questions = [
    {
      id: 1,
      seance_id: 7,
      cours_id: 3,
      eleve_id: 13,
      texte: "Comment on retrouve l'équation cartésienne du plan à partir de deux vecteurs directeurs ?",
      horodatage: addMinutes(now, -9).toISOString(),
      categorie: "approfondie",
    },
  ];

  window.App.data = { eleveActuel, cours, seances, contenus, questions };
})();
