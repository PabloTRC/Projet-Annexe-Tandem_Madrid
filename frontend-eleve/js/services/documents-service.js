/* Service "contenus" (documents pédagogiques) côté élève. */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getDocumentsByCours(coursId) {
    return apiClient.request(`/cours/${coursId}/contenus`, {
      mockResolver: () =>
        window.App.data.contenus
          .filter((c) => c.cours_id === Number(coursId))
          .map((c) => ({ ...c }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    });
  }

  function getDocumentsBySeance(seanceId) {
    return apiClient.request(`/seances/${seanceId}/contenus`, {
      mockResolver: () =>
        window.App.data.contenus.filter((c) => c.seance_id === Number(seanceId)).map((c) => ({ ...c })),
    });
  }

  window.App.services.documentsService = { getDocumentsByCours, getDocumentsBySeance };
})();
