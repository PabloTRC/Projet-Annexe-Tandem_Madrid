/* Service "questions" côté élève : poser une question + relire ses propres questions. */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getMesQuestionsBySeance(seanceId) {
    return apiClient.request(`/seances/${seanceId}/questions?mine=1`, {
      mockResolver: () =>
        window.App.data.questions
          .filter(
            (q) => q.seance_id === Number(seanceId) && q.eleve_id === window.App.data.eleveActuel.id
          )
          .map((q) => ({ ...q }))
          .sort((a, b) => new Date(a.horodatage) - new Date(b.horodatage)),
    });
  }

  function poserQuestion(seanceId, texte) {
    return apiClient.request(`/seances/${seanceId}/questions`, {
      method: "POST",
      body: { texte },
      mockResolver: () => {
        const nextId = Math.max(0, ...window.App.data.questions.map((q) => q.id)) + 1;
        const question = {
          id: nextId,
          seance_id: Number(seanceId),
          eleve_id: window.App.data.eleveActuel.id,
          texte,
          horodatage: new Date().toISOString(),
          categorie: null,
        };
        window.App.data.questions.push(question);
        return { ...question };
      },
    });
  }

  window.App.services.questionsService = { getMesQuestionsBySeance, poserQuestion };
})();
