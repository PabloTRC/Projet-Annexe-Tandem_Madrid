/* Service "cours" (= "classe" côté UI). */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getClasses() {
    return apiClient.request("/cours", {
      mockResolver: () => window.App.data.cours.map((c) => ({ ...c })),
    });
  }

  function getClasseById(coursId) {
    return apiClient.request(`/cours/${coursId}`, {
      mockResolver: () => {
        const c = window.App.data.cours.find((x) => x.id === Number(coursId));
        return c ? { ...c } : null;
      },
    });
  }

  function updateAgenda(coursId, agenda) {
    return apiClient.request(`/cours/${coursId}`, {
      method: "PATCH",
      body: { agenda },
      mockResolver: () => {
        const c = window.App.data.cours.find((x) => x.id === Number(coursId));
        if (c) c.agenda = agenda;
        return c ? { ...c } : null;
      },
    });
  }

  window.App.services.coursService = { getClasses, getClasseById, updateAgenda };
})();
