/* Service "seances". */
(function () {
  window.App = window.App || {};
  window.App.services = window.App.services || {};

  const { apiClient } = window.App.services;
  const IMMINENT_WINDOW_MIN = 30;

  function getSeancesByClasse(coursId) {
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

  /**
   * Renvoie le créneau le plus pertinent pour la carte "classe" du dashboard :
   * en priorité une séance en cours, sinon la prochaine séance planifiée
   * (avec un indicateur `imminente` si elle démarre dans moins de 30 min).
   */
  function getCreneauActif(coursId) {
    return apiClient.request(`/cours/${coursId}/creneau-actif`, {
      mockResolver: () => {
        const seances = window.App.data.seances.filter((s) => s.cours_id === Number(coursId));
        const enCours = seances.find((s) => s.statut === "en_cours");
        if (enCours) return { seance: { ...enCours }, enCours: true, imminente: false };

        const now = Date.now();
        const prochaine = seances
          .filter((s) => s.statut === "planifiee" && new Date(s.date).getTime() >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        if (!prochaine) return null;

        const minutesAvant = (new Date(prochaine.date).getTime() - now) / 60000;
        return {
          seance: { ...prochaine },
          enCours: false,
          imminente: minutesAvant <= IMMINENT_WINDOW_MIN,
        };
      },
    });
  }

  function demarrerSeance(seanceId) {
    return apiClient.request(`/seances/${seanceId}/demarrer`, {
      method: "POST",
      mockResolver: () => {
        const s = window.App.data.seances.find((x) => x.id === Number(seanceId));
        if (s) s.statut = "en_cours";
        return s ? { ...s } : null;
      },
    });
  }

  function terminerSeance(seanceId) {
    return apiClient.request(`/seances/${seanceId}/terminer`, {
      method: "POST",
      mockResolver: () => {
        const s = window.App.data.seances.find((x) => x.id === Number(seanceId));
        if (s) s.statut = "terminee";
        return s ? { ...s } : null;
      },
    });
  }

  window.App.services.seancesService = {
    getSeancesByClasse,
    getSeanceById,
    getCreneauActif,
    demarrerSeance,
    terminerSeance,
  };
})();
