/* Petits helpers DOM/format réutilisés par les vues (élève). */
(function () {
  window.App = window.App || {};
  window.App.render = window.App.render || {};

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badgeLive() {
    return `<span class="badge badge--live">En direct</span>`;
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

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  window.App.render = { escapeHtml, badgeLive, formatDateCourt, formatHeure, formatDateHeure, qs };
})();
