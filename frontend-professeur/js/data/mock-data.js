/* ==========================================================================
   Assistant de Cours — données mockées (frontend professeur)

   Les noms de champs suivent le modèle backend (backend/app/models.py) :
   cours / seance / eleve / question / contenu, pour que la couche
   services/ puisse être branchée sur la vraie API sans changer les noms
   utilisés par les vues. "classe" (vocabulaire UI) == entité "cours".
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

  const professeurs = [
    { id: 1, nom: "Camille Dubois", email: "camille.dubois@ecole.fr" },
  ];

  const eleves = [
    { id: 1, nom: "Lina Belkacem", email: "lina.belkacem@eleve.fr", statut: "difficulte" },
    { id: 2, nom: "Yanis Morel", email: "yanis.morel@eleve.fr", statut: "a_jour" },
    { id: 3, nom: "Chloé Nguyen", email: "chloe.nguyen@eleve.fr", statut: "a_jour" },
    { id: 4, nom: "Hugo Petit", email: "hugo.petit@eleve.fr", statut: "pas_de_donnees" },
    { id: 5, nom: "Sofia Andrade", email: "sofia.andrade@eleve.fr", statut: "difficulte" },
    { id: 6, nom: "Maxime Roche", email: "maxime.roche@eleve.fr", statut: "a_jour" },
    { id: 7, nom: "Emma Girard", email: "emma.girard@eleve.fr", statut: "a_jour" },
    { id: 8, nom: "Noah Fontaine", email: "noah.fontaine@eleve.fr", statut: "a_jour" },
    { id: 9, nom: "Léa Castel", email: "lea.castel@eleve.fr", statut: "difficulte" },
    { id: 10, nom: "Tom Lefebvre", email: "tom.lefebvre@eleve.fr", statut: "pas_de_donnees" },
    { id: 11, nom: "Inès Salah", email: "ines.salah@eleve.fr", statut: "a_jour" },
    { id: 12, nom: "Adam Rousseau", email: "adam.rousseau@eleve.fr", statut: "a_jour" },
    { id: 13, nom: "Manon Bertrand", email: "manon.bertrand@eleve.fr", statut: "difficulte" },
    { id: 14, nom: "Nathan Caron", email: "nathan.caron@eleve.fr", statut: "a_jour" },
    { id: 15, nom: "Zoé Lemoine", email: "zoe.lemoine@eleve.fr", statut: "a_jour" },
  ];

  const cours = [
    {
      id: 1,
      professeur_id: 1,
      titre: "Terminale S1 — Mathématiques",
      agenda:
        "Suites numériques, limites, théorème des gendarmes, introduction aux probabilités conditionnelles.",
      eleve_ids: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 2,
      professeur_id: 1,
      titre: "1ère Générale — Mathématiques",
      agenda: "Dérivation, étude de fonctions, suites arithmétiques et géométriques.",
      eleve_ids: [7, 8, 9, 10, 11],
    },
    {
      id: 3,
      professeur_id: 1,
      titre: "Terminale Spé Maths — Groupe B",
      agenda: "Géométrie dans l'espace, produit scalaire, équations de plans.",
      eleve_ids: [12, 13, 14, 15],
    },
  ];

  // seance.statut: 'planifiee' | 'en_cours' | 'terminee'
  const seances = [
    // Terminale S1 — un créneau imminent aujourd'hui (dans 12 min)
    { id: 1, cours_id: 1, date: addMinutes(now, 12).toISOString(), statut: "planifiee" },
    { id: 2, cours_id: 1, date: atHour(-7, 9, 0), statut: "terminee" },
    { id: 3, cours_id: 1, date: atHour(-14, 9, 0), statut: "terminee" },
    { id: 4, cours_id: 1, date: atHour(7, 9, 0), statut: "planifiee" },

    // 1ère Générale — rien d'imminent
    { id: 5, cours_id: 2, date: atHour(2, 14, 0), statut: "planifiee" },
    { id: 6, cours_id: 2, date: atHour(-5, 14, 0), statut: "terminee" },

    // Terminale Spé Maths — séance en cours (démo "cours en direct")
    { id: 7, cours_id: 3, date: addMinutes(now, -18).toISOString(), statut: "en_cours" },
    { id: 8, cours_id: 3, date: atHour(-3, 10, 0), statut: "terminee" },
  ];

  const contenus = [
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
    {
      id: 3,
      cours_id: 2,
      seance_id: 6,
      type: "document",
      donnees: { nom: "fiche_derivation.pdf", taille: "610 Ko" },
      created_at: atHour(-5, 13, 50),
    },
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
  ];

  // categorie: 'elementaire' | 'approfondie' | 'cours_anterieur'
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
    {
      id: 2,
      seance_id: 7,
      cours_id: 3,
      eleve_id: 12,
      texte: "Est-ce que le produit scalaire est nul quand les vecteurs sont orthogonaux ?",
      horodatage: addMinutes(now, -7).toISOString(),
      categorie: "elementaire",
    },
    {
      id: 3,
      seance_id: 7,
      cours_id: 3,
      eleve_id: 14,
      texte: "Comment calculer l'équation d'un plan quand on a deux vecteurs directeurs ?",
      horodatage: addMinutes(now, -5).toISOString(),
      categorie: "approfondie",
    },
    // séances passées, pour l'historique du détail élève
    {
      id: 4,
      seance_id: 2,
      cours_id: 1,
      eleve_id: 1,
      texte: "Je ne comprends pas pourquoi la limite d'une suite géométrique de raison négative n'existe pas toujours.",
      horodatage: atHour(-7, 9, 20),
      categorie: "cours_anterieur",
    },
    {
      id: 5,
      seance_id: 3,
      cours_id: 1,
      eleve_id: 1,
      texte: "Comment on applique le théorème des gendarmes concrètement dans un exercice ?",
      horodatage: atHour(-14, 9, 25),
      categorie: "approfondie",
    },
    {
      id: 6,
      seance_id: 3,
      cours_id: 1,
      eleve_id: 5,
      texte: "Est-ce qu'une suite peut être à la fois majorée et non convergente ?",
      horodatage: atHour(-14, 9, 30),
      categorie: "approfondie",
    },
    {
      id: 7,
      seance_id: 6,
      cours_id: 2,
      eleve_id: 9,
      texte: "Je confonds toujours le taux d'accroissement et le nombre dérivé, vous pouvez réexpliquer ?",
      horodatage: atHour(-5, 14, 15),
      categorie: "cours_anterieur",
    },
  ];

  // Pool de questions "en attente" injectées par questions-service.js via setInterval
  // pour préfigurer un flux WebSocket. Regroupées avec les questions 1 et 3 ci-dessus
  // (même thématique) pour démontrer le regroupement par similarité.
  const questionsQueue = [
    {
      seance_id: 7,
      cours_id: 3,
      eleve_id: 15,
      texte: "Du coup pour l'équation d'un plan, il faut absolument deux vecteurs non colinéaires ?",
      categorie: "approfondie",
    },
    {
      seance_id: 7,
      cours_id: 3,
      eleve_id: 12,
      texte: "Comment on note un vecteur normal à un plan ?",
      categorie: "elementaire",
    },
    {
      seance_id: 7,
      cours_id: 3,
      eleve_id: 13,
      texte: "Est-ce que le cours sur le produit scalaire de l'an dernier est encore valable en terminale ?",
      categorie: "cours_anterieur",
    },
    {
      seance_id: 7,
      cours_id: 3,
      eleve_id: 14,
      texte: "Vous pouvez redonner la formule du produit scalaire avec les coordonnées ?",
      categorie: "elementaire",
    },
  ];

  const notionsDifficulte = [
    { eleve_id: 1, seance_id: 2, notion: "Limites de suites géométriques", date: atHour(-7, 9, 20) },
    { eleve_id: 1, seance_id: 3, notion: "Théorème des gendarmes", date: atHour(-14, 9, 25) },
    { eleve_id: 5, seance_id: 3, notion: "Suites majorées / convergence", date: atHour(-14, 9, 30) },
    { eleve_id: 9, seance_id: 6, notion: "Taux d'accroissement vs nombre dérivé", date: atHour(-5, 14, 15) },
    { eleve_id: 13, seance_id: 7, notion: "Équation cartésienne d'un plan", date: addMinutes(now, -9).toISOString() },
  ];

  const synthesesQuestions = [];
  const synthesesCours = [];

  window.App.data = {
    professeurs,
    eleves,
    cours,
    seances,
    contenus,
    questions,
    questionsQueue,
    notionsDifficulte,
    synthesesQuestions,
    synthesesCours,
  };
})();
