(function () {
  const { coursService, elevesService, seancesService } = window.App.services;
  const { formatDateCourt, formatHeure, escapeHtml } = window.App.render;

  const scheduleEl = document.getElementById("schedule");
  const gridEl = document.getElementById("classes-grid");

  function isWithinWeek(dateIso) {
    const d = new Date(dateIso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= startOfToday && d < endOfWeek;
  }

  function isToday(dateIso) {
    const d = new Date(dateIso);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }

  async function renderSchedule() {
    const classes = await coursService.getClasses();
    const seancesParClasse = await Promise.all(
      classes.map(async (c) => ({
        cours: c,
        seances: await seancesService.getSeancesByClasse(c.id),
      }))
    );

    const slots = [];
    seancesParClasse.forEach(({ cours, seances }) => {
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
        const cls =
          seance.statut === "en_cours"
            ? "schedule-slot schedule-slot--active"
            : isImminent(seance)
            ? "schedule-slot schedule-slot--imminent"
            : "schedule-slot";
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

  function isImminent(seance) {
    if (seance.statut !== "planifiee") return false;
    const minutes = (new Date(seance.date).getTime() - Date.now()) / 60000;
    return minutes <= 30 && minutes >= 0;
  }

  async function renderClasses() {
    const classes = await coursService.getClasses();

    const cards = await Promise.all(
      classes.map(async (cours) => {
        const [eleves, creneau, nbDifficulte] = await Promise.all([
          elevesService.getElevesByClasse(cours.id),
          seancesService.getCreneauActif(cours.id),
          elevesService.classesEnDifficulte(cours.id),
        ]);
        return { cours, eleves, creneau, nbDifficulte };
      })
    );

    gridEl.innerHTML = cards
      .map(({ cours, eleves, creneau, nbDifficulte }) => {
        const creneauLabel = creneau
          ? creneau.enCours
            ? "En cours"
            : `${isToday(creneau.seance.date) ? "Aujourd'hui" : formatDateCourt(creneau.seance.date)} · ${formatHeure(creneau.seance.date)}`
          : "Aucun créneau prévu";

        const showLaunch = creneau && (creneau.enCours || creneau.imminente);
        const launchLabel = creneau && creneau.enCours ? "Reprendre le cours" : "Lancer le cours";

        return `
          <div class="card classe-card">
            <div class="classe-card__header">
              <div>
                <div class="classe-card__title">${escapeHtml(cours.titre)}</div>
                <div class="classe-card__meta">
                  <span>${eleves.length} élèves</span>
                  <span>Prochain créneau : ${creneauLabel}</span>
                </div>
              </div>
              ${nbDifficulte > 0 ? `<span class="badge badge--difficulte">${nbDifficulte} en difficulté</span>` : ""}
            </div>
            <div class="row" style="gap: var(--space-2)">
              <a class="btn btn--sm" href="classe.html?coursId=${cours.id}">Voir la classe</a>
              ${
                showLaunch
                  ? `<button class="btn btn--sm btn--live" data-launch="${cours.id}" data-seance="${creneau.seance.id}" data-encours="${creneau.enCours}">${launchLabel}</button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");

    gridEl.querySelectorAll("[data-launch]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const seanceId = btn.dataset.seance;
        const enCours = btn.dataset.encours === "true";
        btn.disabled = true;
        if (!enCours) {
          await window.App.services.seancesService.demarrerSeance(seanceId);
        }
        window.location.href = `seance-direct.html?seanceId=${seanceId}`;
      });
    });
  }

  renderSchedule();
  renderClasses();
})();
