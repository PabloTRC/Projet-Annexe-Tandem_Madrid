/* Service "seances" (côté élève : lecture seule). */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;

  function getSeancesByCours(coursId) {
    return apiClient.request(`/cours/${coursId}/seances`, {
      mockResolver: () =>
        window.App.data.seances
          .filter((s) => s.cours_id === Number(coursId))
          .map((s) => ({ ...s }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)),
    });
  }

  function getSeanceById(seanceId) {
    return apiClient.request(`/seances/${seanceId}`, {
      mockResolver: () => {
        const s = window.App.data.seances.find((x) => x.id === Number(seanceId));
        return s ? { ...s } : null;
      },
    });
  }

  /** Séance en cours pour ce cours, si elle existe. */
  function getSeanceEnCours(coursId) {
    return apiClient.request(`/cours/${coursId}/seance-en-cours`, {
      mockResolver: () => {
        const s = window.App.data.seances.find(
          (x) => x.cours_id === Number(coursId) && x.statut === "en_cours"
        );
        return s ? { ...s } : null;
      },
    });
  }

  /** Prochain créneau (planifié ou en cours), pour l'emploi du temps du dashboard. */
  function getCreneauActif(coursId) {
    return apiClient.request(`/cours/${coursId}/creneau-actif`, {
      mockResolver: () => {
        const seances = window.App.data.seances.filter((s) => s.cours_id === Number(coursId));
        const enCours = seances.find((s) => s.statut === "en_cours");
        if (enCours) return { seance: { ...enCours }, enCours: true };

        const now = Date.now();
        const prochaine = seances
          .filter((s) => s.statut === "planifiee" && new Date(s.date).getTime() >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        return prochaine ? { seance: { ...prochaine }, enCours: false } : null;
      },
    });
  }

  window.App.services.seancesService = { getSeancesByCours, getSeanceById, getSeanceEnCours, getCreneauActif };
})();
