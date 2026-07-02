(function () {
  const { coursService, seancesService, documentsService } = window.App.services;
  const { formatDateHeure, qs, escapeHtml } = window.App.render;

  const coursId = qs("coursId");
  const POLL_INTERVAL_MS = 15000;
  let pollHandle = null;

  function bascculerVersDirect(seanceId) {
    if (pollHandle) clearInterval(pollHandle);
    window.location.replace(`seance-direct.html?seanceId=${seanceId}`);
  }

  async function renderVuePreparee() {
    const [cours, documents] = await Promise.all([
      coursService.getCoursById(coursId),
      documentsService.getDocumentsByCours(coursId),
    ]);

    if (!cours) {
      document.getElementById("cours-title").textContent = "Cours introuvable";
      return;
    }

    document.getElementById("cours-title").textContent = cours.titre;
    document.getElementById("cours-meta").textContent = cours.professeur_nom;
    document.getElementById("agenda-box").textContent =
      cours.agenda || "Aucun agenda communiqué pour l'instant.";

    const listeEl = document.getElementById("documents-list");
    if (documents.length === 0) {
      listeEl.innerHTML = `<div class="empty-state">Aucun document partagé pour l'instant.</div>`;
    } else {
      listeEl.innerHTML = documents
        .map(
          (d) => `
          <div class="doc-row">
            <span class="doc-row__name">📄 ${escapeHtml(d.donnees.nom)}</span>
            <span class="text-muted text-sm">${d.donnees.taille} · ${formatDateHeure(d.created_at)}</span>
          </div>
        `
        )
        .join("");
    }
  }

  async function init() {
    const seanceEnCours = await seancesService.getSeanceEnCours(coursId);
    if (seanceEnCours) {
      bascculerVersDirect(seanceEnCours.id);
      return;
    }

    await renderVuePreparee();

    // Préfigure la mise à jour temps réel : si le professeur lance la
    // séance pendant que l'élève consulte cette page, on bascule sans
    // action de sa part (remplacera un abonnement WebSocket plus tard).
    pollHandle = setInterval(async () => {
      const s = await seancesService.getSeanceEnCours(coursId);
      if (s) bascculerVersDirect(s.id);
    }, POLL_INTERVAL_MS);
  }

  window.addEventListener("beforeunload", () => {
    if (pollHandle) clearInterval(pollHandle);
  });

  init();
})();
