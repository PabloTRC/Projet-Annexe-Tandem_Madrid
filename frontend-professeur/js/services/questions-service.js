/* ==========================================================================
   Service "questions" — inclut la simulation du flux temps réel.

   `subscribeToLiveQuestions` préfigure un canal WebSocket : côté vraie API,
   cette fonction ouvrirait un socket et appellerait `onNewQuestion` à
   chaque message reçu. Ici, elle vide `App.data.questionsQueue` à
   intervalle régulier. La signature (callback + fonction de désabonnement)
   ne changera pas.
   ========================================================================== */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;
  const STOPWORDS = new Set([
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "est", "ce", "que",
    "qui", "on", "il", "elle", "je", "vous", "tu", "pour", "avec", "dans", "quand",
    "comment", "pourquoi", "est-ce", "ça", "a", "au", "aux", "sur", "pas", "plus",
    "toujours", "encore", "quel", "quelle", "vos", "notre", "cette", "cet",
  ]);

  function tokenize(texte) {
    return texte
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  }

  function jaccardSimilarity(wordsA, wordsB) {
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const intersection = [...setA].filter((w) => setB.has(w)).length;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  function getQuestionsBySeance(seanceId) {
    return apiClient.request(`/seances/${seanceId}/questions`, {
      mockResolver: () =>
        window.App.data.questions
          .filter((q) => q.seance_id === Number(seanceId))
          .map((q) => ({ ...q }))
          .sort((a, b) => new Date(a.horodatage) - new Date(b.horodatage)),
    });
  }

  function getQuestionsByEleve(eleveId) {
    return apiClient.request(`/eleves/${eleveId}/questions`, {
      mockResolver: () =>
        window.App.data.questions
          .filter((q) => q.eleve_id === Number(eleveId))
          .map((q) => ({ ...q }))
          .sort((a, b) => new Date(b.horodatage) - new Date(a.horodatage)),
    });
  }

  /**
   * Regroupe les questions dont le texte se ressemble (similarité de Jaccard
   * basique sur les mots pleins), pour donner un aperçu du regroupement LLM
   * final sans appel réseau.
   */
  function groupSimilarQuestions(questionsList, threshold = 0.22) {
    const withTokens = questionsList.map((q) => ({ question: q, tokens: tokenize(q.texte) }));
    const groups = [];

    withTokens.forEach(({ question, tokens }) => {
      let bestGroup = null;
      let bestScore = 0;

      groups.forEach((group) => {
        const score = jaccardSimilarity(tokens, group.tokens);
        if (score > bestScore) {
          bestScore = score;
          bestGroup = group;
        }
      });

      if (bestGroup && bestScore >= threshold) {
        bestGroup.questions.push(question);
        bestGroup.tokens = [...new Set([...bestGroup.tokens, ...tokens])];
      } else {
        groups.push({ tokens, questions: [question] });
      }
    });

    return groups
      .map((g) => ({ questions: g.questions, count: g.questions.length }))
      .sort((a, b) => b.count - a.count);
  }

  let intervalHandle = null;
  let nextQueueIndex = 0;

  function subscribeToLiveQuestions(seanceId, onNewQuestion, intervalMs = 9000) {
    stopLiveQuestions();

    intervalHandle = setInterval(() => {
      const queue = window.App.data.questionsQueue.filter((q) => q.seance_id === Number(seanceId));
      if (queue.length === 0) return;

      const template = queue[nextQueueIndex % queue.length];
      nextQueueIndex += 1;

      const nextId = Math.max(0, ...window.App.data.questions.map((q) => q.id)) + 1;
      const question = {
        id: nextId,
        seance_id: template.seance_id,
        cours_id: template.cours_id,
        eleve_id: template.eleve_id,
        texte: template.texte,
        categorie: template.categorie,
        horodatage: new Date().toISOString(),
      };

      window.App.data.questions.push(question);
      onNewQuestion({ ...question });
    }, intervalMs);

    return function unsubscribe() {
      stopLiveQuestions();
    };
  }

  function stopLiveQuestions() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  }

  const SYNTHESE_TEMPLATES = [
    "La majorité des questions portent sur la construction de l'équation d'un plan à partir de deux vecteurs directeurs : il peut être utile de reprendre la méthode pas à pas au tableau.",
    "Plusieurs élèves demandent des rappels sur le produit scalaire (formule en coordonnées, orthogonalité) — un exemple chiffré supplémentaire semble nécessaire.",
    "Une question porte sur un prérequis de l'année précédente : un rappel rapide en début de prochaine séance pourrait sécuriser le groupe.",
  ];

  function genererSyntheseQuestions(seanceId) {
    // latence volontairement plus longue : simule l'appel LLM
    return apiClient.request(`/seances/${seanceId}/synthese-questions`, {
      method: "POST",
      latencyMs: 1400,
      mockResolver: () => {
        const nextId = Math.max(0, ...window.App.data.synthesesQuestions.map((s) => s.id)) + 1;
        const texte_genere = SYNTHESE_TEMPLATES.join("\n\n");
        const synthese = {
          id: nextId,
          seance_id: Number(seanceId),
          texte_genere,
          horodatage: new Date().toISOString(),
        };
        window.App.data.synthesesQuestions.push(synthese);
        return { ...synthese };
      },
    });
  }

  window.App.services.questionsService = {
    getQuestionsBySeance,
    getQuestionsByEleve,
    groupSimilarQuestions,
    subscribeToLiveQuestions,
    stopLiveQuestions,
    genererSyntheseQuestions,
  };
})();
