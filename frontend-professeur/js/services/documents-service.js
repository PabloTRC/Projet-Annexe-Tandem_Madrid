/* Service "contenus" (documents pédagogiques). */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getDocumentsByClasse(coursId) {
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

  function addDocument(coursId, seanceId, fichier) {
    return apiClient.request(`/cours/${coursId}/contenus`, {
      method: "POST",
      body: { seanceId, fichier },
      mockResolver: () => {
        const nextId = Math.max(0, ...window.App.data.contenus.map((c) => c.id)) + 1;
        const contenu = {
          id: nextId,
          cours_id: Number(coursId),
          seance_id: seanceId ? Number(seanceId) : null,
          type: "document",
          donnees: { nom: fichier.nom, taille: fichier.taille },
          created_at: new Date().toISOString(),
        };
        window.App.data.contenus.unshift(contenu);
        return { ...contenu };
      },
    });
  }

  window.App.services.documentsService = { getDocumentsByClasse, getDocumentsBySeance, addDocument };
})();
