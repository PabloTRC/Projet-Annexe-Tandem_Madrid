/* Petits helpers DOM/format réutilisés par les vues (prof). */
(function () {
  window.App = window.App || {};
  window.App.render = window.App.render || {};

  const STATUT_LABELS = {
    a_jour: "À jour",
    difficulte: "En difficulté",
    pas_de_donnees: "Pas de données",
  };

  const STATUT_BADGE_CLASS = {
    a_jour: "badge--ok",
    difficulte: "badge--difficulte",
    pas_de_donnees: "badge--inconnu",
  };

  const CATEGORIE_LABELS = {
    elementaire: "Élémentaire",
    approfondie: "Approfondie",
    cours_anterieur: "Cours antérieur",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badgeStatutEleve(statut) {
    const label = STATUT_LABELS[statut] || "Pas de données";
    const cls = STATUT_BADGE_CLASS[statut] || "badge--inconnu";
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function badgeLive() {
    return `<span class="badge badge--live">En direct</span>`;
  }

  function labelCategorie(categorie) {
    return CATEGORIE_LABELS[categorie] || "Non classée";
  }

  function formatDateCourt(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  }

  function formatHeure(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDateHeure(isoString) {
    return `${formatDateCourt(isoString)} · ${formatHeure(isoString)}`;
  }

  function debounce(fn, delayMs) {
    let handle;
    return function debounced(...args) {
      clearTimeout(handle);
      handle = setTimeout(() => fn.apply(this, args), delayMs);
    };
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  window.App.render = {
    escapeHtml,
    badgeStatutEleve,
    badgeLive,
    labelCategorie,
    formatDateCourt,
    formatHeure,
    formatDateHeure,
    debounce,
    qs,
  };
})();
