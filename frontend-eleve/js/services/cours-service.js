/* Service "cours" côté élève. */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getMesCours() {
    return apiClient.request("/moi/cours", {
      mockResolver: () => window.App.data.cours.map((c) => ({ ...c })),
    });
  }

  function getCoursById(coursId) {
    return apiClient.request(`/cours/${coursId}`, {
      mockResolver: () => {
        const c = window.App.data.cours.find((x) => x.id === Number(coursId));
        return c ? { ...c } : null;
      },
    });
  }

  function getEleveActuel() {
    return apiClient.request("/moi", {
      mockResolver: () => ({ ...window.App.data.eleveActuel }),
    });
  }

  window.App.services.coursService = { getMesCours, getCoursById, getEleveActuel };
})();
