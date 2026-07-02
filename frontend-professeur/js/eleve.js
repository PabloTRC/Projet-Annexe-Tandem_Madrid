(function () {
  const { elevesService, seancesService, questionsService } = window.App.services;
  const { badgeStatutEleve, labelCategorie, formatHeure, formatDateCourt, qs, escapeHtml } =
    window.App.render;

  const coursId = qs("coursId");
  const eleveId = qs("eleveId");

  document.getElementById("back-link").href = coursId ? `classe.html?coursId=${coursId}` : "index.html";

  async function init() {
    const [eleve, questions, notions] = await Promise.all([
      elevesService.getEleveById(eleveId),
      questionsService.getQuestionsByEleve(eleveId),
      elevesService.getNotionsDifficulte(eleveId),
    ]);

    if (!eleve) {
      document.getElementById("eleve-title").textContent = "Élève introuvable";
      return;
    }

    document.getElementById("eleve-title").textContent = eleve.nom;
    document.getElementById("eleve-badge").innerHTML = badgeStatutEleve(eleve.statut);

    const seanceIds = new Set([...questions.map((q) => q.seance_id), ...notions.map((n) => n.seance_id)]);

    if (seanceIds.size === 0) {
      document.getElementById("timeline").innerHTML =
        `<div class="empty-state">Aucune question ni notion signalée pour cet élève.</div>`;
      return;
    }

    const seances = await Promise.all([...seanceIds].map((id) => seancesService.getSeanceById(id)));
    seances.sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById("timeline").innerHTML = seances
      .map((seance) => {
        const questionsSeance = questions.filter((q) => q.seance_id === seance.id);
        const notionsSeance = notions.filter((n) => n.seance_id === seance.id);

        const notionsHtml = notionsSeance.length
          ? `<div style="margin-bottom: var(--space-2)">
              ${notionsSeance.map((n) => `<span class="notion-tag">⚠ ${escapeHtml(n.notion)}</span>`).join("")}
            </div>`
          : "";

        const questionsHtml = questionsSeance
          .map(
            (q) => `
            <div class="timeline-item">
              <div class="timeline-item__meta">
                <span class="badge badge--inconnu">${labelCategorie(q.categorie)}</span>
                <span class="text-muted text-sm">${formatHeure(q.horodatage)}</span>
              </div>
              <div>${escapeHtml(q.texte)}</div>
            </div>
          `
          )
          .join("");

        return `
          <div class="card card--padded timeline-seance">
            <div class="timeline-seance__date">${formatDateCourt(seance.date)}</div>
            ${notionsHtml}
            ${questionsHtml || `<p class="text-muted text-sm">Aucune question posée cette séance-là.</p>`}
          </div>
        `;
      })
      .join("");
  }

  init();
})();
