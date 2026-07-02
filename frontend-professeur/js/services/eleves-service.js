/* Service "eleves". */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getElevesByClasse(coursId) {
    return apiClient.request(`/cours/${coursId}/eleves`, {
      mockResolver: () => {
        const c = window.App.data.cours.find((x) => x.id === Number(coursId));
        if (!c) return [];
        return window.App.data.eleves
          .filter((e) => c.eleve_ids.includes(e.id))
          .map((e) => ({ ...e }));
      },
    });
  }

  function getEleveById(eleveId) {
    return apiClient.request(`/eleves/${eleveId}`, {
      mockResolver: () => {
        const e = window.App.data.eleves.find((x) => x.id === Number(eleveId));
        return e ? { ...e } : null;
      },
    });
  }

  function classesEnDifficulte(coursId) {
    return apiClient.request(`/cours/${coursId}/eleves?statut=difficulte`, {
      mockResolver: () => {
        const c = window.App.data.cours.find((x) => x.id === Number(coursId));
        if (!c) return 0;
        return window.App.data.eleves.filter(
          (e) => c.eleve_ids.includes(e.id) && e.statut === "difficulte"
        ).length;
      },
    });
  }

  function getNotionsDifficulte(eleveId) {
    return apiClient.request(`/eleves/${eleveId}/notions-difficulte`, {
      mockResolver: () =>
        window.App.data.notionsDifficulte
          .filter((n) => n.eleve_id === Number(eleveId))
          .map((n) => ({ ...n })),
    });
  }

  window.App.services.elevesService = {
    getElevesByClasse,
    getEleveById,
    classesEnDifficulte,
    getNotionsDifficulte,
  };
})();
