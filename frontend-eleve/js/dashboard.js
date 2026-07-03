(function () {
  const { coursService, seancesService } = window.App.services;
  const { badgeLive, formatDateCourt, formatHeure, escapeHtml } = window.App.render;

  const scheduleEl = document.getElementById("schedule");
  const gridEl = document.getElementById("cours-grid");

  function isToday(dateIso) {
    return new Date(dateIso).toDateString() === new Date().toDateString();
  }

  function isWithinWeek(dateIso) {
    const d = new Date(dateIso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= startOfToday && d < endOfWeek;
  }

  async function renderSchedule() {
    const mesCours = await coursService.getMesCours();
    const seancesParCours = await Promise.all(
      mesCours.map(async (c) => ({ cours: c, seances: await seancesService.getSeancesByCours(c.id) }))
    );

    const slots = [];
    seancesParCours.forEach(({ cours, seances }) => {
      seances.forEach((s) => {
        if (s.statut === "en_cours" || (s.statut === "planifiee" && isWithinWeek(s.date))) {
          slots.push({ cours, seance: s });
        }
      });
    });
    slots.sort((a, b) => new Date(a.seance.date) - new Date(b.seance.date));

    if (slots.length === 0) {
      scheduleEl.innerHTML = `<p class="text-muted text-sm">Aucun créneau cette semaine.</p>`;
      return;
    }

    scheduleEl.innerHTML = slots
      .map(({ cours, seance }) => {
        const cls = seance.statut === "en_cours" ? "schedule-slot schedule-slot--active" : "schedule-slot";
        const jour = isToday(seance.date) ? "Aujourd'hui" : formatDateCourt(seance.date);
        return `
          <div class="${cls}">
            <div class="schedule-slot__time">${jour} · ${formatHeure(seance.date)}</div>
            <div class="schedule-slot__title">${escapeHtml(cours.titre)}</div>
          </div>
        `;
      })
      .join("");
  }

  async function renderCours() {
    const mesCours = await coursService.getMesCours();

    const cards = await Promise.all(
      mesCours.map(async (cours) => ({ cours, creneau: await seancesService.getCreneauActif(cours.id) }))
    );

    gridEl.innerHTML = cards
      .map(({ cours, creneau }) => {
        const creneauLabel = creneau
          ? creneau.enCours
            ? "En cours"
            : `${isToday(creneau.seance.date) ? "Aujourd'hui" : formatDateCourt(creneau.seance.date)} · ${formatHeure(creneau.seance.date)}`
          : "Aucun créneau prévu";

        return `
          <a class="card cours-card" href="cours.html?coursId=${cours.id}">
            <div class="cours-card__header">
              <div>
                <div class="cours-card__title">${escapeHtml(cours.titre)}</div>
                <div class="cours-card__meta">
                  <span>${escapeHtml(cours.professeur_nom)}</span>
                  <span>Prochain créneau : ${creneauLabel}</span>
                </div>
              </div>
              ${creneau && creneau.enCours ? badgeLive() : ""}
            </div>
          </a>
        `;
      })
      .join("");
  }

  renderSchedule();
  renderCours();
})();
